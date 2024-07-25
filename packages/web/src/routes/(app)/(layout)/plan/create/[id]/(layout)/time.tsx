import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DatePicker,
  DatePickerContent,
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
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { getActivities } from "@/lib/api/activity";
import { getPlan, getUpcomingThreePlans, savePlanTimeslots } from "@/lib/api/plans";
import { today } from "@internationalized/date";
import { update } from "@solid-primitives/signal-builders";
import { A, createAsync, redirect, revalidate, useAction, useParams, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import tz from "dayjs/plugin/timezone";
import { Calendar, Loader2, Minus, Plus, Trash } from "lucide-solid";
import { createSignal, For, Match, onMount, Show, Switch } from "solid-js";
import { toast } from "solid-sonner";
import { z } from "zod";

dayjs.extend(tz);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

const [timezone, setTimeZone] = createSignal("UTC");

const TimeSlotChange = (props: {
  value: {
    start: Date;
    end: Date;
  };
  onChange: (start: Date, end: Date) => void;
}) => {
  const [start, setStart] = createSignal(props.value.start);
  const [end, setEnd] = createSignal(props.value.end);

  const dateFormat = ["h:mm", "hh:mm"];

  onMount(() => {
    setTimeZone(dayjs.tz.guess());
  });

  return (
    <div class="flex flex-col gap-4 w-full">
      <TextFieldRoot
        class="w-full flex flex-col gap-2"
        aria-label="Start Time"
        value={dayjs(start()).format("hh:mm")}
        onChange={(value) => {
          setStart(dayjs(value, dateFormat).toDate());
        }}
      >
        <div class="flex flex-row items-center justify-between w-full">
          <TextFieldLabel class="w-full flex flex-col gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Start Time
            <TextField class="w-full" placeholder="Start time" type="time" />
          </TextFieldLabel>
        </div>
      </TextFieldRoot>
      <TextFieldRoot
        class="w-full flex flex-col gap-2"
        aria-label="Start Time"
        value={dayjs(end()).format("hh:mm")}
        onChange={(value) => {
          setEnd(dayjs(value, dateFormat).toDate());
        }}
      >
        <div class="flex flex-row items-center justify-between w-full">
          <TextFieldLabel class="w-full flex flex-col gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            End Time
            <TextField class="w-full" placeholder="End time" type="time" />
          </TextFieldLabel>
        </div>
      </TextFieldRoot>
      <AlertDialogFooter>
        <AlertDialogClose>Cancel</AlertDialogClose>
        <AlertDialogAction
          onClick={(e) => {
            // first check if start and end is correctly entered
            const s = start();
            const _e = end();

            if (dayjs(_e).isBefore(s)) {
              toast.info("End time has to be after start time");
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            props.onChange(start(), end());
          }}
        >
          Save
        </AlertDialogAction>
      </AlertDialogFooter>
    </div>
  );
};

export default function PlanCreateGeneralPage() {
  const params = useParams();
  const v = params.id;
  const isUUID = z.string().uuid().safeParse(v);

  if (!v || !isUUID.success) {
    return redirect("/404", { status: 404 });
  }

  const plan = createAsync(() => getPlan(isUUID.data), { deferStream: true });
  const savePlanTimeAction = useAction(savePlanTimeslots);
  const isSaving = useSubmission(savePlanTimeslots);

  const [days, setDays] = createSignal<[Date, Date]>([
    dayjs().startOf("day").toDate(),
    dayjs().startOf("day").add(1, "day").toDate(),
  ]);
  const [time_slots, setTime_slots] = createSignal<
    Record<
      string,
      Record<
        string,
        {
          start: Date;
          end: Date;
        }
      >
    >
  >({
    [dayjs().startOf("day").format("YYYY-MM-DD")]: {
      [dayjs().startOf("day").format("YYYY-MM-DD h:mm A")]: {
        start: dayjs().startOf("day").toDate(),
        end: dayjs().endOf("day").toDate(),
      },
    },
  });

  const time_slots_length = () =>
    Object.values(time_slots()).reduce((acc, day) => {
      // Access nested object within 'day'
      const daySlots = Object.values(day);

      // Add length of each day's time slot array to accumulator
      return acc + daySlots.length;
    }, 0);

  return (
    <Show when={typeof plan() !== "undefined" && plan()}>
      {(p) => {
        return (
          <>
            <div class="flex flex-col gap-2 w-full">
              <TextFieldRoot class="w-full flex flex-col gap-2" aria-label="Start Time">
                <div class="flex flex-row items-center justify-between w-full">
                  <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    When is the Plan?
                  </TextFieldLabel>
                  <Button
                    size="sm"
                    variant={dayjs(days()[0]).isSame(dayjs().startOf("day"), "day") ? "secondary" : "outline"}
                    class="w-max gap-2 items-center justify-center"
                    type="button"
                    onClick={() => {
                      setDays([dayjs().startOf("day").toDate(), dayjs().startOf("day").toDate()]);
                    }}
                  >
                    <Calendar class="w-3 h-3" />
                    Today
                  </Button>
                </div>
              </TextFieldRoot>
              <DatePicker
                numOfMonths={2}
                selectionMode="range"
                min={today(timezone())}
                timeZone={timezone()}
                value={(days() ?? []).map((d) => dayjs(d).format("YYYY-MM-DD"))}
                onValueChange={(date) => {
                  const tz = timezone();
                  const days = date.value.map((d) => dayjs(d.toDate(tz)).startOf("day").toDate());
                  if (days.length > 1) {
                    setTime_slots(
                      Object.fromEntries(
                        Array.from({ length: dayjs(days[1]).diff(dayjs(days[0]), "days") + 1 }).map((_, i) => [
                          dayjs(days[0]).add(i, "days").format("YYYY-MM-DD"),
                          {
                            [dayjs(days[0]).add(i, "days").format("YYYY-MM-DD h:mm A")]: {
                              start: dayjs(days[0]).add(i, "days").startOf("day").toDate(),
                              end: dayjs(days[0]).add(i, "days").endOf("day").toDate(),
                            },
                          },
                        ]),
                      ),
                    );
                  }
                }}
              >
                <DatePickerInput />
                <DatePickerContent>
                  <DatePickerView view="day">
                    {(api) => {
                      const offset = api().getOffset({ months: 1 });
                      return (
                        <>
                          <DatePickerViewControl>
                            <DatePickerViewTrigger>
                              <DatePickerRangeText />
                            </DatePickerViewTrigger>
                          </DatePickerViewControl>
                          <div class="flex gap-4">
                            <DatePickerTable>
                              <DatePickerTableHead>
                                <DatePickerTableRow>
                                  <For each={api().weekDays}>
                                    {(weekDay) => <DatePickerTableHeader>{weekDay.short}</DatePickerTableHeader>}
                                  </For>
                                </DatePickerTableRow>
                              </DatePickerTableHead>
                              <DatePickerTableBody>
                                <For each={api().weeks}>
                                  {(week) => (
                                    <DatePickerTableRow>
                                      <For each={week}>
                                        {(day) => (
                                          <DatePickerTableCell value={day}>
                                            <DatePickerTableCellTrigger>{day.day}</DatePickerTableCellTrigger>
                                          </DatePickerTableCell>
                                        )}
                                      </For>
                                    </DatePickerTableRow>
                                  )}
                                </For>
                              </DatePickerTableBody>
                            </DatePickerTable>
                            <DatePickerTable>
                              <DatePickerTableHead>
                                <DatePickerTableRow>
                                  <For each={api().weekDays}>
                                    {(weekDay) => <DatePickerTableHeader>{weekDay.short}</DatePickerTableHeader>}
                                  </For>
                                </DatePickerTableRow>
                              </DatePickerTableHead>
                              <DatePickerTableBody>
                                <For each={offset.weeks}>
                                  {(week) => (
                                    <DatePickerTableRow>
                                      <For each={week}>
                                        {(day) => (
                                          <DatePickerTableCell value={day} visibleRange={offset.visibleRange}>
                                            <DatePickerTableCellTrigger>{day.day}</DatePickerTableCellTrigger>
                                          </DatePickerTableCell>
                                        )}
                                      </For>
                                    </DatePickerTableRow>
                                  )}
                                </For>
                              </DatePickerTableBody>
                            </DatePickerTable>
                          </div>
                        </>
                      );
                    }}
                  </DatePickerView>
                  <DatePickerView view="month">
                    {(api) => (
                      <>
                        <DatePickerViewControl>
                          <DatePickerViewTrigger>
                            <DatePickerRangeText />
                          </DatePickerViewTrigger>
                        </DatePickerViewControl>
                        <DatePickerTable class="w-[calc(var(--reference-width)-26px)]">
                          <DatePickerTableBody>
                            <For
                              each={api().getMonthsGrid({
                                columns: 4,
                                format: "short",
                              })}
                            >
                              {(months) => (
                                <DatePickerTableRow>
                                  <For each={months}>
                                    {(month) => (
                                      <DatePickerTableCell value={month.value}>
                                        <DatePickerTableCellTrigger>{month.label}</DatePickerTableCellTrigger>
                                      </DatePickerTableCell>
                                    )}
                                  </For>
                                </DatePickerTableRow>
                              )}
                            </For>
                          </DatePickerTableBody>
                        </DatePickerTable>
                      </>
                    )}
                  </DatePickerView>
                  <DatePickerView view="year">
                    {(api) => (
                      <>
                        <DatePickerViewControl>
                          <DatePickerViewTrigger>
                            <DatePickerRangeText />
                          </DatePickerViewTrigger>
                        </DatePickerViewControl>
                        <DatePickerTable class="w-[calc(var(--reference-width)-26px)]">
                          <DatePickerTableBody>
                            <For
                              each={api().getYearsGrid({
                                columns: 4,
                              })}
                            >
                              {(years) => (
                                <DatePickerTableRow>
                                  <For each={years}>
                                    {(year) => (
                                      <DatePickerTableCell value={year.value}>
                                        <DatePickerTableCellTrigger>{year.label}</DatePickerTableCellTrigger>
                                      </DatePickerTableCell>
                                    )}
                                  </For>
                                </DatePickerTableRow>
                              )}
                            </For>
                          </DatePickerTableBody>
                        </DatePickerTable>
                      </>
                    )}
                  </DatePickerView>
                </DatePickerContent>
              </DatePicker>
              <div class="flex flex-col gap-1 w-full">
                <div class="flex flex-col gap-2 w-full items-center justify-between">
                  <div class="w-full">
                    <span class="text-sm font-medium">
                      {time_slots_length()} Time slot{time_slots_length() === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div></div>
                </div>
                <div class="flex flex-col gap-2 w-full">
                  <For
                    each={Object.entries(time_slots() ?? {})}
                    fallback={
                      <div class="flex flex-col items-center justify-center text-muted-foreground border border-neutral-200 dark:border-neutral-800 rounded-md py-2">
                        There are no time slots
                      </div>
                    }
                  >
                    {([string_date, time_slots_obj]) => (
                      <div class="flex flex-col w-full items-start justify-between border border-neutral-200 dark:border-neutral-800 rounded-md p-4 gap-2">
                        <div class="w-max flex flex-col items-center justify-center min-w-20">
                          <div class="text-base font-black w-max">{dayjs(string_date).format("ddd Do MMM")}</div>
                        </div>
                        <div class="flex flex-col w-full gap-2">
                          <For each={Object.entries(time_slots_obj)}>
                            {([string_time_slot, time_slot]) => (
                              <div class="flex flex-row items-center justify-between w-full gap-2">
                                <AlertDialog>
                                  <AlertDialogTrigger class="w-full">
                                    <div class="flex flex-row w-full items-center justify-between border border-neutral-200 dark:border-neutral-800 rounded-md cursor-pointer hover:bg-muted/50 py-2">
                                      <div class="w-full flex flex-row items-center justify-around px-3">
                                        <div class="font-mono">{dayjs(time_slot.start).format("h:mm A")}</div>
                                        <Minus class="size-4" />
                                        <div class="font-mono">{dayjs(time_slot.end).format("h:mm A")}</div>
                                      </div>
                                    </div>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Change time slot for {dayjs(time_slot.start).format("Do MMM YYYY")}
                                      </AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <TimeSlotChange
                                      onChange={(start, end) => {
                                        const time_slots_copy = time_slots();

                                        time_slots_copy[string_date][string_time_slot].start = dayjs(time_slot.start)
                                          .set("hours", dayjs(start).hour())
                                          .set("minutes", dayjs(start).minute())
                                          .toDate();

                                        time_slots_copy[string_date][string_time_slot].end = dayjs(time_slot.end)
                                          .set("hours", dayjs(end).hour())
                                          .set("minutes", dayjs(end).minute())
                                          .toDate();

                                        setTime_slots(time_slots_copy);
                                      }}
                                      value={time_slot}
                                    />
                                  </AlertDialogContent>
                                </AlertDialog>
                                <div class="flex flex-row items-center justify-center w-max">
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    class="w-max h-max p-3"
                                    onClick={() => {
                                      const time_slots_copy = time_slots();
                                      const ts = time_slots_copy[string_date];
                                      delete ts[string_time_slot];
                                      const nts = update(time_slots, string_date, time_slots_copy[string_date]);
                                      const nnt = nts();
                                      setTime_slots(nnt);
                                    }}
                                  >
                                    <Trash class="size-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </For>
                          <Button
                            class="flex gap-2 items-center"
                            size="sm"
                            onClick={() => {
                              if (!plan) return;
                              const time_slots_copy = time_slots();
                              const the_day = time_slots_copy[string_date];
                              const sortedTimeSlots = Object.values(the_day).sort(
                                (a, b) => b.start.getTime() - a.start.getTime(),
                              );
                              if (sortedTimeSlots.length === 0) {
                                const newStartTime = dayjs(string_date).startOf("day");
                                const newEndTime = dayjs(string_date).endOf("day");
                                const newTimeSlot = { start: newStartTime.toDate(), end: newEndTime.toDate() };
                                const newTimeSlotString = newStartTime.format("YYYY-MM-DD h:mm A");

                                const new_newPlan = update(time_slots, string_date, newTimeSlotString, newTimeSlot);
                                const nne = new_newPlan();
                                setTime_slots(nne);
                                return;
                              }
                              const lastTimeSlot = sortedTimeSlots[0];
                              const newStartTime = dayjs(lastTimeSlot.end).add(1, "minute");
                              const newEndTime = dayjs(newStartTime).add(1, "hour");
                              const newTimeSlot = { start: newStartTime.toDate(), end: newEndTime.toDate() };
                              const newTimeSlotString = newStartTime.format("YYYY-MM-DD h:mm A");

                              const new_newPlan = update(time_slots, string_date, newTimeSlotString, newTimeSlot);
                              const nnp = new_newPlan();
                              setTime_slots(nnp);
                            }}
                          >
                            <Plus class="size-4" /> Add Slot
                          </Button>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
            <div class="w-full flex flex-row items-center justify-between gap-2">
              <div class="w-full"></div>
              <div class="w-max flex flex-row items-center justify-end gap-2">
                <Button
                  disabled={isSaving.pending}
                  size="sm"
                  class="w-full flex flex-row items-center justify-center gap-2"
                  onClick={async () => {
                    await savePlanTimeAction({
                      plan_id: p().id,
                      plan: {
                        days: days(),
                        time_slots: time_slots(),
                      },
                    });

                    await revalidate(getActivities.key);
                    await revalidate(getUpcomingThreePlans.key);
                  }}
                >
                  <Switch>
                    <Match when={!isSaving.pending}>
                      <span class="text-sm font-medium leading-none">Save</span>
                    </Match>
                    <Match when={isSaving.pending}>
                      <Loader2 class="w-4 h-4 animate-spin" />
                      <span class="text-sm font-medium leading-none">Saving</span>
                    </Match>
                  </Switch>
                </Button>
                <A href={`/plan/create/${p().id}/location`}>
                  <Button size="sm" class="w-full flex flex-row items-center justify-center gap-2">
                    <span class="text-sm font-medium leading-none">Next</span>
                  </Button>
                </A>
              </div>
            </div>
          </>
        );
      }}
    </Show>
  );
}
