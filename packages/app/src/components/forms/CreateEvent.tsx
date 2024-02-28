import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemLabel,
  RadioGroupLabel,
} from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField, TextFieldInput, TextFieldLabel } from "@/components/ui/textfield";
import {
  createNewEvent,
  getDefaultFreeTicketType,
  getEventTypeId,
  getPreviousEvents,
  getRecommendedEvents,
} from "@/lib/api/events";
import { cn } from "@/lib/utils";
import { BaseTicketSchema, CreateEventFormSchema } from "@/utils/schemas/event";
import { today } from "@internationalized/date";
import { As } from "@kobalte/core";
import { createUndoHistory } from "@solid-primitives/history";
import { createAsync, useAction, useNavigate, useSubmission } from "@solidjs/router";
import { omit, update } from "@solid-primitives/signal-builders";
import { clientOnly } from "@solidjs/start";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import tz from "dayjs/plugin/timezone";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Calendar,
  CheckCheck,
  Clock,
  Clover,
  Container,
  Eraser,
  Globe,
  History,
  Library,
  Loader2,
  MapPin,
  Minus,
  PartyPopper,
  Plus,
  Redo,
  Sparkles,
  Ticket,
  Trash,
  Undo,
} from "lucide-solid";
import { For, Match, Show, Switch, createMemo, createSignal, onMount } from "solid-js";
import { toast } from "solid-sonner";
import { Transition } from "solid-transition-group";
import { z } from "zod";
import URLPreview from "../URLPreview";
import { TextFieldTextArea } from "../ui/textarea";
import { EditTicketForm } from "./EditTicketForm";
import { createMediaQuery } from "@solid-primitives/media";
dayjs.extend(tz);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

const ClientMap = clientOnly(() => import("../ClientMap"));

type TabValue = "general" | "time" | "location" | "tickets";

