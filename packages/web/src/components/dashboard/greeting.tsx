import type { UserSession } from "@/lib/auth/util";
import { Show } from "solid-js";

export const Greeting = (props: { session: UserSession }) => {
  return (
    <div class="flex flex-col gap-4 p-4">
      <div class="flex flex-col items-start gap-2 w-full">
        <div class="flex flex-row items-center justify-between w-full">
          <Show when={props.session.user}>{(u) => <h1 class="text-2xl font-bold !leading-8">Welcome back, {u().name}</h1>}</Show>
        </div>
      </div>
      <span class="text-xs text-muted-foreground">Here's what's happening with your workspace today:</span>
    </div>
  );
};
