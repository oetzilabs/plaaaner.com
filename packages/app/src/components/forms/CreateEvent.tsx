import { cn } from "@/lib/utils";
import { Mutations } from "@/utils/api/mutations";
import { As } from "@kobalte/core";
import { createMutation, createQuery } from "@tanstack/solid-query";
import dayjs from "dayjs";
import {
  AlertCircleIcon,
  ArrowLeft,
  CheckCheck,
  Clock,
  Library,
  Loader2,
  MapPin,
  MessageCircleWarning,
  Plus,
  X,
} from "lucide-solid";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { toast } from "solid-sonner";
import { useNavigate } from "solid-start";
import { clientOnly } from "solid-start/islands";
import { z } from "zod";
import { Queries } from "../../utils/api/queries";
import { CreateEventFormSchema } from "../../utils/schemas/event";
import URLPreview from "../URLPreview";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemLabel,
  RadioGroupLabel,
} from "../ui/radio-group";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsIndicator } from "../ui/tabs";
import { TextField, TextFieldInput, TextFieldLabel } from "../ui/textfield";
import { A } from "@solidjs/router";

const ClientMap = clientOnly(() => import("../ClientMap"));

const DEFAULT_EVENT: z.infer<typeof CreateEventFormSchema> = {
  name: "",
  description: "",
  time: {
    time_type: "full_day",
    day: dayjs().startOf("day").toDate(),
  },
  location: {
    location_type: "in_person",
    address: "",
  },
};

type TabValue = "general" | "time" | "location";

const TabMovement: Record<"forward" | "backward", Record<TabValue, TabValue | undefined>> = {
  forward: {
    general: "time",
    time: "location",
    location: undefined,
  },
  backward: {
    general: undefined,
    time: "general",
    location: "time",
  },
};