const TabMovement: Record<"forward" | "backward", Record<TabValue, TabValue | undefined>> = {
  forward: {
    general: "time",
    time: "location",
    location: "tickets",
    tickets: undefined,
  },
  backward: {
    general: undefined,
    time: "general",
    location: "time",
    tickets: "location",
  },
};

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

  return (
    <div class="flex flex-col gap-4 w-full">
      <TextField class="w-full flex flex-col gap-2" aria-label="Start Time">
        <div class="flex flex-row items-center justify-between w-full">
          <TextFieldLabel class="w-full flex flex-col gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Start Time
            <TextFieldInput
              class="w-full"
              placeholder="Start time"
              type="time"
              value={dayjs(start()).format("hh:mm")}
              onChange={(e) => {
                setStart(dayjs(e.target.value, dateFormat).toDate());
              }}
            />
          </TextFieldLabel>
        </div>
      </TextField>
      <TextField class="w-full flex flex-col gap-2" aria-label="Start Time">
        <div class="flex flex-row items-center justify-between w-full">
          <TextFieldLabel class="w-full flex flex-col gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            End Time
            <TextFieldInput
              class="w-full"
              placeholder="End time"
              type="time"
              value={dayjs(end()).format("hh:mm")}
              onChange={(e) => {
                setEnd(dayjs(e.target.value, dateFormat).toDate());
              }}
            />
          </TextFieldLabel>
        </div>
      </TextField>
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

export default function CreatePlanForm(props: { event_type: z.infer<typeof CreateEventFormSchema>["event_type"] }) {
  const previousEvents = createAsync(() => getPreviousEvents());
  const recommendedEvents = createAsync(() => getRecommendedEvents());
  const event_type_id = createAsync(() => getEventTypeId(props.event_type));
  const defaultFreeTicketType = createAsync(() => getDefaultFreeTicketType());
  const createEvent = useAction(createNewEvent);
  const isCreatingEvent = useSubmission(createNewEvent);
  const isSmall = createMediaQuery("(max-width: 768px)", true);

  const DEFAULT_EVENT: z.infer<typeof CreateEventFormSchema> = {
    event_type: props.event_type,
    name: "",
    description: "",
    days: [dayjs().startOf("day").toDate(), dayjs().startOf("day").add(1, "day").toDate()],
    time_slots: {
      [dayjs().startOf("day").format("YYYY-MM-DD")]: {
        [dayjs().startOf("day").format("YYYY-MM-DD h:mm A")]: {
          start: dayjs().startOf("day").toDate(),
          end: dayjs().endOf("day").toDate(),
        },
      },
    },
    tickets: [],
    capacity: {
      capacity_type: "none",
      value: "none",
    },
    location: {
      location_type: "other",
      details: "",
    },
  };

  const navigate = useNavigate();

  let formRef: HTMLFormElement;

  const [newEvent, setNewEvent] = createSignal<z.infer<typeof CreateEventFormSchema>>(DEFAULT_EVENT);
  const [trackClearEvent, clearEventHistory] = createSignal(undefined, { equals: false });
  const eventHistory = createMemo(() => {
    // track what should rerun the memo
    trackClearEvent();
    return createUndoHistory(
      () => {
        const v = newEvent();
        return () => {
          setNewEvent(v);
        };
      },
      {
        limit: 1000,
      }
    );
  });

  const [timezone, setTimeZone] = createSignal("UTC");
  onMount(() => {
    setTimeZone(dayjs.tz.guess());
  });

  const [currentTab, setCurrentTab] = createSignal<TabValue>("general");
  const handleTabChange = (direction: "forward" | "backward") => {
    const current = currentTab();
    const next = TabMovement[direction][current];
    if (next) {
      setCurrentTab(next);
    }
  };

  const [locationQuery, setLocationQuery] = createSignal("");
  const [urlQuery, setURLQuery] = createSignal("");

  const suggestNewNames = () => {
    const ne = newEvent();
    if (!ne) {
      return [];
    }
    const name = ne.name;
    const pE = previousEvents();
    if (!pE) {
      return [];
    }
    if (name.length === 0) {
      return [];
    }
    // is the name already in the list?
    const existsStartingWithLowerCase = pE.find((pPlan) => pPlan.name.toLowerCase().startsWith(name.toLowerCase()));
    const existsExactLowercase = pE.find((pPlan) => pPlan.name.toLowerCase() === name.toLowerCase());

    if (!existsExactLowercase) {
      return [];
    }
    if (!existsStartingWithLowerCase) {
      return [];
    }
    const lastCounter = pE.reduce((acc, pPlan) => {
      const pPlanName = pPlan.name.toLowerCase();

      // find the last number in the name, if it exists. the name can be "name-1" or "name 1" or even "name1"
      const lastNumber = pPlanName.match(/(\d+)$/);

      if (lastNumber) {
        const counter = parseInt(lastNumber[0]);
        if (counter > acc) {
          return counter;
        }
      }
      return acc;
    }, 0);

    if (lastCounter === 0) {
      return [];
    }
    const suggestions = [];
    const nameWithoutCounter = name.replace(/(\d+)$/, "").trim();
    for (let i = 1; i < 4; i++) {
      suggestions.push(`${nameWithoutCounter} ${lastCounter + i}`);
    }
    return suggestions;
  };

  const isAllowedToCreatePlan = () => {
    const firstCondition = CreateEventFormSchema.safeParse(newEvent());
    if (!firstCondition.success) {
      return false;
    }
    const sn = suggestNewNames();
    const secondCondition = sn.length === 0;
    return firstCondition.success && secondCondition;
  };

  const isFormEmpty = (plan: z.infer<typeof CreateEventFormSchema>) => {
    // check deep equality
    return JSON.stringify(plan) === JSON.stringify(DEFAULT_EVENT);
  };

  const calculateRemainingTicketsQuantity = (ticket: z.infer<typeof BaseTicketSchema>): number => {
    const totalTickets = newEvent()
      .tickets.filter((x) => x.ticket_type !== ticket.ticket_type)
      .reduce((acc, t) => acc + t.quantity, 0);
    const remainingTickets =
      newEvent().capacity.capacity_type === "none"
        ? 0
        : parseInt(
            newEvent().capacity.value as Exclude<
              z.infer<typeof CreateEventFormSchema>["capacity"]["value"],
              "none" | number
            >
          ) - totalTickets;
    if (ticket.ticket_type.payment_type === "FREE") {
      return remainingTickets;
    }
    const paidTickets = newEvent().tickets.filter((t) => t.ticket_type.name.startsWith("paid"));
    const remainingPaidTickets = paidTickets.reduce((acc, t) => acc + t.quantity, 0);
    return remainingPaidTickets;
  };

  const tooManyTicketsCheck = () => {
    const nc = newEvent();
    if (!nc) {
      return {
        message: `You have not set a capacity for the ${props.event_type}.`,
        type: "error",
      };
    }
    const totalTickets = nc.tickets.reduce((acc, t) => acc + t.quantity, 0);
    const cp = nc.capacity;
    const cpt = cp.capacity_type;
    if (cpt === "none") {
      return {
        message: `You have not set a capacity for the ${props.event_type}.`,
        type: "error",
      };
    }
    const cpv = parseInt(String(cp.value));
    if (totalTickets === cpv) {
      return {
        message: `You have reached the maximum capacity of tickets for this ${props.event_type}.`,
        type: "success:done",
      } as const;
    }
    if (totalTickets > cpv) {
      return {
        message: `You have exceeded the maximum capacity of tickets for this ${props.event_type}.\nPlease reduce the quantity.`,
        type: "error",
      } as const;
    }
    const difference = cpv - totalTickets;
    return {
      message: `Note: You have ${difference} ticket${difference === 1 ? "" : "s"} left to set up.`,
      type: "success:unfinished",
    } as const;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const nE = newEvent();
    await createEvent(nE);
  };

  const time_slots = () => newEvent().time_slots;

  const time_slots_length = () =>
    Object.values(time_slots()).reduce((acc, day) => {
      // Access nested object within 'day'
      const daySlots = Object.values(day);

      // Add length of each day's time slot array to accumulator
      return acc + daySlots.length;
    }, 0);

  return (
    <div class="flex flex-col gap-4 items-start w-full">
      <div class="flex flex-col">
        <Button
          variant="secondary"
          size="sm"
          class="w-max gap-2"
          onClick={() => {
            history.back();
          }}
        >
          <ArrowLeft class="w-4 h-4" />
          Back
        </Button>
      </div>
      <h1 class="text-3xl font-semibold w-full capitalize">Create {newEvent().event_type}</h1>
      <div class="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 py-4 w-full">
        <form onSubmit={handleSubmit} class="flex flex-col gap-6 xl:w-1/2 lg:w-2/3 w-full self-start" ref={formRef!}>
          <Show when={event_type_id()}>{(eti) => <input hidden value={eti()} name="event_type_id" />}</Show>
          <Tabs defaultValue="general" value={currentTab()} onChange={(value) => setCurrentTab(value as TabValue)}>
            <TabsList>
              <TabsTrigger value="general" class="text-sm font-medium leading-none gap-2 pl-1.5 md:pl-3">
                <Library class="w-3 h-3" />
                General
              </TabsTrigger>
              <TabsTrigger value="time" class="text-sm font-medium leading-none gap-2 pl-1.5 md:pl-3">
                <Clock class="w-3 h-3" />
                Time
              </TabsTrigger>
              <TabsTrigger value="location" class="text-sm font-medium leading-none gap-2 pl-1.5 md:pl-3">
                <MapPin class="w-3 h-3" />
                Location
              </TabsTrigger>
              <TabsTrigger value="tickets" class="text-sm font-medium leading-none gap-2 pl-1.5 md:pl-3">
                <Ticket class="w-3 h-3" />
                {newEvent().capacity.capacity_type !== "none" &&
                parseInt(
                  newEvent().capacity.value as Exclude<
                    z.infer<typeof CreateEventFormSchema>["capacity"]["value"],
                    "none"
                  > as string
                ) > 0
                  ? newEvent().capacity.value
                  : ""}{" "}
                Ticket
                {newEvent().capacity.capacity_type !== "none" &&
                parseInt(
                  newEvent().capacity.value as Exclude<
                    z.infer<typeof CreateEventFormSchema>["capacity"]["value"],
                    "none"
                  > as string
                ) === 1
                  ? ""
                  : "s"}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" class="flex flex-col gap-6 w-full">
              <TextField class="w-full flex flex-col gap-2" aria-label={`${props.event_type} Name`}>
                <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  The Name of the <span class="capitalize">{props.event_type}</span>
                </TextFieldLabel>
                <TextFieldInput
                  value={newEvent().name}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setNewEvent((ev) => ({ ...ev, name: value }));
                  }}
                />
                <Show
                  when={previousEvents() !== undefined && previousEvents()}
                  fallback={<Loader2 class="w-4 h-4 animate-spin" />}
                >
                  <Show when={suggestNewNames().length > 0 && suggestNewNames()}>
                    {(v) => (
                      <>
                        <span class="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          <span class="capitalize">{props.event_type}</span> '{newEvent().name}' exists already!
                          Suggested Names:
                        </span>
                        <div class="grid grid-cols-3 gap-2">
                          <For
                            each={v()}
                            fallback={
                              <div class="col-span-full">
                                <span class="text-sm font-medium leading-none text-emerald-500">
                                  Lucky you, the name is available!
                                </span>
                              </div>
                            }
                          >
                            {(suggestion) => (
                              <Button
                                asChild
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                  setNewEvent((ev) => ({ ...ev, name: suggestion }));
                                }}
                              >
                                <As component={Badge}>{suggestion}</As>
                              </Button>
                            )}
                          </For>
                        </div>
                      </>
                    )}
                  </Show>
                </Show>
              </TextField>
              <TextField class="w-full flex flex-col gap-2">
                <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  What is the {props.event_type} about? (optional)
                </TextFieldLabel>
                <TextFieldInput
                  aria-label={`What is the ${props.event_type} about? (optional)`}
                  value={newEvent().description ?? ""}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setNewEvent((ev) => ({ ...ev, description: value }));
                  }}
                />
              </TextField>
            </TabsContent>
            <TabsContent value="time" class="flex flex-col gap-6 w-full">
              <div class="flex flex-col gap-2 w-full">
                <TextField class="w-full flex flex-col gap-2" aria-label="Start Time">
                  <div class="flex flex-row items-center justify-between w-full">
                    <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      When is the {props.event_type}?
                    </TextFieldLabel>
                    <Button
                      size="sm"
                      variant={
                        dayjs(newEvent().days?.[0]).isSame(dayjs().startOf("day"), "day") ? "secondary" : "outline"
                      }
                      class="w-max gap-2 items-center justify-center"
                      type="button"
                      onClick={() => {
                        setNewEvent((ev) => {
                          return {
                            ...ev,
                            day: dayjs().startOf("day").toDate(),
                          };
                        });
                      }}
                    >
                      <Calendar class="w-3 h-3" />
                      Today
                    </Button>
                  </div>
                </TextField>
                <DatePicker
                  numOfMonths={2}
                  selectionMode="range"
                  min={today(timezone())}
                  timeZone={timezone()}
                  value={(newEvent().days ?? []).map((d) => dayjs(d).format("YYYY-MM-DD"))}
                  onValueChange={(date) => {
                    const tz = timezone();
                    const days = date.value.map((d) => dayjs(d.toDate(tz)).startOf("day").toDate());
                    if (days.length > 1) {
                      setNewEvent((ev) => {
                        return {
                          ...ev,
                          days,
                          time_slots: Object.fromEntries(
                            Array.from({ length: dayjs(days[1]).diff(dayjs(days[0]), "days") + 1 }).map((x, i) => [
                              dayjs(days[0]).add(i, "days").format("YYYY-MM-DD"),
                              {
                                [dayjs(days[0]).add(i, "days").format("YYYY-MM-DD h:mm A")]: {
                                  start: dayjs(days[0]).add(i, "days").startOf("day").toDate(),
                                  end: dayjs(days[0]).add(i, "days").endOf("day").toDate(),
                                },
                              },
                            ])
                          ),
                        };
                      });
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
                      each={Object.entries(newEvent().time_slots)}
                      fallback={
                        <div class="flex flex-col items-center justify-center text-muted-foreground border border-neutral-200 dark:border-neutral-800 rounded-md">
                          There are no time slots
                        </div>
                      }
                    >
                      {([string_date, time_slots_obj]) => (
                        <div class="flex flex-row w-full items-start justify-between border border-neutral-200 dark:border-neutral-800 rounded-md p-4 md:gap-8 gap-2">
                          <div class="w-max flex flex-col items-center justify-center px-5 py-3 min-w-20">
                            <div class="text-base font-black w-max">{dayjs(string_date).format("Do MMM")}</div>
                            <div class="text-xs font-medium">{dayjs(string_date).format("ddd")}</div>
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

                                          const new_newEvent = update(newEvent, "time_slots", time_slots_copy);
                                          const nne = new_newEvent();
                                          setNewEvent(nne);
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
                                        time_slots_copy[string_date] = ts;

                                        const new_newEvent = update(newEvent, "time_slots", time_slots_copy);
                                        const nne = new_newEvent();
                                        setNewEvent(nne);
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
                                const time_slots_copy = time_slots();
                                const the_day = time_slots_copy[string_date];
                                const sortedTimeSlots = Object.values(the_day).sort(
                                  (a, b) => b.start.getTime() - a.start.getTime()
                                );
                                if (sortedTimeSlots.length === 0) {
                                  const newStartTime = dayjs(string_date).startOf("day");
                                  const newEndTime = dayjs(string_date).endOf("day");
                                  const newTimeSlot = { start: newStartTime.toDate(), end: newEndTime.toDate() };
                                  const newTimeSlotString = newStartTime.format("YYYY-MM-DD h:mm A");

                                  const new_newEvent = update(
                                    newEvent,
                                    "time_slots",
                                    string_date,
                                    newTimeSlotString,
                                    newTimeSlot
                                  );
                                  const nne = new_newEvent();
                                  setNewEvent(nne);
                                  return;
                                }
                                const lastTimeSlot = sortedTimeSlots[0];
                                const newStartTime = dayjs(lastTimeSlot.end).add(1, "minute");
                                const newEndTime = dayjs(newStartTime).add(1, "hour");
                                const newTimeSlot = { start: newStartTime.toDate(), end: newEndTime.toDate() };
                                const newTimeSlotString = newStartTime.format("YYYY-MM-DD h:mm A");

                                const new_newEvent = update(
                                  newEvent,
                                  "time_slots",
                                  string_date,
                                  newTimeSlotString,
                                  newTimeSlot
                                );
                                const nne = new_newEvent();
                                setNewEvent(nne);
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
            </TabsContent>
            <TabsContent value="location" class="flex flex-col gap-6 w-full">
              <div class="flex flex-col items-start justify-between gap-2 w-full">
                <RadioGroup
                  value={newEvent().location.location_type}
                  aria-label={`Where is the ${props.event_type}?`}
                  onChange={(value) => {
                    const v = value as ReturnType<typeof newEvent>["location"]["location_type"];
                    switch (v) {
                      case "venue":
                        setNewEvent((ev) => {
                          return {
                            ...ev,
                            location: {
                              location_type: v,
                              address: "",
                            },
                          };
                        });
                        break;
                      case "online":
                        setNewEvent((ev) => {
                          return {
                            ...ev,
                            location: {
                              location_type: v,
                              url: "",
                            },
                          };
                        });
                        break;
                      case "festival":
                        setNewEvent((ev) => {
                          return {
                            ...ev,
                            location: {
                              location_type: v,
                              address: "",
                            },
                          };
                        });
                        break;
                      case "other":
                        setNewEvent((ev) => {
                          return {
                            ...ev,
                            location: {
                              location_type: v,
                              details: "",
                            },
                          };
                        });
                        break;
                      default:
                        const s: never = v;
                        break;
                    }
                  }}
                  class="w-full flex flex-col gap-2"
                >
                  <RadioGroupLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Where is the {props.event_type}?
                  </RadioGroupLabel>
                  <div class="grid grid-cols-2 gap-2 w-full">
                    <RadioGroupItem value="venue">
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-row items-center justify-center  gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent().location.location_type !== "venue",
                            "bg-secondary": newEvent().location.location_type === "venue",
                          }
                        )}
                      >
                        <Container class="size-4" />
                        Venue <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                    <RadioGroupItem value="festival">
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-row items-center justify-center gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent().location.location_type !== "festival",
                            "bg-secondary": newEvent().location.location_type === "festival",
                          }
                        )}
                      >
                        <PartyPopper class="size-4" />
                        Festival <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                    <RadioGroupItem value="online">
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-row items-center justify-center  gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent().location.location_type !== "online",
                            "bg-secondary": newEvent().location.location_type === "online",
                          }
                        )}
                      >
                        <Globe class="size-4" />
                        Online <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>{" "}
                    <RadioGroupItem value="other">
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-row items-center justify-center  gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent().location.location_type !== "other",
                            "bg-secondary": newEvent().location.location_type === "other",
                          }
                        )}
                      >
                        <Clover class="size-4" />
                        Other <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                  </div>
                </RadioGroup>
              </div>
              <div class="flex flex-col items-start justify-between gap-2 w-full">
                <Switch>
                  <Match when={newEvent().location.location_type === "online"}>
                    <TextField class="w-full flex flex-col gap-2" aria-label="Location">
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        What is the URL of the {props.event_type}?
                      </TextFieldLabel>
                      <TextFieldInput
                        value={
                          // @ts-ignore
                          newEvent().location.location_type === "online" && newEvent().location.url
                            ? // @ts-ignore
                              newEvent().location.url
                            : urlQuery()
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = e.currentTarget.value;
                            setLocationQuery(value);
                            setNewEvent((ev) => ({
                              ...ev,
                              location: {
                                ...ev.location,
                                address: value,
                              },
                            }));
                          }
                        }}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setURLQuery(value);
                          setNewEvent((ev) => {
                            return {
                              ...ev,
                              location: {
                                ...ev.location,
                                url: value,
                              },
                            };
                          });
                        }}
                      />
                    </TextField>
                    <URLPreview query={urlQuery} />
                  </Match>
                  <Match when={newEvent().location.location_type === "venue"}>
                    <TextField class="w-full flex flex-col gap-2" aria-label="Location">
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Where is the {props.event_type} going to take place?
                      </TextFieldLabel>
                      <TextFieldInput
                        value={
                          // @ts-ignore
                          newEvent().location.location_type === "venue" && newEvent().location.address
                            ? // @ts-ignore
                              newEvent().location.address
                            : locationQuery()
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = e.currentTarget.value;
                            setLocationQuery(value);
                            setNewEvent((ev) => ({
                              ...ev,
                              location: {
                                ...ev.location,
                                address: value,
                              },
                            }));
                          }
                        }}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setLocationQuery(value);
                          setNewEvent((ev) => {
                            return {
                              ...ev,
                              location: {
                                ...ev.location,
                                address: value,
                              },
                            };
                          });
                        }}
                      />
                    </TextField>
                    <ClientMap query={locationQuery} />
                  </Match>
                  <Match when={newEvent().location.location_type === "festival"}>
                    <TextField class="w-full flex flex-col gap-2" aria-label="Location">
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Where is the {props.event_type} going to take place?
                      </TextFieldLabel>
                      <TextFieldInput
                        value={
                          // @ts-ignore
                          newEvent().location.location_type === "festival" && newEvent().location.address
                            ? // @ts-ignore
                              newEvent().location.address
                            : locationQuery()
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = e.currentTarget.value;
                            setLocationQuery(value);
                            setNewEvent((ev) => ({
                              ...ev,
                              location: {
                                ...ev.location,
                                address: value,
                              },
                            }));
                          }
                        }}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setLocationQuery(value);
                          setNewEvent((ev) => {
                            return {
                              ...ev,
                              location: {
                                ...ev.location,
                                address: value,
                              },
                            };
                          });
                        }}
                      />
                    </TextField>
                    <ClientMap query={locationQuery} />
                  </Match>
                  <Match when={newEvent().location.location_type === "other"}>
                    <TextField class="w-full flex flex-col gap-2" aria-label="Other Location">
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Where is the {props.event_type} going to take place?
                      </TextFieldLabel>
                      <TextFieldTextArea
                        autoResize
                        value={
                          // @ts-ignore
                          newEvent().location.location_type === "other" && newEvent().location.details
                            ? // @ts-ignore
                              newEvent().location.details
                            : locationQuery()
                        }
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setLocationQuery(value);
                          setNewEvent((ev) => {
                            return {
                              ...ev,
                              location: {
                                ...ev.location,
                                details: value,
                              },
                            };
                          });
                        }}
                      />
                    </TextField>
                  </Match>
                </Switch>
              </div>
            </TabsContent>
            <TabsContent value="tickets" class="flex flex-col gap-6 w-full">
              <RadioGroup
                class="w-full flex flex-col gap-2"
                aria-label="Recommended Ticket Capacity"
                onChange={(v) => {
                  if (v === "custom") {
                    setNewEvent((ev) => ({
                      ...ev,
                      capacity: {
                        capacity_type: "custom",
                        value: 1,
                      },
                    }));
                    return;
                  }
                  if (v === "none") {
                    setNewEvent((ev) => ({
                      ...ev,
                      capacity: {
                        capacity_type: "none",
                        value: "none",
                      },
                    }));
                    return;
                  }
                  const x = parseInt(v);
                  if (!isNaN(x) && [50, 100, 200, 300].includes(x)) {
                    type CapacityRecommended = Exclude<
                      Exclude<ReturnType<typeof newEvent>["capacity"]["value"], "custom" | "none">,
                      number
                    >;
                    setNewEvent((ev) => ({
                      ...ev,
                      capacity: {
                        capacity_type: "recommended",
                        value: String(x) as CapacityRecommended,
                      },
                    }));
                  }
                }}
              >
                <RadioGroupLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  How many tickets are you planning to sell?
                </RadioGroupLabel>
                <div class="grid grid-cols-3 gap-2 w-full">
                  <For each={["none", 50, 100, 200, 300, "custom"] as const}>
                    {(value) => (
                      <RadioGroupItem value={String(value)}>
                        <RadioGroupItemLabel
                          class={cn(
                            "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer capitalize",
                            {
                              "bg-secondary":
                                (newEvent().capacity.capacity_type === "recommended" &&
                                  newEvent().capacity.value === String(value)) ||
                                (newEvent().capacity.capacity_type === "custom" && value === "custom") ||
                                (newEvent().capacity.capacity_type === "none" && value === "none"),
                            }
                          )}
                        >
                          {value} <RadioGroupItemControl class="hidden" />
                        </RadioGroupItemLabel>
                      </RadioGroupItem>
                    )}
                  </For>
                </div>
              </RadioGroup>
              <Show when={newEvent().capacity.capacity_type === "custom"}>
                <TextField class="w-full flex flex-col gap-2" aria-label="Tickets">
                  <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Or choose a custom capacity
                  </TextFieldLabel>
                  <TextFieldInput
                    type="number"
                    min={0}
                    step="1"
                    value={newEvent().capacity.value}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      if (!value) return;
                      const capacity = parseInt(value);
                      if (isNaN(capacity)) return;

                      setNewEvent((ev) => ({
                        ...ev,
                        capacity: {
                          capacity_type: "custom",
                          value: capacity,
                        },
                      }));
                    }}
                  />
                </TextField>
              </Show>
              <Transition name="slide-fade-down">
                <Show when={["recommended", "custom"].includes(newEvent().capacity.capacity_type)}>
                  <div class="flex flex-col gap-4 ">
                    <Separator />
                    <div class="flex flex-col gap-2 py-2 w-full">
                      <span class="text-sm font-medium leading-none">Type of Tickets</span>
                      <div class="w-full border border-neutral-200 dark:border-neutral-800 rounded-md p-2">
                        <Table class="rounded-sm overflow-clip">
                          <TableCaption class="text-xs">Type of Tickets (e.g. VIP, Regular, etc.)</TableCaption>
                          <TableHeader>
                            <TableRow>
                              <For each={["Shape", "Type", "Name", "Price", "Quantity", "Actions"] as const}>
                                {(header) => <TableCell class="text-sm font-medium leading-none">{header}</TableCell>}
                              </For>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <For each={newEvent().tickets}>
                              {(ticket, index) => (
                                <TableRow class="last:rounded-b-sm last:overflow-clip">
                                  <TableCell class="uppercase">{ticket.shape}</TableCell>
                                  <TableCell class="uppercase">{ticket.ticket_type.name}</TableCell>
                                  <TableCell>{ticket.name}</TableCell>
                                  <TableCell>
                                    {ticket.ticket_type.payment_type === "FREE" ? (
                                      "Free"
                                    ) : (
                                      <div>
                                        {ticket.price.toFixed(2)}{" "}
                                        <Switch>
                                          <Match
                                            when={
                                              ticket.currency.currency_type === "other" &&
                                              (ticket.currency as Exclude<
                                                z.infer<typeof BaseTicketSchema>["currency"],
                                                Exclude<
                                                  z.infer<typeof BaseTicketSchema>["currency"],
                                                  { currency_type: "other" }
                                                >
                                              >)
                                            }
                                          >
                                            {(c) => c().value}
                                          </Match>
                                          <Match when={ticket.currency.currency_type !== "other"}>
                                            {ticket.currency.currency_type.toUpperCase()}
                                          </Match>
                                        </Switch>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>{ticket.quantity}</TableCell>
                                  <TableCell class="w-max">
                                    <div class="flex flex-row justify-end w-max gap-2">
                                      <EditTicketForm
                                        ticket={ticket}
                                        tickets={() => newEvent().tickets}
                                        freeAllowedTickets={() => calculateRemainingTicketsQuantity(ticket)}
                                        onChange={(newTicket) => {
                                          setNewEvent((ev) => {
                                            return {
                                              ...ev,
                                              tickets: ev.tickets.map((t, i) => {
                                                if (i === index()) {
                                                  return newTicket;
                                                }
                                                return t;
                                              }),
                                            };
                                          });
                                        }}
                                      />
                                      <Button
                                        size="icon"
                                        variant="destructive"
                                        aria-label="Remove Ticket"
                                        class="w-6 h-6"
                                        onClick={() => {
                                          setNewEvent((ev) => {
                                            return {
                                              ...ev,
                                              tickets: ev.tickets.filter((_, i) => i !== index()),
                                            };
                                          });
                                        }}
                                      >
                                        <Minus class="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </For>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    <div class="flex flex-row items-center justify-between gap-2 w-full">
                      <div class="text-sm font-medium leading-none">
                        <Switch>
                          <Match when={tooManyTicketsCheck().type === "error"}>
                            <div class="flex flex-col gap-1 text-rose-500">
                              <For each={tooManyTicketsCheck().message.split("\n")}>{(line) => <p>{line}</p>}</For>
                            </div>
                          </Match>
                          <Match when={tooManyTicketsCheck().type === "success:unfinished"}>
                            <div class="flex flex-col gap-1">
                              <For each={tooManyTicketsCheck().message.split("\n")}>{(line) => <p>{line}</p>}</For>
                            </div>
                          </Match>
                          <Match when={tooManyTicketsCheck().type === "success:done"}>
                            {tooManyTicketsCheck().message}
                          </Match>
                        </Switch>
                      </div>
                      <div class="flex flex-row gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label="Add Ticket"
                          class="flex flex-row items-center justify-center gap-2 w-max"
                          disabled={
                            isCreatingEvent.pending ||
                            tooManyTicketsCheck().type === "error" ||
                            tooManyTicketsCheck().type === "success:done"
                          }
                          onClick={() => {
                            const nc = newEvent();
                            const tickets = nc.tickets;
                            if (tickets.length >= 1 && tickets.some((t) => t.quantity === 0)) {
                              toast.info(`Please setup the existing tickets first`);
                              return;
                            }
                            const totalTickets = tickets.reduce((acc, t) => acc + t.quantity, 0);
                            const cp = nc.capacity;
                            const cpt = cp.capacity_type;
                            if (cpt === "none") {
                              toast.error("Error Adding Ticket", {
                                description: `You have not set a capacity for the ${props.event_type}.`,
                              });
                              return;
                            }
                            const cpv = parseInt(String(cp.value));
                            if (totalTickets >= cpv) {
                              toast.error("Error Adding Ticket", {
                                description: `You have reached the maximum capacity of tickets for this ${props.event_type}.`,
                              });
                              return;
                            }
                            setNewEvent((ev) => {
                              const dtt = defaultFreeTicketType();
                              if (!dtt) return ev;
                              return {
                                ...ev,
                                tickets: [
                                  ...ev.tickets,
                                  {
                                    ticket_type: dtt,
                                    shape: "default",
                                    name: "",
                                    price: 0,
                                    currency: {
                                      currency_type: "free",
                                    },
                                    quantity: 0,
                                  },
                                ],
                              };
                            });
                          }}
                        >
                          Add Ticket
                          <Plus class="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Show>
              </Transition>
            </TabsContent>
          </Tabs>
          <div class="flex flex-row items-center justify-between gap-2 w-full">
            <div class="flex flex-row items-center gap-2">
              <Button
                type="button"
                variant="outline"
                aria-label="Resets the Form"
                class="gap-2"
                size={isSmall() ? "icon" : "default"}
                onClick={(e) => {
                  if (!formRef) return;
                  setNewEvent(DEFAULT_EVENT);
                  formRef.reset();
                  clearEventHistory();
                }}
                disabled={isCreatingEvent.pending || isFormEmpty(newEvent())}
              >
                <span class="sr-only md:not-sr-only">Reset Form</span>
                <Eraser class="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Undo last action"
                class="gap-2"
                onClick={(e) => {
                  const eH = eventHistory();
                  eH.undo();
                }}
                disabled={isCreatingEvent.pending || isFormEmpty(newEvent())}
              >
                <Undo class="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                aria-label="Redo last action"
                class="gap-2"
                size="icon"
                onClick={(e) => {
                  const eH = eventHistory();
                  eH.redo();
                }}
                disabled={isCreatingEvent.pending || isFormEmpty(newEvent()) || !eventHistory().canRedo()}
              >
                <Redo class="w-4 h-4" />
              </Button>
            </div>
            <div class="flex flex-row gap-2">
              <Button
                size="icon"
                variant={currentTab() === "general" ? "outline" : "secondary"}
                disabled={isCreatingEvent.pending || currentTab() === "general"}
                aria-label="Previous Tab"
                onClick={() => handleTabChange("backward")}
              >
                <ArrowLeft class="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={currentTab() === "tickets" ? "outline" : "secondary"}
                disabled={isCreatingEvent.pending || currentTab() === "tickets"}
                aria-label="Next Tab"
                onClick={() => handleTabChange("forward")}
              >
                <ArrowLeft class="w-4 h-4 transform rotate-180" />
              </Button>
              <Button
                type="submit"
                aria-label={`Create ${props.event_type}`}
                class="flex flex-row items-center justify-between gap-2 capitalize"
                disabled={isCreatingEvent.pending || !isAllowedToCreatePlan()}
              >
                <Switch
                  fallback={
                    <>
                      <span class="text-sm font-medium leading-none w-max">Create {props.event_type}</span>
                      <Plus class="w-4 h-4" />
                    </>
                  }
                >
                  <Match when={isCreatingEvent.pending}>
                    <span class="text-sm font-medium leading-none">Creating {props.event_type}...</span>
                    <Loader2 class="w-4 h-4 animate-spin" />
                  </Match>
                  <Match when={isCreatingEvent.result}>
                    <span class="text-sm font-medium leading-none">{props.event_type} Created!</span>
                    <CheckCheck class="w-4 h-4" />
                  </Match>
                </Switch>
              </Button>
              <Show when={!isCreatingEvent.pending && isCreatingEvent.result}>
                {(data) => (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigate(`/plans/${data().id}`);
                    }}
                  >
                    <span class="text-sm font-medium leading-none capitalize">View {props.event_type}</span>
                  </Button>
                )}
              </Show>
            </div>
          </div>
        </form>
        <div class="lg:w-max w-full flex flex-col gap-8">
          <Show when={previousEvents() != undefined && previousEvents()}>
            {(pE) => (
              <div class="w-full flex flex-col gap-4">
                <div class="w-full flex flex-row items-center justify-between w-min-72">
                  <div
                    class={cn("flex flex-row gap-2 items-center", {
                      "opacity-50": newEvent().referenced_from !== undefined,
                    })}
                  >
                    <History class="w-4 h-4" />
                    <h3 class="text-base font-medium capitalize">Previous {newEvent().event_type}</h3>
                  </div>
                  <div class="flex flex-row items-center gap-2">
                    <Button
                      size="sm"
                      class="md:hidden flex w-max h-7 p-0 items-center text-xs justify-center gap-2 px-2 pl-3"
                      variant="outline"
                      onClick={() => {
                        if (!formRef) return;
                        formRef.reset();
                        setNewEvent(DEFAULT_EVENT);
                      }}
                      aria-label="Resets the Form"
                      disabled={isCreatingEvent.pending || isFormEmpty(newEvent())}
                    >
                      Reset Form
                      <Eraser class="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      class="w-max h-7 p-0 items-center text-xs justify-center gap-2 px-2 pl-3"
                      variant={newEvent().referenced_from === undefined ? "outline" : "secondary"}
                      onClick={() => {
                        const eH = eventHistory();
                        eH.undo();
                      }}
                      aria-label={`Undo Fill From Previous ${newEvent().event_type}`}
                      disabled={
                        newEvent().referenced_from === undefined || isCreatingEvent.pending || isFormEmpty(newEvent())
                      }
                    >
                      Undo
                      <Undo class="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Show when={pE().length > 0}>
                  <Alert
                    class={cn("lg:max-w-72 w-full flex flex-col gap-2 bg-muted rounded", {
                      "opacity-50": newEvent().referenced_from !== undefined,
                    })}
                  >
                    <AlertDescription class="text-xs">
                      You can also fill the form with a previous {newEvent().event_type} to save time.
                    </AlertDescription>
                  </Alert>
                </Show>
                <div
                  class={cn(
                    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4 w-full self-end min-w-[250px]",
                    {
                      "lg:w-max": pE().length > 0,
                      "w-full sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1": pE().length === 0,
                    }
                  )}
                >
                  <For
                    each={pE().slice(0, 3)}
                    fallback={
                      <div class="max-w-full w-full flex flex-col gap-2 border border-neutral-200 dark:border-neutral-800 rounded p-2 items-center justify-center">
                        <span class="text-xs text-muted-foreground">There are no previous {props.event_type}s</span>
                      </div>
                    }
                  >
                    {(plan, index) => (
                      <Card
                        class={cn("rounded-md shadow-sm lg:w-max w-full lg:min-w-72 cursor-pointer ", {
                          "border-indigo-500 bg-indigo-400 dark:bg-indigo-600": plan.id === newEvent().referenced_from,
                          "hover:bg-neutral-100 dark:hover:bg-neutral-900": newEvent().referenced_from === undefined,
                          "opacity-100": newEvent().referenced_from === plan.id,
                          "opacity-50":
                            newEvent().referenced_from !== undefined && newEvent().referenced_from !== plan.id,
                          "cursor-default": newEvent().referenced_from !== undefined,
                        })}
                        onClick={() => {
                          if (newEvent().referenced_from !== undefined) return;
                          setNewEvent((ev) => ({
                            ...ev,
                            ...plan,
                            referenced_from: plan.id,
                          }));
                        }}
                      >
                        <CardHeader class="flex flex-col p-3 pb-2 ">
                          <CardTitle
                            class={cn("text-sm", {
                              "text-white": plan.id === newEvent().referenced_from,
                            })}
                          >
                            {plan.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent class="p-3 pt-0 pb-4">
                          <CardDescription
                            class={cn("text-xs", {
                              "text-white": plan.id === newEvent().referenced_from,
                            })}
                          >
                            <p>{plan.description}</p>
                          </CardDescription>
                        </CardContent>
                      </Card>
                    )}
                  </For>
                </div>
              </div>
            )}
          </Show>
          <Show when={recommendedEvents() != undefined && recommendedEvents()}>
            {(rE) => (
              <div class="w-full flex flex-col gap-4">
                <div class="w-full flex flex-row items-center justify-between w-min-72">
                  <div
                    class={cn("flex flex-row gap-2 items-center", {
                      "opacity-50": newEvent().referenced_from !== undefined,
                    })}
                  >
                    <Sparkles class="w-4 h-4" />
                    <h3 class="text-base font-medium capitalize">Recommended </h3>
                  </div>
                  <div class="flex flex-row items-center gap-2">
                    <Button
                      size="sm"
                      class="md:hidden flex w-max h-7 p-0 items-center text-xs justify-center gap-2 px-2 pl-3"
                      variant="outline"
                      onClick={() => {
                        if (!formRef) return;
                        formRef.reset();
                        setNewEvent(DEFAULT_EVENT);
                      }}
                      aria-label="Resets the Form"
                      disabled={isCreatingEvent.pending || isFormEmpty(newEvent())}
                    >
                      Reset Form
                      <Eraser class="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      class="w-max h-7 p-0 items-center text-xs justify-center gap-2 px-2 pl-3"
                      variant={newEvent().referenced_from === undefined ? "outline" : "secondary"}
                      onClick={() => {
                        const eH = eventHistory();
                        eH.undo();
                      }}
                      aria-label={`Undo Fill From Previous ${newEvent().event_type}`}
                      disabled={
                        newEvent().referenced_from === undefined || isCreatingEvent.pending || isFormEmpty(newEvent())
                      }
                    >
                      Undo
                      <Undo class="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Show when={rE().length > 0}>
                  <Alert
                    class={cn("lg:max-w-72 w-full flex flex-col gap-2 bg-muted rounded", {
                      "opacity-50": newEvent().referenced_from !== undefined,
                    })}
                  >
                    <AlertDescription class="text-xs">
                      You can also fill the form with a recommended {newEvent().event_type} to save time.
                    </AlertDescription>
                  </Alert>
                </Show>
                <div
                  class={cn(
                    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4 w-full self-end min-w-[250px]",
                    {
                      "lg:w-max": rE().length > 0,
                      "w-full sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1": rE().length === 0,
                    }
                  )}
                >
                  <For
                    each={rE().slice(0, 3)}
                    fallback={
                      <div class="lg:max-w-72 w-full flex flex-col gap-2 border border-neutral-200 dark:border-neutral-800 rounded p-2 items-center justify-center">
                        <span class="text-xs text-muted-foreground">There are no recommendations</span>
                      </div>
                    }
                  >
                    {(plan, index) => (
                      <Card
                        class={cn("rounded-md shadow-sm lg:w-max w-full lg:min-w-72 cursor-pointer ", {
                          "border-indigo-500 bg-indigo-400 dark:bg-indigo-600": plan.id === newEvent().referenced_from,
                          "hover:bg-neutral-100 dark:hover:bg-neutral-900": newEvent().referenced_from === undefined,
                          "opacity-100": newEvent().referenced_from === plan.id,
                          "opacity-50":
                            newEvent().referenced_from !== undefined && newEvent().referenced_from !== plan.id,
                          "cursor-default": newEvent().referenced_from !== undefined,
                        })}
                        onClick={() => {
                          if (newEvent().referenced_from !== undefined) return;
                          setNewEvent((ev) => ({
                            ...ev,
                            ...plan,
                            referenced_from: plan.id,
                          }));
                        }}
                      >
                        <CardHeader class="flex flex-col p-3 pb-2 ">
                          <CardTitle
                            class={cn("text-sm", {
                              "text-white": plan.id === newEvent().referenced_from,
                            })}
                          >
                            {plan.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent class="p-3 pt-0 pb-4">
                          <CardDescription
                            class={cn("text-xs", {
                              "text-white": plan.id === newEvent().referenced_from,
                            })}
                          >
                            <p>{plan.description}</p>
                          </CardDescription>
                        </CardContent>
                      </Card>
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
}
