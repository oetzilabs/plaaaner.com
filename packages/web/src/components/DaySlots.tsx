import { Popover } from "@kobalte/core/popover";
import type { Plans } from "@oetzilabs-plaaaner-com/core/src/entities/plans";
import { A } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import tz from "dayjs/plugin/timezone";
import { Loader2 } from "lucide-solid";
import { createMemo, createSignal, Index, Match, Show, Switch } from "solid-js";
import type { DaySlots as DS, TimeSlot } from "../lib/api/plans";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { PopoverContent, PopoverTrigger } from "./ui/popover";

dayjs.extend(tz);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

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
            title: time.title,
            information: time.description,
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
            title: time.title,
            information: time.description,
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
  onSubmit: (date: string[], daySlots: DS[]) => void;
  isSaving: () => boolean;
  plan: Plans.Frontend;
}) => {
  const [timezone, setTimeZone] = createSignal("UTC");

  const [daySlots, setDaySlots] = createSignal<DS[]>(createInitialDaySlots(props.plan.times, props.plan.ends_at));

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

  const createWeek = createMemo(() => {
    const days = 7;
    const week: DS[] = [];
    for (let i = 0; i < days; i++) {
      const date = dayjs(props.plan.starts_at).add(i, "day").toISOString().split("T")[0];
      week.push({
        date,
        slots: [],
      });
    }

    for (let i = 0; i < props.plan.times.length; i++) {
      const time = props.plan.times[i];
      const date = dayjs(time.starts_at).startOf("day").toISOString().split("T")[0];
      if (week.find((w) => w.date === date)) {
        week
          .find((w) => w.date === date)
          ?.slots.push({
            title: time.title,
            information: time.description,
            start: time.starts_at,
            end: time.ends_at,
          });
      }
    }

    return week;
  });

  const createDay = (slots: TimeSlot[]) => {
    const hours = 24;
    const slotsByHours: (TimeSlot | undefined)[] = [];

    for (let i = 0; i < hours; i++) {
      const slot = slots.find((s) => dayjs(s.start).hour() === i);
      if (slot) {
        console.log("slot found", slot);
        slotsByHours.push(slot);
      } else {
        slotsByHours.push(undefined);
      }
    }
    return slotsByHours;
  };

  return (
    <>
      <div class="flex flex-col gap-4 w-full grow bg-background">
        <div class="flex flex-col gap-1 w-full grow pr-2">
          <div class="grid grid-cols-1 lg:grid-cols-7 w-full border border-neutral-200 dark:border-neutral-800 rounded-md overflow-y-auto h-full max-h-[550px]">
            <Index each={createWeek()}>
              {(daySlot, index) => (
                <div
                  class={cn(
                    "grow border-r border-neutral-100 dark:border-neutral-900 flex flex-col w-full bg-background",
                    {
                      "border-r-0": index === 6,
                    },
                  )}
                >
                  <div class="w-full items-center justify-center p-2 hidden lg:flex bg-neutral-50 dark:bg-neutral-950">
                    {dayjs(daySlot().date).format("LL")}
                  </div>
                  <div class="grow flex flex-col border-t border-neutral-200 dark:border-neutral-800">
                    <Index each={createDay(daySlot().slots)}>
                      {(slot, index) => (
                        <div
                          class={cn("grow border-b border-neutral-100 dark:border-neutral-900 flex flex-col h-full", {
                            "border-b-0": index === 23,
                          })}
                        >
                          <div class="w-full items-center justify-center min-h-10">
                            <Show when={slot()} keyed fallback={<div class=""></div>}>
                              {(slot) => (
                                <Popover>
                                  <PopoverTrigger class="flex flex-row items-center justify-center gap-2 w-full h-full">
                                    <span>{dayjs(slot.start).format("hh:mm")}</span>
                                  </PopoverTrigger>
                                  <PopoverContent class="flex flex-col gap-2 p-2">
                                    <span class="text-xs text-muted-foreground">
                                      {dayjs(slot.start).format("hh:mm")}
                                    </span>
                                    <div class="flex flex-col gap-0.5">
                                      <span class="font-bold text-lg">{!!slot.title ? slot.title : "No title"}</span>
                                      <span class="text-sm">
                                        {!!slot.information ? slot.information : "No description"}
                                      </span>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </Show>
                          </div>
                        </div>
                      )}
                    </Index>
                  </div>
                </div>
              )}
            </Index>
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
              // props.onSubmit(date(), daySlots());
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
