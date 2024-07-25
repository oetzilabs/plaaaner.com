import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getLocale } from "@/lib/api/locale";
import { getPlans } from "@/lib/api/plans";
import type { UserSession } from "@/lib/auth/util";
import { As } from "@kobalte/core";
import { createAsync } from "@solidjs/router";
import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import localeData from "dayjs/plugin/localeData";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import updateLocale from "dayjs/plugin/updateLocale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-solid";
import { createSignal, For, Match, onMount, Show, Switch } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { CreatePlanPopover } from "./create-plan-popover";
dayjs.extend(advancedFormat);
dayjs.extend(localeData);
dayjs.extend(updateLocale);
dayjs.extend(LocalizedFormat);
dayjs.extend(isoWeek);

type TimeSlot =
  | { type: "empty"; timeslot: Dayjs }
  | { type: "plan"; value: Awaited<ReturnType<typeof getPlans>>[number]; timeslot: Dayjs };

export const Calendar = (props: { session: UserSession }) => {
  const locale = createAsync(() => getLocale(), { deferStream: true });
  onMount(() => {
    const l = locale();
    if (!l) return;
    console.log("updated locale to:", l);
    dayjs.updateLocale(l.language, { weekStart: l.startOfWeek });
  });
  const plans = createAsync(() => getPlans());
  const [currentDate, setCurrentDate] = createSignal(dayjs());

  const createCalendar = () => {
    const start = currentDate().startOf("week");
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(start.add(i, "day"));
    }
    return days;
  };

  const hours = () => {
    const amountOfSplits = 48;
    return Array.from({ length: amountOfSplits }).map((_, i) => {
      return dayjs()
        .startOf("day")
        .add(30 * i, "minutes");
    });
  };

  const hoursWithPlan = (theplans: NonNullable<Awaited<ReturnType<typeof plans>>>, day: dayjs.Dayjs) => {
    const amountOfSplits = 48;
    const eventsForDay = theplans.filter(
      (tp) => dayjs(tp.starts_at).isSame(day, "day") || dayjs(tp.ends_at).isSame(day, "day")
    );
    const slots: TimeSlot[] = Array(48)
      .fill({})
      .map((_, i) => ({ type: "empty", timeslot: day.startOf("day").add(i * 30, "minutes") }));

    eventsForDay.forEach((event) => {
      const startTimeSlot = Math.floor(event.starts_at.getHours() * 2 + event.starts_at.getMinutes() / 30);
      const endTimeSlot = Math.floor(event.ends_at.getHours() * 2 + event.ends_at.getMinutes() / 30);

      for (let i = startTimeSlot; i < endTimeSlot; i++) {
        slots[i] = { type: "plan", value: event, timeslot: slots.at(i)!.timeslot };
      }
    });

    return slots;
  };

  const changeWeek = (direction: -1 | 1) => {
    setCurrentDate((c) => c.add(direction, "week"));
  };

  const [newPlanArea, setNewPlanArea] = createStore<{
    startsAt: Dayjs | null;
    endsAt: Dayjs | null;
    startSlot: number | null;
    endSlot: number | null;
    isMoving: boolean;
  }>({
    startsAt: null,
    endsAt: null,
    startSlot: null,
    endSlot: null,
    isMoving: false,
  });

  const onDragStart = (event: MouseEvent, start: Dayjs, slot: number) => {
    setNewPlanArea(produce((s) => ({ startsAt: start, endsAt: null, startSlot: slot })));
  };

  const onDragMove = (event: MouseEvent, end: Dayjs, slot: number) => {
    if (!newPlanArea.startsAt) return;
    setNewPlanArea(produce((s) => ({ ...s, endsAt: end, endSlot: slot, isMoving: true })));
  };

  const onDragEnd = (event: MouseEvent, end: Dayjs, slot: number) => {
    setNewPlanArea(produce((s) => ({ ...s, endsAt: end, endSlot: slot, isMoving: false })));
  };

  return (
    <div class="w-full flex flex-col h-full relative">
      <div class="sticky top-0 flex flex-col">
        <div class="flex flex-row items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 p-2">
          <div class="w-full"></div>
          <div class="flex-1 flex items-center justify-center">
            <div class="flex flex-row gap-2 items-center justify-center">
              <Button variant="outline" size="icon" class="size-6" onClick={() => changeWeek(-1)}>
                <ChevronLeft class="size-3" />
              </Button>
              <div class="text-muted-foreground w-max text-xs">Week {currentDate().format("WW")}</div>
              <Button variant="outline" size="icon" class="size-6" onClick={() => changeWeek(1)}>
                <ChevronRight class="size-3" />
              </Button>
            </div>
          </div>
        </div>
        <div class="flex flex-row w-full bg-background">
          <div class="flex flex-row w-full">
            <div class="w-20 relative p-2 border-b border-r border-neutral-200 dark:border-neutral-800">
              <span class="invisible w-full">TEST</span>
            </div>
            <For each={createCalendar()}>
              {(day) => (
                <div class="flex-1 relative py-3 border-b border-r border-neutral-200 dark:border-neutral-800 items-center justify-center flex text-xs">
                  {day.format("ddd Do MMM")}
                </div>
              )}
            </For>
            <div class="w-3 bg-transparent"></div>
          </div>
        </div>
      </div>
      <div class="w-full flex flex-col h-[calc(100%-72px)] relative">
        <div class="w-full flex flex-row h-full absolute top-0 bottom-0 left-0 right-0 -z-10">
          <div class="w-20 h-full"></div>
          <div class="flex-1 flex flex-col relative h-full grow">
            <div class="flex flex-row h-full w-full">
              <For each={createCalendar()}>
                {(day) => (
                  <div class="w-full h-full relative border-r border-neutral-200 dark:border-neutral-800"></div>
                )}
              </For>
            </div>
          </div>
          <div class="w-3 h-full"></div>
        </div>
        <div class="w-full flex flex-row overflow-y-auto">
          <div class="w-20 grid grid-cols-1 grid-rows-[48]">
            <For each={hours()}>
              {(d) => (
                <div class="text-xs h-10 flex items-center justify-center border-b border-r border-neutral-200 dark:border-neutral-800 py-3 w-full">
                  {d.format("LT")}
                </div>
              )}
            </For>
          </div>
          <Show when={typeof plans !== "undefined" && plans()}>
            {(theplans) => (
              <div class="flex-1 flex flex-col relative grow">
                <div class="flex flex-row w-full">
                  <For each={createCalendar()}>
                    {(day) => (
                      <div class="w-full grid grid-cols-1 grid-row-[48] relative">
                        {/*
                        <Show when={newPlanArea.startsAt !== null}>
                          <div class="w-full grid grid-cols-1 grid-row-[48] absolute z-10">
                            <div
                              class={cn({
                                "grid-row": `span ${newPlanArea.startSlot} / span ${newPlanArea.startSlot}`,
                              })}
                            />
                            <div
                              class={cn("bg-indigo-50 dark:bg-indigo-950 w-full h-full", {
                                "grid-row": `span ${newPlanArea.endSlot} / span ${newPlanArea.endSlot}`,
                              })}
                            />
                          </div>
                        </Show>
                        */}
                        <For each={hoursWithPlan(theplans(), day)}>
                          {(d, di) => (
                            <div
                              class="text-xs h-10 flex items-center justify-center border-b border-neutral-100 dark:border-neutral-900 w-full"
                              onMouseDown={(e) => {
                                onDragStart(e, d.timeslot, di());
                              }}
                              onMouseMove={(e) => {
                                onDragMove(e, d.timeslot, di());
                              }}
                              onMouseUp={(e) => {
                                onDragEnd(e, d.timeslot, di());
                              }}
                            >
                              <Switch>
                                <Match when={d.type !== "plan" && d}>
                                  {(dd) => (
                                    <Popover>
                                      <PopoverTrigger
                                        as={Button}
                                        variant="ghost"
                                        class="w-full h-full flex flex-col items-center justify-center group rounded-none"
                                      >
                                        <div class="text-muted-foreground group-hover:visible invisible flex flex-row items-center justify-center gap-2">
                                          <Plus class="size-4" />
                                          <span>Create</span>
                                        </div>
                                      </PopoverTrigger>
                                      <PopoverContent>
                                        <CreatePlanPopover timeslot={dd().timeslot} />
                                      </PopoverContent>
                                    </Popover>
                                  )}
                                </Match>
                                <Match when={d.type === "plan" && d.value}>
                                  {(p) => (
                                    <Popover>
                                      <PopoverTrigger class="w-full h-full flex flex-col items-center justify-center group">
                                        <div class="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 w-full h-full p-2 flex flex-row gap-2">
                                          <div class="flex-1 truncate text-white text-sm font-bold py-1">
                                            {p().name}
                                          </div>
                                          <div class="w-max truncate text-white text-xs py-1">
                                            {dayjs(p().starts_at).format("LT")}
                                          </div>
                                        </div>
                                      </PopoverTrigger>
                                      <PopoverContent>
                                        <div class="w-full font-bold">{p().name}</div>
                                      </PopoverContent>
                                    </Popover>
                                  )}
                                </Match>
                              </Switch>
                            </div>
                          )}
                        </For>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </Show>
        </div>
      </div>
    </div>
  );
};
