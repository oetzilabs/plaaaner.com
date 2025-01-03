import { createMiddleware } from "@solidjs/start/middleware";
import { Session, User, verifyRequestOrigin } from "lucia";
import { appendHeader, getCookie, getEvent, getHeader } from "vinxi/http";
import { lucia } from "./lib/auth";

export default createMiddleware({
  onRequest: async () => {
    const event = getEvent();
    if (event.node.req.method !== "GET") {
      const originHeader = getHeader(event, "Origin") ?? null;
      const hostHeader = getHeader(event, "Host") ?? null;
      if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
        event.node.res.writeHead(403).end();
        return;
      }
    }

    const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
    if (!sessionId) {
      event.context.session = null;
      event.context.user = null;
      return;
    }

    const { session, user } = await lucia.validateSession(sessionId);

    if (session && session.fresh) {
      appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
    }

    if (!session) {
      console.warn("Session not found, creating a blank one");
      appendHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
    }

    event.context.session = session;
    event.context.user = user;
  },
});

declare module "vinxi/http" {
  interface H3EventContext {
    user: User | null;
    session: Session | null;
  }
}
