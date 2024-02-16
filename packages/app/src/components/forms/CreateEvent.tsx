import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemLabel,
  RadioGroupLabel,
} from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField, TextFieldInput, TextFieldLabel } from "@/components/ui/textfield";
import { cn } from "@/lib/utils";
import { Mutations } from "@/utils/api/mutations";
import { Queries } from "@/utils/api/queries";
import { CreateEventFormSchema, EventType, TicketSchema } from "@/utils/schemas/event";
import { today } from "@internationalized/date";
import { As } from "@kobalte/core";
import { createUndoHistory } from "@solid-primitives/history";
import { useNavigate } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { createMutation, createQuery, isServer } from "@tanstack/solid-query";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import tz from "dayjs/plugin/timezone";
import {
  AlertCircleIcon,
  ArrowLeft,
  Calendar,
  CheckCheck,
  CircleSlash,
  Clock,
  Eraser,
  History,
  Library,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Redo,
  Sparkles,
  Ticket,
  Undo,
} from "lucide-solid";
import { For, Match, Show, Suspense, Switch, createEffect, createMemo, createSignal, onMount } from "solid-js";
import { toast } from "solid-sonner";
import { Transition } from "solid-transition-group";
import { z } from "zod";
import { QueryBoundary } from "../QueryBoundary";
import URLPreview from "../URLPreview";
import { EditTicketForm } from "./EditTicketForm";
dayjs.extend(tz);
dayjs.extend(advancedFormat);

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

