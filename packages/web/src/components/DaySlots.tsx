import { create } from "domain";
import { get } from "http";
import { today } from "@internationalized/date";
import type { Plans } from "@oetzilabs-plaaaner-com/core/src/entities/plans";
import { concat, update } from "@solid-primitives/signal-builders";
import { A } from "@solidjs/router";
import dayjs from "dayjs";
import { Clock, Loader2, Minus, Plus, X } from "lucide-solid";
import { createMemo, createSignal, Index, Match, Show, Switch } from "solid-js";
import { Portal } from "solid-js/web";
import type { DaySlots as DS, TimeSlot } from "../lib/api/plans";
import { Button } from "./ui/button";
import { Checkbox, CheckboxControl, CheckboxLabel } from "./ui/checkbox";
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
} from "./ui/date-picker";
import { TextArea } from "./ui/textarea";
import { TextField, TextFieldLabel, TextFieldRoot } from "./ui/textfield";

const now = new Date(Date.now());

const getStart = (times: Plans.Frontend["times"]) => {
  let begining = times[0].starts_at;
  for (let i = 1; i < times.length; i++) {
    if (dayjs(times[i].starts_at).isBefore(dayjs(begining))) {
      begining = times[i].starts_at;
    }
  }
  return begining;
};

const getEnd = (times: Plans.Frontend["times"]) => {
  let end = times[0].ends_at;
  for (let i = 1; i < times.length; i++) {
    if (dayjs(times[i].ends_at).isAfter(dayjs(end))) {
      end = times[i].ends_at;
    }
  }
  return end;
};

const createInitialDaySlots = (times: Plans.Frontend["times"], end: Date) => {
  const start2 = getStart(times);
  // const end2 = getEnd(times);
  const difference = Math.abs(dayjs(start2).diff(dayjs(end), "day")) + 2;

  const list = new Map<string, DS>();

  for (let i = 0; i < difference; i++) {
    const date = dayjs(start2).add(i, "day").toISOString().split("T")[0];
    list.set(date, {
      date,
      slots: [],
    });
  }

  for (let i = 0; i < times.length; i++) {
    const time = times[i];
    const date = dayjs(time.starts_at).startOf("day").toISOString().split("T")[0];
    if (list.has(date)) {
      list.set(date, {
        date,
        slots: [
          ...(list.get(date)?.slots ?? []),
          {
            title: time.title ?? "",
            information: time.description ?? "",
            start: time.starts_at,
            end: time.ends_at,
          },
        ],
      });
    } else {
      list.set(date, {
        date,
        slots: [
          {
            title: time.title ?? "",
            information: time.description ?? "",
            start: time.starts_at,
            end: time.ends_at,
          },
        ],
      });
    }
  }
  return Array.from(list.values());
};

