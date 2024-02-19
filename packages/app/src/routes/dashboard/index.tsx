import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Statistics } from "@/components/dashboard/statistics";
import { Notifications } from "@/components/dashboard/notifications";
import { Greeting } from "@/components/dashboard/greeting";
dayjs.extend(relativeTime);

export default function DashboardPage() {
  return (
    <div class="flex flex-col gap-8 py-10">
      <div class="flex flex-col gap-12">
        <div class="flex flex-col gap-2">
          <Greeting />
          <span class="text-xs text-muted-foreground">Here's what's happening with your workspace today.</span>
        </div>
        <div class="flex flex-row w-full gap-4 items-start justify-between">
          <div class="flex flex-col gap-2 -mt-8 w-full">
            <span class="font-medium">Statistics</span>
            <Statistics />
          </div>
          <div class="w-max flex flex-col gap-4">
            <div class="flex flex-col gap-2 -mt-8">
              <span class="font-medium">Notifications</span>
              <Notifications />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
