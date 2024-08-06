import { Button } from "@/components/ui/button";
import { Checkbox, CheckboxControl, CheckboxLabel } from "@/components/ui/checkbox";
import {
  DatePicker,
  DatePickerContent,
  DatePickerContext,
  DatePickerInput,
  DatePickerRangeText,
  DatePickerTable,
  DatePickerTableBody,
  DatePickerTableCell,
  DatePickerTableCellTrigger,
  DatePickerTableHead,
  DatePickerTableHeader,
  DatePickerTableRow,
  DatePickerView,
  DatePickerViewControl,
  DatePickerViewTrigger,
} from "@/components/ui/date-picker";
import { TextArea } from "@/components/ui/textarea";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { Plans } from "@/core/entities/plans";
import { getActivities } from "@/lib/api/activity";
import { getPlan, getUpcomingThreePlans, savePlanTimeslots, TimeSlot, type DaySlots as DS } from "@/lib/api/plans";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { today } from "@internationalized/date";
import { concat, update } from "@solid-primitives/signal-builders";
import { A, createAsync, revalidate, RouteDefinition, useAction, useParams, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import tz from "dayjs/plugin/timezone";
import { Clock, Loader2, Minus, Plus, X } from "lucide-solid";
import { createMemo, createSignal, ErrorBoundary, Index, Match, Show, Switch } from "solid-js";
import { Portal } from "solid-js/web";
import { DaySlots } from "../../../../../../../../components/DaySlots";

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

  const plan = createAsync(() => getPlan(params.id), { deferStream: true });
  const savePlanTimeAction = useAction(savePlanTimeslots);
  const isSaving = useSubmission(savePlanTimeslots);

  return (
    <Show when={plan() && plan()}>
      {(p) => {
        return (
          <>
            <DaySlots
              times={p().times}
              onSubmit={async (date, daySlots) => {
                await savePlanTimeAction({
                  plan_id: p().id,
                  plan: {
                    days: date.map((d) => new Date(Date.parse(d))),
                    timeSlots: daySlots,
                  },
                });

                await revalidate(getActivities.key);
                await revalidate(getUpcomingThreePlans.key);
              }}
              isSaving={() => isSaving.pending ?? false}
              plan={p()}
            />
          </>
        );
      }}
    </Show>
  );
}
