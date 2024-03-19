import { createAsync } from "@solidjs/router";
import { createSignal, For, onMount } from "solid-js";
import type { UserSession } from "@/lib/auth/util";
import { getPlans } from "@/lib/api/plans";
import { getLocale } from "@/lib/api/locale";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import updateLocale from "dayjs/plugin/updateLocale";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-solid";
dayjs.extend(advancedFormat);
dayjs.extend(updateLocale);
dayjs.extend(LocalizedFormat);
dayjs.extend(isoWeek);

export const Calendar = (props: { session: UserSession }) => {
  const locale = createAsync(() => getLocale(), { deferStream: true });
  onMount(() => {
    const l = locale();
    if (!l) return;
    dayjs.updateLocale(l.language, { weekStart: l.startOfWeek });
  });
  const plans = createAsync(() => getPlans(), { deferStream: true });
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

  const changeWeek = (direction: -1 | 1) => {
    setCurrentDate((c) => c.add(direction, "week"));
  };

  return (
    <div class="w-full flex flex-col h-full relative">
      <div class="sticky top-0 flex flex-col">
        <div class="flex flex-row items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 p-2">
          <div class="w-full">
          </div>
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
      <div class="w-full flex flex-col h-full relative">
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
        <div class="w-full flex flex-row h-full overflow-y-auto">
          <div class="w-20 flex flex-col h-full">
            <For each={hours()}>
              {(d) => (
                <div class="text-xs h-10 flex items-center justify-center border-b border-r border-neutral-200 dark:border-neutral-800 py-3 w-full">
                  {d.format("LT")}
                </div>
              )}
            </For>
          </div>
          <div class="flex-1 flex flex-col relative h-full grow">
            <div class="flex flex-row h-full w-full">
              <For each={createCalendar()}>{(day) => <div class="w-full h-full relative"></div>}</For>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
