import { createAsync } from "@solidjs/router";
import { getAuthenticatedUser } from "../../lib/auth/util";
import { Match, Switch } from "solid-js";

export default function ProfilePage() {
  const user = createAsync(() => getAuthenticatedUser());

  return (
    <div class="flex flex-col items-start h-full w-full py-10 gap-8">
      <h1 class="text-3xl font-medium">Profile</h1>
      <Switch>
        <Match when={!user()}>
          <div>Loading...</div>
        </Match>
        <Match when={user()}>
          <div class="flex flex-col items-start gap-2">
            <span class="text-lg font-semibold">{user()?.username}</span>
            <span class="text-sm text-muted-foreground">{user()?.email}</span>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