export default function CreateEventForm() {
  let formRef: HTMLFormElement;
  const [newEvent, setNewEvent] = createSignal<z.infer<typeof CreateEventFormSchema>>(DEFAULT_EVENT);

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

  const previousEvents = createQuery(() => ({
    queryKey: ["previousEvents"],
    queryFn: () => {
      return Queries.Events.all();
    },
  }));

  const suggestNewNames = () => {
    const name = newEvent().name;
    if (!previousEvents.isSuccess) {
      return [];
    }
    if (name.length === 0) {
      return [];
    }
    // is the name already in the list?
    const existsStartingWithLowerCase = previousEvents.data.find((pEvent) =>
      pEvent.name.toLowerCase().startsWith(name.toLowerCase())
    );
    const existsExactLowercase = previousEvents.data.find((pEvent) => pEvent.name.toLowerCase() === name.toLowerCase());

    if (!existsExactLowercase) {
      return [];
    }
    if (!existsStartingWithLowerCase) {
      return [];
    }
    const lastCounter = previousEvents.data.reduce((acc, pEvent) => {
      const pEventName = pEvent.name.toLowerCase();

      // find the last number in the name, if it exists. the name can be "name-1" or "name 1" or even "name1"
      const lastNumber = pEventName.match(/(\d+)$/);

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
      toast.error("Error Creating Event", {
        description: validation.error?.message,
      });
      return;
    }

    return await createEvent.mutateAsync(validation.data);
  };

  const navigate = useNavigate();

  const isAllowedToCreateEvent = () => {
    const firstCondition = CreateEventFormSchema.safeParse(newEvent());
    if (!firstCondition.success) {
      return false;
    }
    const sn = suggestNewNames();
    const secondCondition = sn.length === 0;
    return firstCondition.success && secondCondition;
  };

  const createEvent = createMutation(() => ({
    mutationKey: ["createEvent"],
    mutationFn: async (data: Parameters<typeof Mutations.Events.create>[0]) => {
      return Mutations.Events.create(data);
    },
    onSuccess: (data) => {
      toast.info(`Event '${data.name}' Created!`, {
        action: {
          label: "View Event",
          onClick: () => {
            navigate(`/events/${data.id}`);
          },
        },
      });
    },
    onError: (error) => {
      toast.error("Error Creating Event", {
        description: error.message,
      });
    },
  }));

  const isFormEmpty = (event: z.infer<typeof CreateEventFormSchema>) => {
    // check deep equality
    return JSON.stringify(event) === JSON.stringify(DEFAULT_EVENT);
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
      <h1 class="text-3xl font-semibold w-full">Create Event</h1>
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
            </TabsList>
            <TabsContent value="general" class="flex flex-col gap-6 w-full">
              <TextField class="w-full flex flex-col gap-2" aria-label="Event Name">
                <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  The Name of the Event
                </TextFieldLabel>
                <TextFieldInput
                  value={newEvent().name}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setNewEvent((ev) => ({ ...ev, name: value }));
                  }}
                />
                <Show when={suggestNewNames().length > 0 && suggestNewNames()}>
                  {(v) => (
                    <>
                      <span class="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Event '{newEvent().name}' exists already! Suggested Names:
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
              </TextField>
              <TextField class="w-full flex flex-col gap-2" aria-label="Event Description">
                <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  What is the event about?
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
              <div class="flex flex-col items-start justify-between gap-2 w-full">
                <RadioGroup
                  defaultValue={newEvent().time.time_type === "full_day" ? "full_day" : "range"}
                  aria-label="When is the event?"
                  value={newEvent().time.time_type}
                  onChange={(value) => {
                    if (value === "full_day") {
                      setNewEvent((ev) => {
                        return {
                          ...ev,
                          time: {
                            time_type: value as "full_day",
                            day: dayjs().startOf("day").toDate(),
                          },
                        };
                      });
                    }
                    if (value === "range") {
                      setNewEvent((ev) => {
                        return {
                          ...ev,
                          time: {
                            time_type: value as "range",
                            start_time: dayjs().startOf("day").toDate(),
                            end_time: dayjs().startOf("day").toDate(),
                          },
                        };
                      });
                    }
                  }}
                  class="w-full flex flex-col gap-2"
                >
                  <RadioGroupLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    When is the event?
                  </RadioGroupLabel>
                  <div class="grid grid-cols-2 gap-2 w-full">
                    <RadioGroupItem value="range">
                      <RadioGroupItemControl class="hidden" />
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-secondary rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent().time.time_type === "full_day",
                            "bg-secondary": newEvent().time.time_type === "range",
                          }
                        )}
                      >
                        Time Range <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                    <RadioGroupItem value="full_day">
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-secondary rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent().time.time_type === "range",
                            "bg-secondary": newEvent().time.time_type === "full_day",
                          }
                        )}
                      >
                        <RadioGroupItemControl class="hidden" />
                        Full Day <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                  </div>
                </RadioGroup>
              </div>
              <div class="flex flex-col items-start justify-between gap-2 w-full">
                <Switch>
                  <Match when={newEvent().time.time_type === "range"}>
                    <div class="flex flex-row items-center justify-between gap-2 w-full">
                      <TextField class="w-full flex flex-col gap-2" aria-label="Start Time">
                        <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Start Time
                        </TextFieldLabel>
                        <TextFieldInput
                          type="date"
                          value={
                            newEvent().time.time_type === "range"
                              ? // @ts-ignore
                                dayjs(newEvent().time.start_time).format("YYYY-MM-DD")
                              : undefined
                          }
                          onChange={(e) => {
                            const value = e.currentTarget.value;
                            setNewEvent((ev) => {
                              return {
                                ...ev,
                                time: {
                                  ...ev.time,
                                  start_time: dayjs(value).startOf("day").toDate(),
                                },
                              };
                            });
                          }}
                        />
                      </TextField>
                      <TextField class="w-full flex flex-col gap-2" aria-label="End Time">
                        <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          End Time
                        </TextFieldLabel>
                        <TextFieldInput
                          type="date"
                          value={
                            newEvent().time.time_type === "range"
                              ? // @ts-ignore
                                dayjs(newEvent().time.end_time).format("YYYY-MM-DD")
                              : undefined
                          }
                          onChange={(e) => {
                            const value = e.currentTarget.value;
                            setNewEvent((ev) => {
                              return {
                                ...ev,
                                time: {
                                  ...ev.time,
                                  end_time: dayjs(value).startOf("day").toDate(),
                                },
                              };
                            });
                          }}
                        />
                      </TextField>
                    </div>
                  </Match>
                  <Match when={newEvent().time.time_type === "full_day"}>
                    <TextField class="w-full flex flex-col gap-2" aria-label="Date">
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Date
                      </TextFieldLabel>
                      <TextFieldInput
                        type="date"
                        value={
                          newEvent().time.time_type === "full_day"
                            ? // @ts-ignore
                              dayjs(newEvent().time.day).format("YYYY-MM-DD")
                            : undefined
                        }
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setNewEvent((ev) => {
                            return {
                              ...ev,
                              time: {
                                ...ev.time,
                                day: dayjs(value).startOf("day").toDate(),
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
            <TabsContent value="location" class="flex flex-col gap-6 w-full">
              <div class="flex flex-col items-start justify-between gap-2 w-full">
                <RadioGroup
                  value={newEvent().location.location_type === "in_person" ? "in_person" : "online"}
                  aria-label="Where is the event?"
                  onChange={(value) => {
                    if (value === "online") {
                      setNewEvent((ev) => {
                        return {
                          ...ev,
                          location: {
                            location_type: value as "online",
                            url: "",
                          },
                        };
                      });
                    }
                    if (value === "in_person") {
                      setNewEvent((ev) => {
                        return {
                          ...ev,
                          location: {
                            location_type: value as "in_person",
                            address: "",
                          },
                        };
                      });
                    }
                  }}
                  class="w-full flex flex-col gap-2"
                >
                  <RadioGroupLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Where is the event?
                  </RadioGroupLabel>
                  <div class="grid grid-cols-2 gap-2 w-full">
                    <RadioGroupItem value="in_person">
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-secondary rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent().location.location_type === "online",
                            "bg-secondary": newEvent().location.location_type === "in_person",
                          }
                        )}
                      >
                        <RadioGroupItemControl class="hidden" />
                        In Person <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                    <RadioGroupItem value="online">
                      <RadioGroupItemControl class="hidden" />
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-secondary rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent().location.location_type === "in_person",
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
                        What is the URL of the event?
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
                  <Match when={newEvent().location.location_type === "in_person"}>
                    <TextField class="w-full flex flex-col gap-2" aria-label="Location">
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Where is the event going to take place?
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
          </Tabs>
          <div>
            <Show when={createEvent.isError && createEvent.error}>
              {(e) => (
                <div class="flex flex-row items-center gap-2 text-red-500">
                  <MessageCircleWarning class="w-4 h-4" />
                  <span class="text-sm font-medium leading-none">{e().message}</span>
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
                  setNewEvent(DEFAULT_EVENT);
                  setTakenFromRecommendedOrPrevious(undefined);
                  formRef.reset();
                }}
                disabled={createEvent.isPending || isFormEmpty(newEvent())}
              >
                Clear
                <X class="w-4 h-4" />
              </Button>
            </div>
            <div class="flex flex-row gap-2">
              <Button
                size="icon"
                variant={currentTab() === "general" ? "outline" : "default"}
                disabled={createEvent.isPending || currentTab() === "general"}
                aria-label="Previous Tab"
                onClick={() => handleTabChange("backward")}
              >
                <ArrowLeft class="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={currentTab() === "location" ? "outline" : "default"}
                disabled={createEvent.isPending || currentTab() === "location"}
                aria-label="Next Tab"
                onClick={() => handleTabChange("forward")}
              >
                <ArrowLeft class="w-4 h-4 transform rotate-180" />
              </Button>
              <Button
                type="submit"
                aria-label="Create Event"
                class="flex flex-row items-center justify-between gap-2"
                disabled={createEvent.isPending || !isAllowedToCreateEvent()}
              >
                <Switch>
                  <Match when={createEvent.isPending}>
                    <span class="text-sm font-medium leading-none">Creating Event...</span>
                    <Loader2 class="w-4 h-4 animate-spin" />
                  </Match>
                  <Match when={createEvent.isSuccess}>
                    <span class="text-sm font-medium leading-none">Event Created!</span>
                    <CheckCheck class="w-4 h-4" />
                  </Match>
                  <Match when={createEvent.isError}>
                    <span class="text-sm font-medium leading-none">Error Creating Event</span>
                    <AlertCircleIcon class="w-4 h-4" />
                  </Match>
                  <Match when={createEvent.isIdle}>
                    <span class="text-sm font-medium leading-none">Create Event</span>
                    <Plus class="w-4 h-4" />
                  </Match>
                </Switch>
              </Button>
              <Show when={createEvent.isSuccess && createEvent.data}>
                {(data) => (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigate(`/events/${data().id}`);
                    }}
                  >
                    <span class="text-sm font-medium leading-none">View Event</span>
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
              Previous Events
            </h3>
            <Button
              size="sm"
              class="w-max h-7 p-0 items-center text-xs justify-center gap-2 px-2 pl-3"
              variant="secondary"
              onClick={() => {
                if (!formRef) return;
                setTakenFromRecommendedOrPrevious(undefined);
                setNewEvent(DEFAULT_EVENT);
                formRef.reset();
              }}
              aria-label="Clear Previous Event and Form"
              disabled={takenFromRecommendedOrPrevious() === undefined}
            >
              Clear
              <X class="w-3 h-3" />
            </Button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4 lg:w-max w-full self-end ">
            <Switch>
              <Match when={previousEvents.isPending}>
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
                            Use Event
                          </Button>
                        </CardFooter>
                      </Card>
                    </Skeleton>
                  )}
                </For>
              </Match>
              <Match when={previousEvents.isError}>
                <div class="flex flex-col gap-2 w-full">
                  <span class="text-sm font-medium leading-none text-red-500">Error Fetching Previous Events</span>
                  <span class="text-sm font-medium leading-none">{previousEvents.error?.message}</span>
                </div>
              </Match>
              <Match when={previousEvents.isSuccess && previousEvents.data}>
                {(data) => (
                  <For each={data().slice(0, 3)}>
                    {(event, index) => (
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
                          setNewEvent((ev) => ({
                            ...ev,
                            name: event.name,
                            description: event.description,
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
                            {event.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent class="p-3 pt-0 pb-4">
                          <CardDescription
                            class={cn("text-xs", {
                              "text-white": index() === takenFromRecommendedOrPrevious(),
                            })}
                          >
                            <p>{event.description}</p>
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