export default function CreateConcertForm(props: { event_type: z.infer<typeof CreateEventFormSchema>["event_type"] }) {
  const DEFAULT_EVENT: z.infer<typeof CreateEventFormSchema> = {
    event_type: props.event_type,
    name: "",
    description: "",
    days: [dayjs().startOf("day").toDate(), dayjs().startOf("day").add(1, "day").toDate()],
    tickets: [],
    capacity: {
      capacity_type: "none",
      value: "none",
    },
    duration: 60,
    location: {
      location_type: "venue",
      address: "",
    },
  };
  let formRef: HTMLFormElement;
  const [newEvent, setNewEvent] = createSignal<z.infer<typeof CreateEventFormSchema>>(DEFAULT_EVENT);
  const [trackClearEvent, clearEventHistory] = createSignal(undefined, { equals: false });
  const [timezone, setTimeZone] = createSignal("UTC");

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

  const previousEvents = createQuery(() => ({
    queryKey: ["previousEvents", newEvent().event_type || props.event_type],
    queryFn: async (k) => {
      const event_type = k.queryKey[1];
      const v = EventType.safeParse(event_type);
      if (!v.success) {
        return Promise.resolve<Awaited<ReturnType<typeof Queries.Events.all>>>([]);
      }
      return Queries.Events.all({
        event_type: v.data,
      });
    },
    initialData: [],
    get enabled() {
      return !isServer;
    },
  }));

  const recommendedEvents = createQuery(() => ({
    queryKey: ["recommendedEvents", newEvent().event_type || props.event_type],
    queryFn: async (k) => {
      const event_type = k.queryKey[1];
      const v = EventType.safeParse(event_type);
      if (!v.success) {
        return Promise.resolve<Awaited<ReturnType<typeof Queries.Events.recommended>>>([]);
      }
      return Queries.Events.recommended({
        event_type: v.data,
      });
    },
    initialData: [],
    get enabled() {
      return !isServer;
    },
  }));
  onMount(() => {
    setTimeZone(dayjs.tz.guess());
    previousEvents.refetch();
    recommendedEvents.refetch();
  });
  const suggestNewNames = () => {
    const ne = newEvent();
    if (!ne) {
      return [];
    }
    const name = ne.name;
    if (previousEvents.isPending || previousEvents.fetchStatus === "fetching") {
      return [];
    }
    if (previousEvents.isFetching) {
      return [];
    }
    if (!previousEvents.isSuccess) {
      return [];
    }
    if (name.length === 0) {
      return [];
    }
    // is the name already in the list?
    const existsStartingWithLowerCase = previousEvents.data.find((pConcert) =>
      pConcert.name.toLowerCase().startsWith(name.toLowerCase())
    );
    const existsExactLowercase = previousEvents.data.find(
      (pConcert) => pConcert.name.toLowerCase() === name.toLowerCase()
    );

    if (!existsExactLowercase) {
      return [];
    }
    if (!existsStartingWithLowerCase) {
      return [];
    }
    const lastCounter = previousEvents.data.reduce((acc, pConcert) => {
      const pConcertName = pConcert.name.toLowerCase();

      // find the last number in the name, if it exists. the name can be "name-1" or "name 1" or even "name1"
      const lastNumber = pConcertName.match(/(\d+)$/);

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

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    const validation = CreateEventFormSchema.safeParse(newEvent());
    if (!validation.success) {
      const niceError = Object.entries(validation.error.flatten().fieldErrors).map(([key, value]) => {
        return `${key}: ${value}`;
      });
      toast.error("Error Creating Concert", {
        description: niceError,
        action: {
          label: "Fix",
          onClick: () => {
            formRef?.reportValidity();
          },
        },
      });
      return;
    }

    return await createEvent.mutateAsync(validation.data);
  };

  const navigate = useNavigate();

  const isAllowedToCreateConcert = () => {
    const firstCondition = CreateEventFormSchema.safeParse(newEvent());
    if (!firstCondition.success) {
      return false;
    }
    const sn = suggestNewNames();
    const secondCondition = sn.length === 0;
    return firstCondition.success && secondCondition;
  };

  const createEvent = createMutation(() => ({
    mutationKey: ["createConcert"],
    mutationFn: async (data: Parameters<typeof Mutations.Concerts.create>[0]) => {
      return Mutations.Concerts.create(data);
    },
    onSuccess: (data) => {
      toast.info(`Concert '${data.name}' Created!`, {
        action: {
          label: "View Concert",
          onClick: () => {
            navigate(`/concerts/${data.id}`);
          },
        },
      });
      clearEventHistory();
    },
    onError: (error) => {
      toast.error("Error Creating Concert", {
        description: error.message,
      });
    },
  }));

  const isFormEmpty = (concert: z.infer<typeof CreateEventFormSchema>) => {
    // check deep equality
    return JSON.stringify(concert) === JSON.stringify(DEFAULT_EVENT);
  };

  const calculateRemainingTicketsQuantity = (ticket: z.infer<typeof TicketSchema>): number => {
    // calculate the remaining tickets quantity.
    // how can I determine the remaining tickets, when I change the quantity of that exact ticket?
    // If I check how many have been set up, I can calculate the remaining tickets of that type.
    // Issue: A ticket type is already in the list and I want to change the quantity.
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
    if (ticket.ticket_type.startsWith("free")) {
      return remainingTickets;
    }
    const paidTickets = newEvent().tickets.filter((t) => t.ticket_type.startsWith("paid"));
    const remainingPaidTickets = paidTickets.reduce((acc, t) => acc + t.quantity, 0);
    return remainingPaidTickets;
  };

  const tooManyTicketsCheck = () => {
    const nc = newEvent();
    if (!nc) {
      return {
        message: "You have not set a capacity for the concert.",
        type: "error",
      };
    }
    const totalTickets = nc.tickets.reduce((acc, t) => acc + t.quantity, 0);
    const cp = nc.capacity;
    const cpt = cp.capacity_type;
    if (cpt === "none") {
      return {
        message: "You have not set a capacity for the concert.",
        type: "error",
      };
    }
    const cpv = parseInt(String(cp.value));
    if (totalTickets === cpv) {
      return {
        message: "You have reached the maximum capacity of tickets for this concert.",
        type: "success:done",
      } as const;
    }
    if (totalTickets > cpv) {
      return {
        message: "You have exceeded the maximum capacity of tickets for this concert.\nPlease reduce the quantity.",
        type: "error",
      } as const;
    }
    return {
      message: `Note: You have ${cpv - totalTickets} ticket(s) left to sell.`,
      type: "success:unfinished",
    } as const;
  };

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
          <Tabs defaultValue="general" value={currentTab()} onChange={(value) => setCurrentTab(value as TabValue)}>
            <TabsList>
              <TabsTrigger value="general" class="text-sm font-medium leading-none gap-2 pl-3">
                <Library class="w-3 h-3" />
                General
              </TabsTrigger>
              <TabsTrigger value="time" class="text-sm font-medium leading-none gap-2 pl-3">
                <Clock class="w-3 h-3" />
                Time
              </TabsTrigger>
              <TabsTrigger value="location" class="text-sm font-medium leading-none gap-2 pl-3">
                <MapPin class="w-3 h-3" />
                Location
              </TabsTrigger>
              <TabsTrigger value="tickets" class="text-sm font-medium leading-none gap-2 pl-3">
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
                Tickets
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" class="flex flex-col gap-6 w-full">
              <TextField class="w-full flex flex-col gap-2" aria-label="Concert Name">
                <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  The Name of the Concert
                </TextFieldLabel>
                <TextFieldInput
                  value={newEvent().name}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setNewEvent((ev) => ({ ...ev, name: value }));
                  }}
                />
                <Show when={previousEvents.isSuccess} fallback={<Loader2 class="w-4 h-4 animate-spin" />}>
                  <Show when={suggestNewNames().length > 0 && suggestNewNames()}>
                    {(v) => (
                      <>
                        <span class="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Concert '{newEvent().name}' exists already! Suggested Names:
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
              <TextField class="w-full flex flex-col gap-2" aria-label="Concert Description">
                <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  What is the concert about?
                </TextFieldLabel>
                <TextFieldInput
                  value={newEvent().description}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setNewEvent((ev) => ({ ...ev, description: value }));
                  }}
                />
              </TextField>
            </TabsContent>
            <TabsContent value="time" class="flex flex-col gap-6 w-full">
              <TextField class="w-full flex flex-col gap-2" aria-label="Start Time">
                <div class="flex flex-row items-center justify-between w-full">
                  <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    When is the concert?
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
                <DatePicker
                  numOfMonths={2}
                  selectionMode="range"
                  min={today(timezone())}
                  timeZone={timezone()}
                  value={(newEvent().days ?? []).map((d) => dayjs(d).format("YYYY-MM-DD"))}
                  onValueChange={(date) => {
                    const tz = timezone();
                    const days = date.value.map((d) => dayjs(d.toDate(tz)).startOf("day").toDate());
                    setNewEvent((ev) => {
                      return {
                        ...ev,
                        days,
                      };
                    });
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
              </TextField>
            </TabsContent>
            <TabsContent value="location" class="flex flex-col gap-6 w-full">
              <div class="flex flex-col items-start justify-between gap-2 w-full">
                <RadioGroup
                  value={newEvent().location.location_type}
                  aria-label="Where is the concert?"
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
                    Where is the concert?
                  </RadioGroupLabel>
                  <div class="grid grid-cols-2 gap-2 w-full">
                    <RadioGroupItem value="venue">
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent().location.location_type === "online",
                            "bg-secondary": newEvent().location.location_type === "venue",
                          }
                        )}
                      >
                        Venue <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                    <RadioGroupItem value="festival">
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent().location.location_type === "venue",
                            "bg-secondary": newEvent().location.location_type === "festival",
                          }
                        )}
                      >
                        Festival <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                    <RadioGroupItem value="other">
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent().location.location_type === "venue",
                            "bg-secondary": newEvent().location.location_type === "other",
                          }
                        )}
                      >
                        Other <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                    <RadioGroupItem value="online">
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent().location.location_type === "venue",
                            "bg-secondary": newEvent().location.location_type === "online",
                          }
                        )}
                      >
                        Online <RadioGroupItemControl class="hidden" />
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
                        What is the URL of the concert?
                      </TextFieldLabel>
                      <TextFieldInput
                        value={
                          // @ts-ignore
                          newEvent().location.location_type === "online" && newEvent().location.url
                            ? // @ts-ignore
                              newEvent().location.url
                            : urlQuery()
                        }
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
                        Where is the concert going to take place?
                      </TextFieldLabel>
                      <TextFieldInput
                        value={
                          // @ts-ignore
                          newEvent().location.location_type === "venue" && newEvent().location.address
                            ? // @ts-ignore
                              newEvent().location.address
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
                        Where is the concert going to take place?
                      </TextFieldLabel>
                      <TextFieldInput
                        value={
                          // @ts-ignore
                          newEvent().location.location_type === "in_person" && newEvent().location.address
                            ? // @ts-ignore
                              newEvent().location.address
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
                                address: value,
                              },
                            };
                          });
                        }}
                      />
                    </TextField>
                    <ClientMap query={locationQuery} />
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
                                  <TableCell class="uppercase">{ticket.ticket_type}</TableCell>
                                  <TableCell>{ticket.name}</TableCell>
                                  <TableCell>
                                    {ticket.ticket_type.startsWith("free") ? (
                                      "Free"
                                    ) : (
                                      <div>
                                        {ticket.price.toFixed(2)}{" "}
                                        <Switch>
                                          <Match
                                            when={
                                              ticket.currency.currency_type === "other" &&
                                              (ticket.currency as Exclude<
                                                z.infer<typeof TicketSchema>["currency"],
                                                Exclude<
                                                  z.infer<typeof TicketSchema>["currency"],
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
                            createEvent.isPending ||
                            tooManyTicketsCheck().type === "error" ||
                            tooManyTicketsCheck().type === "success:done"
                          }
                          onClick={() => {
                            const totalTickets = newEvent().tickets.reduce((acc, t) => acc + t.quantity, 0);
                            const nc = newEvent();
                            const cp = nc.capacity;
                            const cpt = cp.capacity_type;
                            if (cpt === "none") {
                              toast.error("Error Adding Ticket", {
                                description: "You have not set a capacity for the concert.",
                              });
                              return;
                            }
                            const cpv = parseInt(String(cp.value));
                            if (totalTickets >= cpv) {
                              toast.error("Error Adding Ticket", {
                                description: "You have reached the maximum capacity of tickets for this concert.",
                              });
                              return;
                            }
                            setNewEvent((ev) => {
                              return {
                                ...ev,
                                tickets: [
                                  ...ev.tickets,
                                  {
                                    ticket_type: "free",
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
          <div>
            <Show when={createEvent.isError && createEvent.error}>
              {(e) => (
                <div class="flex flex-row items-center gap-2 text-red-500 justify-between w-full">
                  <div class="w-max flex flex-row items-center gap-2">
                    <CircleSlash class="w-4 h-4" />
                    <span class="text-sm font-medium leading-none">{e().message}</span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <As component={Button} variant="destructive" size="sm" class="w-max">
                        More Info
                      </As>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Error Creating Concert</DialogTitle>
                      <DialogDescription>
                        <pre class="bg-background border border-muted rounded p-2">
                          {JSON.stringify(e().cause, null, 2)}
                        </pre>
                      </DialogDescription>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            createEvent.reset();
                          }}
                        >
                          Close
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </Show>
          </div>
          <div class="flex flex-row items-center justify-between gap-2 w-full">
            <div class="flex flex-row items-center gap-2">
              <Button
                type="button"
                variant="outline"
                aria-label="Resets the Form"
                class="gap-2"
                onClick={(e) => {
                  if (!formRef) return;
                  setNewEvent(DEFAULT_EVENT);
                  formRef.reset();
                  clearEventHistory();
                }}
                disabled={createEvent.isPending || isFormEmpty(newEvent())}
              >
                Reset Form
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
                disabled={createEvent.isPending || isFormEmpty(newEvent())}
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
                disabled={createEvent.isPending || isFormEmpty(newEvent()) || !eventHistory().canRedo()}
              >
                <Redo class="w-4 h-4" />
              </Button>
            </div>
            <div class="flex flex-row gap-2">
              <Button
                size="icon"
                variant={currentTab() === "general" ? "outline" : "secondary"}
                disabled={createEvent.isPending || currentTab() === "general"}
                aria-label="Previous Tab"
                onClick={() => handleTabChange("backward")}
              >
                <ArrowLeft class="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={currentTab() === "tickets" ? "outline" : "secondary"}
                disabled={createEvent.isPending || currentTab() === "tickets"}
                aria-label="Next Tab"
                onClick={() => handleTabChange("forward")}
              >
                <ArrowLeft class="w-4 h-4 transform rotate-180" />
              </Button>
              <Button
                type="submit"
                aria-label="Create Concert"
                class="flex flex-row items-center justify-between gap-2"
                disabled={createEvent.isPending || !isAllowedToCreateConcert()}
              >
                <Switch>
                  <Match when={createEvent.isPending}>
                    <span class="text-sm font-medium leading-none">Creating Concert...</span>
                    <Loader2 class="w-4 h-4 animate-spin" />
                  </Match>
                  <Match when={createEvent.isSuccess}>
                    <span class="text-sm font-medium leading-none">Concert Created!</span>
                    <CheckCheck class="w-4 h-4" />
                  </Match>
                  <Match when={createEvent.isError}>
                    <span class="text-sm font-medium leading-none">Error Creating Concert</span>
                    <AlertCircleIcon class="w-4 h-4" />
                  </Match>
                  <Match when={createEvent.isIdle}>
                    <span class="text-sm font-medium leading-none">Create Concert</span>
                    <Plus class="w-4 h-4" />
                  </Match>
                </Switch>
              </Button>
              <Show when={createEvent.isSuccess && createEvent.data}>
                {(data) => (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigate(`/concerts/${data().id}`);
                    }}
                  >
                    <span class="text-sm font-medium leading-none">View Concert</span>
                  </Button>
                )}
              </Show>
            </div>
          </div>
        </form>

        <div class="lg:w-max w-full flex flex-col gap-8">
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
                  disabled={createEvent.isPending || isFormEmpty(newEvent())}
                >
                  Reset Form
                  <Eraser class="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  class="w-max h-7 p-0 items-center text-xs justify-center gap-2 px-2 pl-3"
                  variant="secondary"
                  onClick={() => {
                    const eH = eventHistory();
                    eH.undo();
                  }}
                  aria-label={`Undo Fill From Previous ${newEvent().event_type}`}
                  disabled={
                    newEvent().referenced_from === undefined || createEvent.isPending || isFormEmpty(newEvent())
                  }
                >
                  Undo
                  <Undo class="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Alert
              class={cn("lg:max-w-72 w-full flex flex-col gap-2 bg-muted rounded", {
                "opacity-50": newEvent().referenced_from !== undefined,
              })}
            >
              <AlertDescription class="text-xs">
                You can also fill the form with a previous {newEvent().event_type} to save time.
              </AlertDescription>
            </Alert>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4 lg:w-max w-full self-end ">
              <QueryBoundary
                query={previousEvents}
                loadingFallback={
                  <For each={[1, 2, 3]}>
                    {(i) => (
                      <Skeleton>
                        <Card class="rounded-md shadow-sm lg:w-max w-full min-w-72">
                          <CardHeader class="flex flex-col p-3 pb-2 ">
                            <CardTitle class="text-sm">Loading...</CardTitle>
                          </CardHeader>
                          <CardContent class="p-3 pt-0 pb-2">
                            <CardDescription class="text-xs">Loading...</CardDescription>
                          </CardContent>
                          <CardFooter class="flex flex-row items-center justify-between p-3 pt-0">
                            <div></div>
                            <Button size="sm" variant="outline">
                              Use Concert
                            </Button>
                          </CardFooter>
                        </Card>
                      </Skeleton>
                    )}
                  </For>
                }
                errorFallback={
                  <div class="flex flex-col gap-2 w-full">
                    <span class="text-sm font-medium leading-none text-red-500">
                      Error Fetching Previous {newEvent().event_type}
                    </span>
                    <span class="text-sm font-medium leading-none">{previousEvents.error?.message}</span>
                  </div>
                }
                notFoundFallback={
                  <div class="flex flex-col gap-2 w-full">
                    <span class="text-sm font-medium leading-none text-neutral-500">
                      No Previous {newEvent().event_type} Found
                    </span>
                  </div>
                }
              >
                {(pE) => (
                  <For each={pE.slice(0, 3)}>
                    {(concert, index) => (
                      <Card
                        class={cn("rounded-md shadow-sm lg:w-max w-full lg:min-w-72 cursor-pointer ", {
                          "border-indigo-500 bg-indigo-400 dark:bg-indigo-600":
                            concert.id === newEvent().referenced_from,
                          "hover:bg-neutral-100 dark:hover:bg-neutral-900": newEvent().referenced_from === undefined,
                          "opacity-100": newEvent().referenced_from === concert.id,
                          "opacity-50":
                            newEvent().referenced_from !== undefined && newEvent().referenced_from !== concert.id,
                          "cursor-default": newEvent().referenced_from !== undefined,
                        })}
                        onClick={() => {
                          if (newEvent().referenced_from !== undefined) return;
                          setNewEvent((ev) => ({
                            ...ev,
                            ...concert,
                            referenced_from: concert.id,
                          }));
                        }}
                      >
                        <CardHeader class="flex flex-col p-3 pb-2 ">
                          <CardTitle
                            class={cn("text-sm", {
                              "text-white": concert.id === newEvent().referenced_from,
                            })}
                          >
                            {concert.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent class="p-3 pt-0 pb-4">
                          <CardDescription
                            class={cn("text-xs", {
                              "text-white": concert.id === newEvent().referenced_from,
                            })}
                          >
                            <p>{concert.description}</p>
                          </CardDescription>
                        </CardContent>
                      </Card>
                    )}
                  </For>
                )}
              </QueryBoundary>
            </div>
          </div>
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
                  disabled={createEvent.isPending || isFormEmpty(newEvent())}
                >
                  Reset Form
                  <Eraser class="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  class="w-max h-7 p-0 items-center text-xs justify-center gap-2 px-2 pl-3"
                  variant="secondary"
                  onClick={() => {
                    const eH = eventHistory();
                    eH.undo();
                  }}
                  aria-label={`Undo Fill From Previous ${newEvent().event_type}`}
                  disabled={
                    newEvent().referenced_from === undefined || createEvent.isPending || isFormEmpty(newEvent())
                  }
                >
                  Undo
                  <Undo class="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Alert
              class={cn("lg:max-w-72 w-full flex flex-col gap-2 bg-muted rounded", {
                "opacity-50": newEvent().referenced_from !== undefined,
              })}
            >
              <AlertDescription class="text-xs">
                You can also fill the form with a recommended {newEvent().event_type} to save time.
              </AlertDescription>
            </Alert>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4 lg:w-max w-full self-end ">
              <QueryBoundary
                query={recommendedEvents}
                loadingFallback={
                  <For each={[1, 2, 3]}>
                    {(i) => (
                      <Skeleton>
                        <Card class="rounded-md shadow-sm lg:w-max w-full min-w-72">
                          <CardHeader class="flex flex-col p-3 pb-2 ">
                            <CardTitle class="text-sm">Loading...</CardTitle>
                          </CardHeader>
                          <CardContent class="p-3 pt-0 pb-2">
                            <CardDescription class="text-xs">Loading...</CardDescription>
                          </CardContent>
                          <CardFooter class="flex flex-row items-center justify-between p-3 pt-0">
                            <div></div>
                            <Button size="sm" variant="outline">
                              Use Concert
                            </Button>
                          </CardFooter>
                        </Card>
                      </Skeleton>
                    )}
                  </For>
                }
                errorFallback={
                  <div class="flex flex-col gap-2 w-full">
                    <span class="text-sm font-medium leading-none text-red-500">
                      Error Fetching Recommended {newEvent().event_type}
                    </span>
                    <span class="text-sm font-medium leading-none">{recommendedEvents.error?.message}</span>
                  </div>
                }
                notFoundFallback={
                  <div class="flex flex-col gap-2 w-full">
                    <span class="text-sm font-medium leading-none text-neutral-500">
                      No Recommended {newEvent().event_type} Found
                    </span>
                  </div>
                }
              >
                {(rE) => (
                  <For each={rE.slice(0, 2)}>
                    {(concert, index) => (
                      <Card
                        class={cn("rounded-md shadow-sm lg:w-max w-full lg:min-w-72 cursor-pointer ", {
                          "border-indigo-500 bg-indigo-400 dark:bg-indigo-600":
                            concert.id === newEvent().referenced_from,
                          "hover:bg-neutral-100 dark:hover:bg-neutral-900": newEvent().referenced_from === undefined,
                          "opacity-100": newEvent().referenced_from === concert.id,
                          "opacity-50":
                            newEvent().referenced_from !== undefined && newEvent().referenced_from !== concert.id,
                          "cursor-default": newEvent().referenced_from !== undefined,
                        })}
                        onClick={() => {
                          if (newEvent().referenced_from !== undefined) return;
                          setNewEvent((ev) => ({
                            ...ev,
                            ...concert,
                            referenced_from: concert.id,
                          }));
                        }}
                      >
                        <CardHeader class="flex flex-col p-3 pb-2 ">
                          <CardTitle
                            class={cn("text-sm", {
                              "text-white": concert.id === newEvent().referenced_from,
                            })}
                          >
                            {concert.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent class="p-3 pt-0 pb-4">
                          <CardDescription
                            class={cn("text-xs", {
                              "text-white": concert.id === newEvent().referenced_from,
                            })}
                          >
                            <p>{concert.description}</p>
                          </CardDescription>
                        </CardContent>
                      </Card>
                    )}
                  </For>
                )}
              </QueryBoundary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
