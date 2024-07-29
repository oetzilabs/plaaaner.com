import { getAuthenticatedSession } from "@/lib/auth/util";
import { createAsync } from "@solidjs/router";
import { Match, Switch } from "solid-js";

export const route = {
  preload: async () => {
    const user = await getAuthenticatedSession();
    return { user };
  },
};

export default function ProfilePage() {
  const session = createAsync(() => getAuthenticatedSession());

  return (
    <div class="flex flex-col items-start grow w-full gap-8 p-4">
      <h1 class="text-3xl font-medium">Profile</h1>
      <Switch>
        <Match when={session() && session()?.user === null}>
          <div>Loading...</div>
        </Match>
        <Match when={session() && session()?.user !== null && session()} keyed>
          {(s) => (
            <div class="flex flex-col items-start gap-2">
              <span class="text-lg font-semibold">{s.user?.name}</span>
              <span class="text-sm text-muted-foreground">{s.user?.email}</span>
            </div>
          )}
        </Match>
      </Switch>
    </div>
  );
}
