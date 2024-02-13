import DatePicker from "@/components/ui/custom/DatePicker";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Mutations } from "@/utils/api/mutations";
import { As } from "@kobalte/core";
import { createMutation, createQuery } from "@tanstack/solid-query";
import dayjs from "dayjs";
import {
  AlertCircleIcon,
  ArrowLeft,
  Calendar,
  CheckCheck,
  CircleSlash,
  Clock,
  Library,
  Loader2,
  MapPin,
  Minus,
  Pen,
  Plus,
  Ticket,
  X,
} from "lucide-solid";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { toast } from "solid-sonner";
import { useNavigate } from "solid-start";
import { clientOnly } from "solid-start/islands";
import { z } from "zod";
import { Queries } from "../../utils/api/queries";
import { CreateConcertFormSchema, TicketSchema } from "../../utils/schemas/concert";
import URLPreview from "../URLPreview";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "../ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemLabel,
  RadioGroupLabel,
} from "../ui/radio-group";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TextField, TextFieldInput, TextFieldLabel } from "../ui/textfield";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { EditTicketForm } from "./EditTicketForm";
import { Transition } from "solid-transition-group";

const ClientMap = clientOnly(() => import("../ClientMap"));

const DEFAULT_CONCERT: z.infer<typeof CreateConcertFormSchema> = {
  name: "",
  description: "",
  day: dayjs().startOf("day").toDate(),
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

export default function CreateConcertForm() {
  let formRef: HTMLFormElement;
  const [newConcert, setNewConcert] = createSignal<z.infer<typeof CreateConcertFormSchema>>(DEFAULT_CONCERT);

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
  const [takenFromRecommendedOrPrevious, setTakenFromRecommendedOrPrevious] = createSignal<number | undefined>();

  const previousConcerts = createQuery(() => ({
    queryKey: ["previousConcerts"],
    queryFn: () => {
      return Queries.Concerts.all();
    },
  }));

  const suggestNewNames = () => {
    const name = newConcert().name;
    if (!previousConcerts.isSuccess) {
      return [];
    }
    if (name.length === 0) {
      return [];
    }
    // is the name already in the list?
    const existsStartingWithLowerCase = previousConcerts.data.find((pConcert) =>
      pConcert.name.toLowerCase().startsWith(name.toLowerCase())
    );
    const existsExactLowercase = previousConcerts.data.find(
      (pConcert) => pConcert.name.toLowerCase() === name.toLowerCase()
    );

    if (!existsExactLowercase) {
      return [];
    }
    if (!existsStartingWithLowerCase) {
      return [];
    }
    const lastCounter = previousConcerts.data.reduce((acc, pConcert) => {
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
    const validation = CreateConcertFormSchema.safeParse(newConcert());
    if (!validation.success) {
      toast.error("Error Creating Concert", {
        description: validation.error?.message,
      });
      return;
    }

    return await createConcert.mutateAsync(validation.data);
  };

  const navigate = useNavigate();

  const isAllowedToCreateConcert = () => {
    const firstCondition = CreateConcertFormSchema.safeParse(newConcert());
    if (!firstCondition.success) {
      return false;
    }
    const sn = suggestNewNames();
    const secondCondition = sn.length === 0;
    return firstCondition.success && secondCondition;
  };

  const createConcert = createMutation(() => ({
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
    },
    onError: (error) => {
      toast.error("Error Creating Concert", {
        description: error.message,
      });
    },
  }));

  const isFormEmpty = (concert: z.infer<typeof CreateConcertFormSchema>) => {
    // check deep equality
    return JSON.stringify(concert) === JSON.stringify(DEFAULT_CONCERT);
  };

  return (
    <div class="flex flex-col gap-4 items-start w-full">
      <div class="flex flex-col">
        <Button
          variant="outline"
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
      <h1 class="text-3xl font-semibold w-full">Create Concert</h1>
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
                Tickets
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" class="flex flex-col gap-6 w-full">
              <TextField class="w-full flex flex-col gap-2" aria-label="Concert Name">
                <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  The Name of the Concert
                </TextFieldLabel>
                <TextFieldInput
                  value={newConcert().name}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setNewConcert((ev) => ({ ...ev, name: value }));
                  }}
                />
                <Show when={suggestNewNames().length > 0 && suggestNewNames()}>
                  {(v) => (
                    <>
                      <span class="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Concert '{newConcert().name}' exists already! Suggested Names:
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
                                setNewConcert((ev) => ({ ...ev, name: suggestion }));
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
              </TextField>
              <TextField class="w-full flex flex-col gap-2" aria-label="Concert Description">
                <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  What is the concert about?
                </TextFieldLabel>
                <TextFieldInput
                  value={newConcert().description}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setNewConcert((ev) => ({ ...ev, description: value }));
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
                    variant={dayjs(newConcert().day).isSame(dayjs().startOf("day"), "day") ? "secondary" : "outline"}
                    class="w-max gap-2 items-center justify-center"
                    type="button"
                    onClick={() => {
                      setNewConcert((ev) => {
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
                  value={dayjs(newConcert().day).format("YYYY-MM-DD")}
                  onChange={(date) => {
                    setNewConcert((ev) => {
                      return {
                        ...ev,
                        day: dayjs(date).startOf("day").toDate(),
                      };
                    });
                  }}
                ></DatePicker>
              </TextField>
            </TabsContent>
            <TabsContent value="location" class="flex flex-col gap-6 w-full">
              <div class="flex flex-col items-start justify-between gap-2 w-full">
                <RadioGroup
                  value={newConcert().location.location_type}
                  aria-label="Where is the concert?"
                  onChange={(value) => {
                    const v = value as ReturnType<typeof newConcert>["location"]["location_type"];
                    switch (v) {
                      case "venue":
                        setNewConcert((ev) => {
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
                        setNewConcert((ev) => {
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
                        setNewConcert((ev) => {
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
                        setNewConcert((ev) => {
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
                        console.log(s);
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
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-secondary rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newConcert().location.location_type === "online",
                            "bg-secondary": newConcert().location.location_type === "venue",
                          }
                        )}
                      >
                        <RadioGroupItemControl class="hidden" />
                        Venue <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                    <RadioGroupItem value="festival">
                      <RadioGroupItemControl class="hidden" />
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-secondary rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newConcert().location.location_type === "venue",
                            "bg-secondary": newConcert().location.location_type === "festival",
                          }
                        )}
                      >
                        Festival <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                    <RadioGroupItem value="other">
                      <RadioGroupItemControl class="hidden" />
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-secondary rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newConcert().location.location_type === "venue",
                            "bg-secondary": newConcert().location.location_type === "other",
                          }
                        )}
                      >
                        Other <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                    <RadioGroupItem value="online">
                      <RadioGroupItemControl class="hidden" />
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-secondary rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newConcert().location.location_type === "venue",
                            "bg-secondary": newConcert().location.location_type === "online",
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
                  <Match when={newConcert().location.location_type === "online"}>
                    <TextField class="w-full flex flex-col gap-2" aria-label="Location">
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        What is the URL of the concert?
                      </TextFieldLabel>
                      <TextFieldInput
                        value={
                          // @ts-ignore
                          newConcert().location.location_type === "online" && newConcert().location.url
                            ? // @ts-ignore
                              newConcert().location.url
                            : urlQuery()
                        }
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setURLQuery(value);
                          setNewConcert((ev) => {
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
                  <Match when={newConcert().location.location_type === "venue"}>
                    <TextField class="w-full flex flex-col gap-2" aria-label="Location">
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Where is the concert going to take place?
                      </TextFieldLabel>
                      <TextFieldInput
                        value={
                          // @ts-ignore
                          newConcert().location.location_type === "in_person" && newConcert().location.address
                            ? // @ts-ignore
                              newConcert().location.address
                            : locationQuery()
                        }
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setLocationQuery(value);
                          setNewConcert((ev) => {
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
                  <Match when={newConcert().location.location_type === "festival"}>
                    <TextField class="w-full flex flex-col gap-2" aria-label="Location">
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Where is the concert going to take place?
                      </TextFieldLabel>
                      <TextFieldInput
                        value={
                          // @ts-ignore
                          newConcert().location.location_type === "in_person" && newConcert().location.address
                            ? // @ts-ignore
                              newConcert().location.address
                            : locationQuery()
                        }
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setLocationQuery(value);
                          setNewConcert((ev) => {
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
                    setNewConcert((ev) => ({
                      ...ev,
                      capacity: {
                        capacity_type: "custom",
                        value: 1,
                      },
                    }));
                    return;
                  }
                  if (v === "none") {
                    setNewConcert((ev) => ({
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
                      Exclude<ReturnType<typeof newConcert>["capacity"]["value"], "custom" | "none">,
                      number
                    >;
                    setNewConcert((ev) => ({
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
                            "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-secondary rounded p-4 text-sm font-medium leading-none cursor-pointer capitalize",
                            {
                              "bg-secondary":
                                (newConcert().capacity.capacity_type === "recommended" &&
                                  newConcert().capacity.value === String(value)) ||
                                (newConcert().capacity.capacity_type === "custom" && value === "custom") ||
                                (newConcert().capacity.capacity_type === "none" && value === "none"),
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
              <Show when={newConcert().capacity.capacity_type === "custom"}>
                <TextField class="w-full flex flex-col gap-2" aria-label="Tickets">
                  <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Or choose a custom capacity
                  </TextFieldLabel>
                  <TextFieldInput
                    type="number"
                    min={0}
                    step="1"
                    value={newConcert().capacity.value}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      if (!value) return;
                      const capacity = parseInt(value);
                      if (isNaN(capacity)) return;

                      setNewConcert((ev) => ({
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
                <Show when={["recommended", "custom"].includes(newConcert().capacity.capacity_type)}>
                  <div class="flex flex-col gap-2">
                    <Separator />
                    <div class="flex flex-col gap-2">
                      <span class="text-sm font-medium leading-none">Type of Tickets</span>
                      <div class="w-full border border-muted rounded-md p-2">
                        <Table class="rounded-sm overflow-clip">
                          <TableCaption class="text-xs">Type of Tickets (e.g. VIP, Regular, etc.)</TableCaption>
                          <TableHeader>
                            <TableRow>
                              <For each={["Type", "Name", "Price", "Quantity", "Actions"] as const}>
                                {(header) => <TableCell class="text-sm font-medium leading-none">{header}</TableCell>}
                              </For>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <For each={newConcert().tickets}>
                              {(ticket, index) => (
                                <TableRow class="last:rounded-b-sm last:overflow-clip">
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
                                        tickets={() => newConcert().tickets}
                                        onChange={(newTicket) => {
                                          setNewConcert((ev) => {
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
                                          setNewConcert((ev) => {
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
                      <div></div>
                      <div class="flex flex-row gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label="Add Ticket"
                          onClick={() => {
                            setNewConcert((ev) => {
                              return {
                                ...ev,
                                tickets: [
                                  ...ev.tickets,
                                  {
                                    ticket_type: "free",
                                    name: "",
                                    price: 0,
                                    currency: {
                                      currency_type: "usd",
                                    },
                                    quantity: 1,
                                  },
                                ],
                              };
                            });
                          }}
                        >
                          Add Ticket
                        </Button>
                      </div>
                    </div>
                  </div>
                </Show>
              </Transition>
            </TabsContent>
          </Tabs>
          <div>
            <Show when={createConcert.isError && createConcert.error}>
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
                            createConcert.reset();
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
            <div>
              <Button
                type="button"
                variant="outline"
                aria-label="Clear Form"
                class="gap-2"
                onClick={(e) => {
                  if (!formRef) return;
                  setNewConcert(DEFAULT_CONCERT);
                  setTakenFromRecommendedOrPrevious(undefined);
                  formRef.reset();
                }}
                disabled={createConcert.isPending || isFormEmpty(newConcert())}
              >
                Clear
                <X class="w-4 h-4" />
              </Button>
            </div>
            <div class="flex flex-row gap-2">
              <Button
                size="icon"
                variant={currentTab() === "general" ? "outline" : "default"}
                disabled={createConcert.isPending || currentTab() === "general"}
                aria-label="Previous Tab"
                onClick={() => handleTabChange("backward")}
              >
                <ArrowLeft class="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={currentTab() === "location" ? "outline" : "default"}
                disabled={createConcert.isPending || currentTab() === "tickets"}
                aria-label="Next Tab"
                onClick={() => handleTabChange("forward")}
              >
                <ArrowLeft class="w-4 h-4 transform rotate-180" />
              </Button>
              <Button
                type="submit"
                aria-label="Create Concert"
                class="flex flex-row items-center justify-between gap-2"
                disabled={createConcert.isPending || !isAllowedToCreateConcert()}
              >
                <Switch>
                  <Match when={createConcert.isPending}>
                    <span class="text-sm font-medium leading-none">Creating Concert...</span>
                    <Loader2 class="w-4 h-4 animate-spin" />
                  </Match>
                  <Match when={createConcert.isSuccess}>
                    <span class="text-sm font-medium leading-none">Concert Created!</span>
                    <CheckCheck class="w-4 h-4" />
                  </Match>
                  <Match when={createConcert.isError}>
                    <span class="text-sm font-medium leading-none">Error Creating Concert</span>
                    <AlertCircleIcon class="w-4 h-4" />
                  </Match>
                  <Match when={createConcert.isIdle}>
                    <span class="text-sm font-medium leading-none">Create Concert</span>
                    <Plus class="w-4 h-4" />
                  </Match>
                </Switch>
              </Button>
              <Show when={createConcert.isSuccess && createConcert.data}>
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
        <div class="lg:w-max w-full flex flex-col gap-4">
          <div class="w-full flex flex-row items-center justify-between w-min-60">
            <h3
              class={cn("text-base font-medium", {
                "opacity-50": takenFromRecommendedOrPrevious() !== undefined,
              })}
            >
              Previous Concerts
            </h3>
            <Button
              size="sm"
              class="w-max h-7 p-0 items-center text-xs justify-center gap-2 px-2 pl-3"
              variant="secondary"
              onClick={() => {
                if (!formRef) return;
                setTakenFromRecommendedOrPrevious(undefined);
                setNewConcert(DEFAULT_CONCERT);
                formRef.reset();
              }}
              aria-label="Clear Previous Concert and Form"
              disabled={takenFromRecommendedOrPrevious() === undefined}
            >
              Clear
              <X class="w-3 h-3" />
            </Button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4 lg:w-max w-full self-end ">
            <Switch>
              <Match when={previousConcerts.isPending}>
                <For each={[1, 2, 3]}>
                  {(i) => (
                    <Skeleton>
                      <Card class="rounded-md shadow-sm lg:w-max w-full min-w-60">
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
              </Match>
              <Match when={previousConcerts.isError}>
                <div class="flex flex-col gap-2 w-full">
                  <span class="text-sm font-medium leading-none text-red-500">Error Fetching Previous Concerts</span>
                  <span class="text-sm font-medium leading-none">{previousConcerts.error?.message}</span>
                </div>
              </Match>
              <Match when={previousConcerts.isSuccess && previousConcerts.data}>
                {(data) => (
                  <For each={data().slice(0, 3)}>
                    {(concert, index) => (
                      <Card
                        class={cn("rounded-md shadow-sm lg:w-max w-full min-w-60 cursor-pointer ", {
                          "border-indigo-500 bg-indigo-400 dark:bg-indigo-600":
                            index() === takenFromRecommendedOrPrevious(),
                          "hover:bg-neutral-100 dark:hover:bg-neutral-900":
                            takenFromRecommendedOrPrevious() === undefined,
                          "opacity-100": takenFromRecommendedOrPrevious() === index(),
                          "opacity-50":
                            takenFromRecommendedOrPrevious() !== undefined &&
                            takenFromRecommendedOrPrevious() !== index(),
                          "cursor-default": takenFromRecommendedOrPrevious() !== undefined,
                        })}
                        onClick={() => {
                          if (takenFromRecommendedOrPrevious() !== undefined) return;
                          setNewConcert((ev) => ({
                            ...ev,
                            name: concert.name,
                            description: concert.description,
                          }));
                          setTakenFromRecommendedOrPrevious(index());
                        }}
                      >
                        <CardHeader class="flex flex-col p-3 pb-2 ">
                          <CardTitle
                            class={cn("text-sm", {
                              "text-white": index() === takenFromRecommendedOrPrevious(),
                            })}
                          >
                            {concert.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent class="p-3 pt-0 pb-4">
                          <CardDescription
                            class={cn("text-xs", {
                              "text-white": index() === takenFromRecommendedOrPrevious(),
                            })}
                          >
                            <p>{concert.description}</p>
                          </CardDescription>
                        </CardContent>
                        {/* <CardFooter class="flex flex-row items-center justify-between p-3 pt-0">
                          <div></div>
                          <div></div>
                        </CardFooter> */}
                      </Card>
                    )}
                  </For>
                )}
              </Match>
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}