export const DaySlots = (props: {
  times: Plans.Frontend["times"];
  onSubmit: (date: string[], daySlots: DS[]) => void;
  isSaving: () => boolean;
  plan: Plans.Frontend;
}) => {
  const [timezone, setTimeZone] = createSignal("UTC");
  const [date, setDate] = createSignal<string[]>([
    dayjs(getStart(props.times)).startOf("day").toISOString().split("T")[0],
    dayjs(getEnd(props.times)).endOf("day").toISOString().split("T")[0],
  ]);
  const [daySlots, setDaySlots] = createSignal<DS[]>(createInitialDaySlots(props.times, props.plan.ends_at));
  const [todayChecked, setTodayChecked] = createSignal(false);

  const addDaySlot = () => {
    const l = daySlots().length;
    const toAdd =
      l === 0
        ? [{ date: dayjs(date()[0]).add(1, "day").toISOString().split("T")[0], slots: [] }]
        : [
            {
              date: dayjs(daySlots()[l - 1].date)
                .add(2, "day")
                .toISOString()
                .split("T")[0],
              slots: [],
            },
          ];
    const x = concat(daySlots, toAdd);
    setDaySlots(x);
  };

  const groupByDay = createMemo(() =>
    daySlots().reduce(
      (acc, daySlot) => {
        const day = daySlot.date.split("T")[0];
        if (acc[day] === undefined) {
          acc[day] = [];
        }
        acc[day].push(daySlot);
        return acc;
      },
      {} as Record<string, DS[]>,
    ),
  );

  const allDateHaveADayslot = createMemo(() => {
    const da = date();
    const ds = Object.keys(groupByDay());
    const daysDifference = Math.abs(dayjs(da[0]).diff(dayjs(da[1]), "day")) + 1;
    return ds.length === daysDifference;
  });

  return (
    <>
      <div class="flex flex-col gap-4 w-full">
        <div class="flex flex-row items-center justify-between w-full max-w-xs gap-4">
          <TextFieldRoot class="w-max flex flex-col gap-2" aria-label="Start Time">
            <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              When is the Plan?
            </TextFieldLabel>
          </TextFieldRoot>
          <Checkbox
            checked={todayChecked()}
            onChange={(c) => {
              if (c === null) return;
              const sameDay = dayjs(now).startOf("day").format("YYYY-MM-DD");
              setDate([sameDay, sameDay]);
              setTodayChecked(c);
            }}
            class="w-max flex flex-row items-center justify-between gap-2"
          >
            <CheckboxControl class="size-4" />
            <CheckboxLabel class="text-sm font-semibold">Today</CheckboxLabel>
          </Checkbox>
        </div>
        <DatePicker
          disabled={todayChecked()}
          numOfMonths={2}
          class="w-full max-w-xs"
          selectionMode="range"
          min={today(timezone()).toString()}
          format={() =>
            date()
              .map((e) =>
                new Intl.DateTimeFormat("en-US", {
                  dateStyle: "long",
                }).format(new Date(e)),
              )
              .join(" - ")
          }
          value={date()}
          onValueChange={(e) => setDate(e.valueAsString)}
        >
          <DatePickerInput placeholder="Pick a date" disabled={todayChecked()} />
          <Portal>
            <DatePickerContent class="w-full">
              <DatePickerView view="day">
                <DatePickerContext>
                  {(api) => {
                    const offset = createMemo(() => api().getOffset({ months: 1 }));

                    return (
                      <>
                        <DatePickerViewControl>
                          <DatePickerViewTrigger>
                            <DatePickerRangeText />
                          </DatePickerViewTrigger>
                        </DatePickerViewControl>
                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <DatePickerTable>
                            <DatePickerTableHead>
                              <DatePickerTableRow>
                                <Index each={api().weekDays}>
                                  {(weekDay) => <DatePickerTableHeader>{weekDay().short}</DatePickerTableHeader>}
                                </Index>
                              </DatePickerTableRow>
                            </DatePickerTableHead>
                            <DatePickerTableBody>
                              <Index each={api().weeks}>
                                {(week) => (
                                  <DatePickerTableRow>
                                    <Index each={week()}>
                                      {(day) => (
                                        <DatePickerTableCell value={day()}>
                                          <DatePickerTableCellTrigger>{day().day}</DatePickerTableCellTrigger>
                                        </DatePickerTableCell>
                                      )}
                                    </Index>
                                  </DatePickerTableRow>
                                )}
                              </Index>
                            </DatePickerTableBody>
                          </DatePickerTable>
                          <DatePickerTable>
                            <DatePickerTableHead>
                              <DatePickerTableRow>
                                <Index each={api().weekDays}>
                                  {(weekDay) => <DatePickerTableHeader>{weekDay().short}</DatePickerTableHeader>}
                                </Index>
                              </DatePickerTableRow>
                            </DatePickerTableHead>
                            <DatePickerTableBody>
                              <Index each={offset().weeks}>
                                {(week) => (
                                  <DatePickerTableRow>
                                    <Index each={week()}>
                                      {(day) => (
                                        <DatePickerTableCell value={day()} visibleRange={offset().visibleRange}>
                                          <DatePickerTableCellTrigger>{day().day}</DatePickerTableCellTrigger>
                                        </DatePickerTableCell>
                                      )}
                                    </Index>
                                  </DatePickerTableRow>
                                )}
                              </Index>
                            </DatePickerTableBody>
                          </DatePickerTable>
                        </div>
                      </>
                    );
                  }}
                </DatePickerContext>
              </DatePickerView>
              <DatePickerView view="month" class="w-[calc(var(--reference-width)-(0.75rem*2))]">
                <DatePickerContext>
                  {(api) => (
                    <>
                      <DatePickerViewControl>
                        <DatePickerViewTrigger>
                          <DatePickerRangeText />
                        </DatePickerViewTrigger>
                      </DatePickerViewControl>
                      <DatePickerTable>
                        <DatePickerTableBody>
                          <Index
                            each={api().getMonthsGrid({
                              columns: 4,
                              format: "short",
                            })}
                          >
                            {(months) => (
                              <DatePickerTableRow>
                                <Index each={months()}>
                                  {(month) => (
                                    <DatePickerTableCell value={month().value}>
                                      <DatePickerTableCellTrigger>{month().label}</DatePickerTableCellTrigger>
                                    </DatePickerTableCell>
                                  )}
                                </Index>
                              </DatePickerTableRow>
                            )}
                          </Index>
                        </DatePickerTableBody>
                      </DatePickerTable>
                    </>
                  )}
                </DatePickerContext>
              </DatePickerView>
              <DatePickerView view="year" class="w-[calc(var(--reference-width)-(0.75rem*2))]">
                <DatePickerContext>
                  {(api) => (
                    <>
                      <DatePickerViewControl>
                        <DatePickerViewTrigger>
                          <DatePickerRangeText />
                        </DatePickerViewTrigger>
                      </DatePickerViewControl>
                      <DatePickerTable>
                        <DatePickerTableBody>
                          <Index
                            each={api().getYearsGrid({
                              columns: 4,
                            })}
                          >
                            {(years) => (
                              <DatePickerTableRow>
                                <Index each={years()}>
                                  {(year) => (
                                    <DatePickerTableCell value={year().value}>
                                      <DatePickerTableCellTrigger>{year().label}</DatePickerTableCellTrigger>
                                    </DatePickerTableCell>
                                  )}
                                </Index>
                              </DatePickerTableRow>
                            )}
                          </Index>
                        </DatePickerTableBody>
                      </DatePickerTable>
                    </>
                  )}
                </DatePickerContext>
              </DatePickerView>
            </DatePickerContent>
          </Portal>
        </DatePicker>
        <div class="flex flex-col gap-1 w-full">
          <div class="grid grid-cols-3 gap-4 w-full">
            <Index
              each={Object.entries(groupByDay())}
              fallback={
                <div class="col-span-full flex flex-col items-center justify-center text-muted-foreground border border-neutral-200 dark:border-neutral-800 rounded-md p-8 bg-neutral-50 dark:bg-neutral-950 gap-4">
                  <span class="text-sm">There are no day slots</span>
                  <Button
                    class="flex flex-row gap-2 w-max"
                    variant="outline"
                    onClick={addDaySlot}
                    size="sm"
                    disabled={date().length === 0}
                  >
                    <Plus class="size-4" />
                    <span class="text-sm font-medium">Add Slot</span>
                  </Button>
                </div>
              }
            >
              {(dO, index) => (
                <div class="w-full p-8 border rounded-md flex flex-col gap-6">
                  <div class="flex flex-row items-center justify-between w-full gap-2">
                    <DatePicker
                      disabled
                      selectionMode="single"
                      onValueChange={(e) => {
                        const x = update(daySlots, index, "date", e.valueAsString[0]);
                        setDaySlots(x);
                      }}
                      value={[dO()[0]]}
                      min={dayjs(date()[0]).startOf("day").format("YYYY-MM-DD")}
                      max={dayjs(date()[1]).endOf("day").format("YYYY-MM-DD")}
                      class="w-full"
                    >
                      <DatePickerInput placeholder="Pick a date frpm the range above" />
                      <Portal>
                        <DatePickerContent>
                          <DatePickerView view="day">
                            <DatePickerContext>
                              {(api) => (
                                <>
                                  <DatePickerViewControl>
                                    <DatePickerViewTrigger>
                                      <DatePickerRangeText />
                                    </DatePickerViewTrigger>
                                  </DatePickerViewControl>
                                  <DatePickerTable>
                                    <DatePickerTableHead>
                                      <DatePickerTableRow>
                                        <Index each={api().weekDays}>
                                          {(weekDay) => (
                                            <DatePickerTableHeader>{weekDay().short}</DatePickerTableHeader>
                                          )}
                                        </Index>
                                      </DatePickerTableRow>
                                    </DatePickerTableHead>
                                    <DatePickerTableBody>
                                      <Index each={api().weeks}>
                                        {(week) => (
                                          <DatePickerTableRow>
                                            <Index each={week()}>
                                              {(day) => (
                                                <DatePickerTableCell value={day()}>
                                                  <DatePickerTableCellTrigger>{day().day}</DatePickerTableCellTrigger>
                                                </DatePickerTableCell>
                                              )}
                                            </Index>
                                          </DatePickerTableRow>
                                        )}
                                      </Index>
                                    </DatePickerTableBody>
                                  </DatePickerTable>
                                </>
                              )}
                            </DatePickerContext>
                          </DatePickerView>
                          <DatePickerView view="month" class="w-[calc(var(--reference-width)-(0.75rem*2))]">
                            <DatePickerContext>
                              {(api) => (
                                <>
                                  <DatePickerViewControl>
                                    <DatePickerViewTrigger>
                                      <DatePickerRangeText />
                                    </DatePickerViewTrigger>
                                  </DatePickerViewControl>
                                  <DatePickerTable>
                                    <DatePickerTableBody>
                                      <Index
                                        each={api().getMonthsGrid({
                                          columns: 4,
                                          format: "short",
                                        })}
                                      >
                                        {(months) => (
                                          <DatePickerTableRow>
                                            <Index each={months()}>
                                              {(month) => (
                                                <DatePickerTableCell value={month().value}>
                                                  <DatePickerTableCellTrigger>
                                                    {month().label}
                                                  </DatePickerTableCellTrigger>
                                                </DatePickerTableCell>
                                              )}
                                            </Index>
                                          </DatePickerTableRow>
                                        )}
                                      </Index>
                                    </DatePickerTableBody>
                                  </DatePickerTable>
                                </>
                              )}
                            </DatePickerContext>
                          </DatePickerView>
                          <DatePickerView view="year" class="w-[calc(var(--reference-width)-(0.75rem*2))]">
                            <DatePickerContext>
                              {(api) => (
                                <>
                                  <DatePickerViewControl>
                                    <DatePickerViewTrigger>
                                      <DatePickerRangeText />
                                    </DatePickerViewTrigger>
                                  </DatePickerViewControl>
                                  <DatePickerTable>
                                    <DatePickerTableBody>
                                      <Index
                                        each={api().getYearsGrid({
                                          columns: 4,
                                        })}
                                      >
                                        {(years) => (
                                          <DatePickerTableRow>
                                            <Index each={years()}>
                                              {(year) => (
                                                <DatePickerTableCell value={year().value}>
                                                  <DatePickerTableCellTrigger>
                                                    {year().label}
                                                  </DatePickerTableCellTrigger>
                                                </DatePickerTableCell>
                                              )}
                                            </Index>
                                          </DatePickerTableRow>
                                        )}
                                      </Index>
                                    </DatePickerTableBody>
                                  </DatePickerTable>
                                </>
                              )}
                            </DatePickerContext>
                          </DatePickerView>
                        </DatePickerContent>
                      </Portal>
                    </DatePicker>
                  </div>
                  <div class="flex flex-col gap-4">
                    <Index each={dO()[1]}>
                      {(daySlot, dIndex) => (
                        <div class="grid gap-4">
                          <div class="w-full flex flex-row items-center justify-between gap-2">
                            <span class="text-sm">Slots for {dayjs(daySlot().date).format("dddd, MMMM Do YYYY")}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                const oldSlots = daySlot().slots;
                                const newSlot = {
                                  title: "",
                                  information: "",
                                  start: dayjs(daySlot().date).add(1, "hour").toDate(),
                                  end: dayjs(daySlot().date).add(2, "hour").toDate(),
                                } satisfies TimeSlot;
                                const newSlots = oldSlots.concat(newSlot);
                                const cX = update(daySlots, index, "slots", newSlots);
                                setDaySlots(cX);
                              }}
                            >
                              <Plus class="size-4" />
                            </Button>
                          </div>
                          <Index each={daySlot().slots}>
                            {(slot, slotIndex) => (
                              <div class="grid gap-4 border border-neutral-200 dark:border-neutral-800 p-4 rounded-sm">
                                <div class="flex flex-row items-center justify-between gap-2">
                                  <TextFieldRoot
                                    class="w-full flex flex-col gap-2"
                                    aria-label="Title"
                                    defaultValue={slot().title}
                                    onChange={(v) => {
                                      if (!v) return;
                                      const x = update(daySlots, dIndex, "slots", slotIndex, "title", v);
                                      setDaySlots(x);
                                    }}
                                  >
                                    <TextFieldLabel>Title</TextFieldLabel>
                                    <TextField class="w-full" placeholder="Enter a title" type="text" />
                                  </TextFieldRoot>
                                  <div class="flex flex-row items-start justify-start gap-2 h-full">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => {
                                        const oldSlots = daySlot().slots;
                                        const newSlot = oldSlots.filter((_, i) => i !== slotIndex);
                                        const cX = update(daySlots, index, "slots", newSlot);
                                        setDaySlots(cX);
                                      }}
                                    >
                                      <Minus class="size-4" />
                                    </Button>
                                  </div>
                                </div>
                                <TextFieldRoot
                                  class="w-full flex flex-col gap-2"
                                  aria-label="Title"
                                  defaultValue={slot().information}
                                  onChange={(v) => {
                                    if (!v) return;
                                    const x = update(daySlots, dIndex, "slots", slotIndex, "information", v);
                                    setDaySlots(x);
                                  }}
                                >
                                  <TextFieldLabel>Title</TextFieldLabel>
                                  <TextArea class="w-full" placeholder="Write some information" rows={3} />
                                </TextFieldRoot>
                                <div class="grid grid-cols-2 gap-4">
                                  <div class="space-y-2">
                                    <label
                                      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      for="start-time"
                                    >
                                      Start Time
                                    </label>
                                    <Button
                                      class="w-full flex flex-row items-center justify-center gap-2"
                                      variant="outline"
                                    >
                                      <Clock class="size-4" />
                                      <Show when={slot().start} fallback={<span>Select start time</span>}>
                                        <span>{dayjs(slot().start).format("hh:mm")}</span>
                                      </Show>
                                    </Button>
                                  </div>
                                  <div class="space-y-2">
                                    <label
                                      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      for="end-time"
                                    >
                                      End Time
                                    </label>
                                    <Button
                                      class="w-full flex flex-row items-center justify-center gap-2"
                                      variant="outline"
                                    >
                                      <Clock class="size-4" />
                                      <Show when={slot().end} fallback={<span>Select end time</span>}>
                                        <span>{dayjs(slot().end).format("hh:mm")}</span>
                                      </Show>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Index>
                        </div>
                      )}
                    </Index>
                  </div>
                </div>
              )}
            </Index>
            <Show when={!allDateHaveADayslot() && Object.keys(groupByDay()).length > 0 && date().length > 0}>
              <Button class="flex flex-col gap-2 w-full h-full" variant="outline" onClick={addDaySlot}>
                <Plus class="size-4" />
                <span class="text-sm font-medium">Add Day</span>
              </Button>
            </Show>
          </div>
        </div>
      </div>
      <div class="w-full flex flex-row items-center justify-between gap-2">
        <div class="w-full"></div>
        <div class="w-max flex flex-row items-center justify-end gap-2">
          <Button
            disabled={props.isSaving()}
            size="sm"
            class="w-full flex flex-row items-center justify-center gap-2"
            onClick={async () => {
              props.onSubmit(date(), daySlots());
            }}
          >
            <Switch>
              <Match when={!props.isSaving()}>
                <span class="text-sm font-medium leading-none">Save</span>
              </Match>
              <Match when={props.isSaving()}>
                <Loader2 class="w-4 h-4 animate-spin" />
                <span class="text-sm font-medium leading-none">Saving</span>
              </Match>
            </Switch>
          </Button>
          <A href={`/dashboard/p/${props.plan.id}/edit/location`}>
            <Button size="sm" class="w-full flex flex-row items-center justify-center gap-2">
              <span class="text-sm font-medium leading-none">Next</span>
            </Button>
          </A>
        </div>
      </div>
    </>
  );
};
