import { As } from "@kobalte/core";
import dayjs from "dayjs";
import { ArrowLeft, ArrowRight } from "lucide-solid";
import { For, createEffect, createSignal } from "solid-js";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../popover";
import { TextFieldInput } from "../textfield";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);

export default function DateCalendar(props: { onChange: (date: Date | string) => void; value?: Date | string }) {
  const [date, setDate] = createSignal(props.value);
  createEffect(() => {
    if (props.value) {
      if (props.value !== date()) {
        setDate(props.value);
      }
    }
  });

  const daysInMonth = () => {
    return dayjs(date()).daysInMonth();
  };

  const firstDay = () => {
    return dayjs(date()).startOf("month").day();
  };

  const isToday = (date: Date | string) => {
    return dayjs(date).isSame(dayjs(), "day");
  };

  return (
    <div class="flex flex-col items-center gap-2 p-2 border border-muted rounded-lg">
      <div class="flex justify-between w-full items-center">
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            setDate(dayjs(date()).subtract(1, "month").toDate());
            props.onChange(dayjs(date()).subtract(1, "month").toDate());
          }}
        >
          <ArrowLeft class="w-4 h-4" />
        </Button>
        <div class="text-sm font-bold">{dayjs(date()).format("MMMM YYYY")}</div>
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            setDate(dayjs(date()).add(1, "month").toDate());
            props.onChange(dayjs(date()).add(1, "month").toDate());
          }}
        >
          <ArrowRight class="w-4 h-4" />
        </Button>
      </div>
      <div class="w-full flex flex-col gap-2 border border-muted rounded-lg p-2">
        <div class="grid grid-cols-7 gap-1 w-full p-2 bg-muted rounded-lg ">
          <For each={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}>
            {(day) => <div class="text-center uppercase text-xs">{day}</div>}
          </For>
        </div>
        <div class="grid grid-cols-7 gap-1 w-full">
          <For each={Array.from({ length: firstDay() }).map((_, i) => i)}>
            {(day, i) => <div class="text-center"></div>}
          </For>
          <For
            each={Array.from({ length: daysInMonth() }).map((_, i) => {
              return dayjs(date())
                .set("date", i + 1)
                .toDate();
            })}
          >
            {(day, i) => (
              <Button
                variant={
                  dayjs(day).isSame(dayjs(date()), "day")
                    ? "default"
                    : isToday(day)
                      ? isToday(date()!)
                        ? "default"
                        : "outline"
                      : "ghost"
                }
                class="text-center"
                onClick={() => {
                  setDate(
                    dayjs(date())
                      .date(i() + 1)
                      .toDate(),
                  );
                  props.onChange(
                    dayjs(date())
                      .date(i() + 1)
                      .toDate(),
                  );
                }}
              >
                {i() + 1}
              </Button>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
