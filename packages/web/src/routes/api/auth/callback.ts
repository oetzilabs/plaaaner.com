import { lucia } from "@/lib/auth";
import type { APIEvent } from "@solidjs/start/server";
import { appendHeader, sendRedirect } from "vinxi/http";

export async function GET(e: APIEvent) {
  const event = e.nativeEvent;
  const url = new URL(e.request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return sendRedirect(event, "/auth/error?error=missing_code", 303);
  }
  // console.log({ code });

  const { access_token } = await fetch(`${import.meta.env.VITE_AUTH_URL}/token`, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: "google",
      code,
      redirect_uri: `${url.origin}${url.pathname}`,
    }),
  }).then((r) => r.json());

  if (!access_token) {
    return sendRedirect(event, "/auth/error?error=missing_access_token", 303);
  }
  // console.log({ access_token });

  const { id, workspace_id, organization_id } = await fetch(new URL("/session", import.meta.env.VITE_API_URL), {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  }).then((r) => r.json());

  if (!id) {
    return sendRedirect(event, "/auth/error?error=missing_user", 303);
  }

  if (!workspace_id) {
    return sendRedirect(event, "/auth/error?error=missing_workspace", 303);
  }

  const session = await lucia.createSession(id, {
    access_token,
    workspace_id,
    organization_id,
    createdAt: new Date(),
  });

  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.context.session = session;

  if (!organization_id || !workspace_id) {
    return sendRedirect(event, "/setup/profile", 303);
  }
  return sendRedirect(event, "/dashboard", 303);
}
