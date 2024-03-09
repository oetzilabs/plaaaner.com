import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Metrics } from "@/components/dashboard/metrics";
import { Notifications } from "@/components/dashboard/notifications";
import { Greeting } from "@/components/dashboard/greeting";
import { UpcomingPlans } from "@/components/dashboard/upcoming-plans";
import { A } from "@solidjs/router";
import { useSession } from "@/components/SessionProvider";
import { Show } from "solid-js";
import { NotLoggedIn } from "@/components/NotLoggedIn";
dayjs.extend(relativeTime);

export default function DashboardPage() {
  const session = useSession();
  return (
    <Show
      when={typeof session !== "undefined" && session().user !== null && session()}
      fallback={
        <div class="py-10">
          <NotLoggedIn />
        </div>
      }
    >
      {(s) => (
        <div class="flex flex-col gap-8 py-10">
          <div class="flex flex-col gap-4">
            <Greeting session={s()} />
            <div class="flex flex-row w-full gap-4 items-start justify-between">
              <div class="flex flex-col gap-4 w-full">
                <div class="flex flex-col gap-2 w-full">
                  <A href="/metrics" class="font-bold w-max hover:underline underline-offset-2">
                    Metrics
                  </A>
                  <Metrics session={s()}/>
                </div>
                <div class="flex flex-col gap-2 w-full">
                  <A href="/events" class="font-bold w-max hover:underline underline-offset-2">
                    Your Plans
                  </A>
                  <UpcomingPlans session={s()}/>
                </div>
              </div>
              <div class="w-max flex-col gap-4 hidden lg:flex">
                <div class="flex flex-col gap-2">
                  <A href="/notifications" class="font-bold w-max hover:underline underline-offset-2">
                    Notifications
                  </A>
                  <Notifications session={s()}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Show>
  );
}
