import { CalendarDashboard } from "@/components/DaySlots";
import { getActivities } from "@/lib/api/activity";
import { getPlan, getUpcomingThreePlans, savePlanTimeslots, TimeSlot, type DaySlots as DS } from "@/lib/api/plans";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { createAsync, revalidate, RouteDefinition, useAction, useParams, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import tz from "dayjs/plugin/timezone";
import { Show } from "solid-js";

dayjs.extend(tz);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

export const route = {
  preload: async (props) => {
    const session = await getAuthenticatedSession();
    const plan = await getPlan(props.params.plan_id);
    return { plan, session };
  },
} satisfies RouteDefinition;

export default function PlanCreateGeneralPage() {
  const params = useParams();
  const plan = createAsync(() => getPlan(params.plan_id));

  const savePlanTimeAction = useAction(savePlanTimeslots);
  const savePlanSubmission = useSubmission(savePlanTimeslots);

  return (
    <Show when={plan() && plan()} keyed>
      {(p) => {
        return (
          <div class="flex flex-col gap-4 w-full grow">
            <CalendarDashboard
              plan={p}
              onSubmit={async (slots) => {
                // find the start and end dates
                let start = slots[0].slots[0].start;
                let end = slots[0].slots[0].end;
                for (let i = 0; i < slots.length; i++) {
                  const slot = slots[i];
                  if (dayjs(slot.slots[0].start).isBefore(start)) {
                    start = slot.slots[0].start;
                  }
                  if (dayjs(slot.slots[0].end).isAfter(end)) {
                    end = slot.slots[0].end;
                  }
                }

                await savePlanTimeAction({
                  plan_id: p.id,
                  plan: {
                    days: [start, end],
                    timeSlots: slots,
                  },
                });
              }}
              isSaving={() => savePlanSubmission.pending ?? false}
            />
          </div>
        );
      }}
    </Show>
  );
}
