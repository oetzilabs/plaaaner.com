import { DaySlots } from "@/components/DaySlots";
import { getActivities } from "@/lib/api/activity";
import { getPlan, getUpcomingThreePlans, savePlanTimeslots, TimeSlot, type DaySlots as DS } from "@/lib/api/plans";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { createAsync, revalidate, RouteDefinition, useAction, useParams, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import tz from "dayjs/plugin/timezone";
import { createSignal, Show } from "solid-js";

dayjs.extend(tz);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

const [timezone, setTimeZone] = createSignal("UTC");

export const route = {
  preload: async (props) => {
    const session = await getAuthenticatedSession();
    const plan = await getPlan(props.params.id);
    return { plan, session };
  },
} satisfies RouteDefinition;

const now = new Date(Date.now());

export default function PlanCreateGeneralPage() {
  const params = useParams();

  const plan = createAsync(() => getPlan(params.id));
  const savePlanTimeAction = useAction(savePlanTimeslots);
  const isSaving = useSubmission(savePlanTimeslots);

  return (
    <Show when={plan() && plan()} keyed>
      {(p) => {
        return (
          <div class="flex flex-col gap-4 w-full grow">
            <DaySlots
              plan={p}
              onSubmit={async (date, daySlots) => {
                await savePlanTimeAction({
                  plan_id: p.id,
                  plan: {
                    days: date.map((d) => new Date(Date.parse(d))),
                    timeSlots: daySlots,
                  },
                });

                await revalidate(getActivities.key);
                await revalidate(getUpcomingThreePlans.key);
              }}
              isSaving={() => isSaving.pending ?? false}
            />
          </div>
        );
      }}
    </Show>
  );
}
