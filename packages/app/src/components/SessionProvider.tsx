import { createContextProvider } from "@solid-primitives/context";
import { createSignal, createEffect } from "solid-js";
import { createAsync } from "@solidjs/router";
import { getAuthenticatedSession } from "@/lib/auth/util";
import type { UserSession } from "@/lib/auth/util";

export const [SessionProvider, useSession] = createContextProvider(() => {
  const authenticatedSession = createAsync(() => getAuthenticatedSession());
  const [session, setSession] = createSignal<UserSession>({
    workspace: null,
    token: null,
    user: null,
    expiresAt: null,
    organization: null,
    id: null,
  });
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
