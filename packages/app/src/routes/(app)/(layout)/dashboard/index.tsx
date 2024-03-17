import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Metrics } from "@/components/dashboard/metrics";
import { Greeting } from "@/components/dashboard/greeting";
import { A } from "@solidjs/router";
import { useSession } from "@/components/SessionProvider";
import { Match, Switch } from "solid-js";
import { NotLoggedIn } from "@/components/NotLoggedIn";
import { Loader2 } from "lucide-solid";
dayjs.extend(relativeTime);

export default function DashboardPage() {
  const session = useSession();
  return (
    <Switch
      fallback={
        <div class="flex p-4 w-full h-full items-center justify-center text-muted-foreground">
          <Loader2 class="size-6 animate-spin" />
        </div>
      }
    >
      <Match when={!session}>
        <div class="flex p-4 w-full h-full items-center justify-center">
          <div class="w-max h-max min-w-96">
            <Loader2 class="size-4 animate-spin" />
          </div>
        </div>
      </Match>
      <Match when={typeof session !== "undefined" && session().user !== null && session()}>
        {(s) => (
          <div class="flex flex-col gap-8 p-4 grow">
            <div class="flex flex-col gap-4">
              <Greeting session={s()} />
              <div class="flex flex-row w-full gap-4 items-start justify-between">
                <div class="flex flex-col gap-4 w-full">
                  <A href="/metrics" class="font-bold w-max hover:underline underline-offset-2">
                    Metrics
                  </A>
                  <Metrics session={s()} />
                </div>
              </div>
            </div>
          </div>
        )}
      </Match>
    </Switch>
  );
}
