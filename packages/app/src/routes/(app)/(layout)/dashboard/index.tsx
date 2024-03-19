import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Metrics } from "@/components/dashboard/metrics";
import { Greeting } from "@/components/dashboard/greeting";
import { Calendar } from "@/components/dashboard/calendar";
import { A } from "@solidjs/router";
import { useSession } from "@/components/SessionProvider";
import { Match, Switch } from "solid-js";
import { Loader2 } from "lucide-solid";
import { NotLoggedIn } from "@/components/NotLoggedIn";
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
      <Match when={typeof session !== "undefined" && session().user === null}>
        <div class="flex p-4 w-full h-full items-center justify-center">
          <div class="w-max h-max min-w-96">
            <NotLoggedIn />
          </div>
        </div>
      </Match>
      <Match when={!session}>
        <div class="flex p-4 w-full h-full items-center justify-center">
          <div class="w-max h-max min-w-96">
            <Loader2 class="size-4 animate-spin" />
          </div>
        </div>
      </Match>
      <Match when={typeof session !== "undefined" && session().user !== null && session()}>
        {(s) => (
          <div class="flex flex-col gap-8 grow min-h-0 max-h-screen">
            <div class="flex flex-col w-full grow min-h-0 max-h-[calc(100vh-53px)]">
              <div class="flex flex-col w-full">
                <div class="flex flex-col gap-4 w-full">
                  <Metrics session={s()} />
                </div>
              </div>
              <div class="flex flex-col gap-4 w-full border-t border-neutral-200 dark:border-neutral-800 flex-grow min-h-0 max-h-screen overflow-clip">
                <Calendar session={s()} />
              </div>
            </div>
          </div>
        )}
      </Match>
    </Switch>
  );
}
