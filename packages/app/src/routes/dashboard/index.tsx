import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Metrics } from "@/components/dashboard/metrics";
import { Notifications } from "@/components/dashboard/notifications";
import { Greeting } from "@/components/dashboard/greeting";
import { UpcomingPlans } from "@/components/dashboard/upcoming-plans";
import { A } from "@solidjs/router";
dayjs.extend(relativeTime);

export default function DashboardPage() {
  return (
    <div class="flex flex-col gap-8 py-10">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <Greeting />
          <span class="text-xs text-muted-foreground">Here's what's happening with your workspace today.</span>
        </div>
        <div class="flex flex-row w-full gap-4 items-start justify-between">
          <div class="flex flex-col gap-4 w-full">
            <div class="flex flex-col gap-2 w-full">
              <A href="/metrics" class="font-bold w-max hover:underline underline-offset-2">
                Metrics
              </A>
              <Metrics />
            </div>
            <div class="flex flex-col gap-2 w-full">
              <A href="/events" class="font-bold w-max hover:underline underline-offset-2">
                Your Plans
              </A>
              <UpcomingPlans />
            </div>
          </div>
          <div class="w-max flex-col gap-4 hidden lg:flex">
            <div class="flex flex-col gap-2">
              <A href="/notifications" class="font-bold w-max hover:underline underline-offset-2">
                Notifications
              </A>
              <Notifications />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
