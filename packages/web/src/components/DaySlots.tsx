import type { Plans } from "@oetzilabs-plaaaner-com/core/src/entities/plans";
import { A } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import { Loader2, Menu, Pencil, Plus, Save, Trash, X } from "lucide-solid";
import { createMemo, createSignal, For, Index, Match, Show, Switch } from "solid-js";
import type { DaySlots, TimeSlot } from "../lib/api/plans";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

export const CalendarDashboard = (props: {
  onSubmit: (daySlots: DaySlots[]) => void;
  isSaving: () => boolean;
  plan: Plans.Frontend;
}) => {
  const [slots, setSlots] = createSignal(props.plan.times);
  return (
    <div class="flex flex-col gap-4 w-full grow bg-background">
      <div class="flex flex-col gap-4 w-full grow">
        <div class="flex flex-row items-center justify-between">
          <span class="text-sm font-bold">{props.plan.times.length} Timeslots</span>
          <div class="flex flex-row gap-2">
            <Button class="w-full flex flex-row items-center justify-center gap-2" variant="secondary" size="sm">
              <Plus class="size-4" />
              Add a new timeslot
            </Button>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">
          <Index each={slots()}>
            {(timeslot) => (
              <div class="border border-neutral-200 dark:border-neutral-800 flex flex-col w-full bg-background rounded-md p-3 h-max">
                <div class="flex flex-row items-center justify-between">
                  <span class="text-lg font-bold">{!!timeslot().title ? timeslot().title : "No title"}</span>
                  <div class="w-max flex-1 flex flex-row items-center justify-end gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        as={Button}
                        variant="ghost"
                        class="flex flex-row items-center justify-center gap-2 size-8"
                        size="icon"
                      >
                        <Menu class="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          class="flex flex-row items-center justify-start gap-2 cursor-pointer"
                          onSelect={() => {}}
                        >
                          <Pencil class="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          class="flex flex-row items-center justify-start gap-2 cursor-pointer"
                          onSelect={() => {
                            setSlots((s) => s.filter((t) => t.id !== timeslot().id));
                          }}
                        >
                          <Trash class="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div class="flex flex-col gap-0.5">
                  <Show
                    when={timeslot().description}
                    keyed
                    fallback={<span class="text-sm text-muted-foreground">No description</span>}
                  >
                    {(d) => <span class="text-sm text-muted-foreground">{d}</span>}
                  </Show>
                  <span class="text-xs text-muted-foreground italic">
                    {dayjs(timeslot().starts_at).format("hh:mm A")} - {dayjs(timeslot().ends_at).format("hh:mm A")}
                  </span>
                </div>
              </div>
            )}
          </Index>
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
              const s = slots();
              const map = new Map<string, DaySlots>();
              for (let i = 0; i < s.length; i++) {
                const slot = s[i];
                const date = dayjs(slot.starts_at).format("YYYY-MM-DD");
                if (map.has(date)) {
                  map.get(date)?.slots.push({
                    start: slot.starts_at,
                    end: slot.ends_at,
                    title: slot.title,
                    information: slot.description,
                  });
                } else {
                  map.set(date, {
                    date,
                    slots: [
                      {
                        start: slot.starts_at,
                        end: slot.ends_at,
                        title: slot.title,
                        information: slot.description,
                      },
                    ],
                  });
                }
              }
              const ds = Array.from(map.values());

              props.onSubmit(ds);
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
        </div>
      </div>
    </div>
  );
};
