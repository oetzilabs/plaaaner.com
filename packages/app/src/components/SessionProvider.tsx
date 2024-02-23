import { createContextProvider } from "@solid-primitives/context";
import { createSignal, createEffect } from "solid-js";
import { createAsync } from "@solidjs/router";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { Session } from "lucia";

export const [SessionProvider, useSession] = createContextProvider(() => {
  const authenticatedSession = createAsync(() => getAuthenticatedSession());
  const [session, setSession] = createSignal<Session | null>();
  createEffect(() => {
    const aS = authenticatedSession();
    if (!aS) {
      console.error("no session");
      return;
    }
    setSession(aS);
  });
  return session;
});
