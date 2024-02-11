import { cn } from "@/lib/utils";
import { Mutations } from "@/utils/api/mutations";
import { As } from "@kobalte/core";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { AlertCircleIcon, ArrowLeft, CheckCheck, Loader2, MessageCircleWarning, Plus } from "lucide-solid";
import { createSignal, For, Match, Show, Switch } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { toast } from "solid-sonner";
import { useNavigate } from "solid-start";
import { clientOnly } from "solid-start/islands";
import { Queries } from "../../utils/api/queries";
import { CreateEventFormSchema } from "../../utils/schemas/event";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemLabel,
  RadioGroupLabel,
} from "../ui/radio-group";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "../ui/tabs";
import { TextField, TextFieldInput, TextFieldLabel } from "../ui/textfield";
import URLPreview from "../URLPreview";
import { z } from "zod";
import dayjs from "dayjs";

const ClientMap = clientOnly(() => import("../ClientMap"));

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
  const [newEvent, setNewEvent] = createStore<z.infer<typeof CreateEventFormSchema>>({
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
    queryKey: ["previousProjects"],
    queryFn: async () => {
      return Queries.Events.all();
    },
  }));

  const suggestNewNames = (name: string) => {
    if (!previousEvents.isSuccess) {
      return [];
    }
    const lastCounter = previousEvents.data.reduce((acc, pEvent) => {
      const pEventName = pEvent.name.toLowerCase();
      const re = new RegExp(name + "\\s*(?:-?\\d+)?");
      if (re.test(pEventName)) {
        const counter = +pEventName.replace(name, "").replace("-", "");
        if (!isNaN(counter)) {
          return Math.max(acc, counter);
        }
      }
      return acc;
    }, 0);
    if (lastCounter === 0) {
      return [];
    }
    const suggestions = [];
    for (let i = 1; i < 4; i++) {
      suggestions.push(`${name}-${lastCounter + i}`);
    }
    return suggestions;
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    const validation = CreateEventFormSchema.safeParse(newEvent);
    if (!validation.success) {
      toast.error("Error Creating Event", {
        description: "Please fix the errors and try again",
      });
      return;
    }
    console.log(validation.data);

    return await createEvent.mutateAsync(validation.data);
  };

  const navigate = useNavigate();

  const createEvent = createMutation(() => ({
    mutationKey: ["createEvent"],
    mutationFn: async (data: Parameters<typeof Mutations.Events.create>[0]) => {
      return Mutations.Events.create(data);
    },
    onSuccess: (data) => {
      toast.info(`Event  '${data.name}' Created!`, {
        action: {
          label: "View Event",
          onClick: () => {
            navigate(`/events/${data.id}`);
          },
        },
      });
    },
    onError: (error) => {
      toast.custom((id) => (
        <div class="flex flex-col p-4 gap-2 bg-red-50 dark:bg-red-950 w-full rounded-md">
          <span class="text-red-500 text-sm font-medium leading-none">Error Creating Event</span>
          <span class="text-sm font-medium leading-none">{error.message}</span>
        </div>
      ));
    },
  }));

  return (
    <>
      <h1 class="text-3xl font-semibold w-full">Create Event</h1>
      <div class="flex flex-row gap-8 py-4 xl:w-1/2 lg:w-2/3 w-full">
        <form onSubmit={handleSubmit} class="flex flex-col gap-6 w-full">
          <Tabs defaultValue="general" value={currentTab()} onChange={(value) => setCurrentTab(value as TabValue)}>
            <TabsList>
              <TabsTrigger value="general" class="text-sm font-medium leading-none">
                General
              </TabsTrigger>
              <TabsTrigger value="time" class="text-sm font-medium leading-none">
                Time
              </TabsTrigger>
              <TabsTrigger value="location" class="text-sm font-medium leading-none">
                Location
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" class="flex flex-col gap-6 w-full">
              <TextField class="w-full flex flex-col gap-2" aria-label="Event Name">
                <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  The Name of the Event
                </TextFieldLabel>
                <TextFieldInput
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setNewEvent(produce((draft) => (draft.name = value)));
                  }}
                />
                <Show when={newEvent.name.length > 0 && newEvent.name}>
                  {(v) => (
                    <Switch>
                      <Match when={suggestNewNames(v().toLowerCase()).length > 0 && suggestNewNames(v().toLowerCase())}>
                        {(data) => (
                          <>
                            <span class="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Event '{v()}' exists already! Suggested Names:
                            </span>
                            <div class="grid grid-cols-3 gap-2">
                              <For
                                each={data()}
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
                                    variant="secondary"
                                    onClick={() => {
                                      setNewEvent(produce((draft) => (draft.name = suggestion)));
                                    }}
                                  >
                                    <As component={Badge}>{suggestion}</As>
                                  </Button>
                                )}
                              </For>
                            </div>
                          </>
                        )}
                      </Match>
                    </Switch>
                  )}
                </Show>
              </TextField>
              <TextField class="w-full flex flex-col gap-2" aria-label="Event Description">
                <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  What is the event about?
                </TextFieldLabel>
                <TextFieldInput
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setNewEvent(produce((draft) => (draft.description = value)));
                  }}
                />
              </TextField>
            </TabsContent>
            <TabsContent value="time" class="flex flex-col gap-6 w-full">
              <div class="flex flex-col items-start justify-between gap-2 w-full">
                <RadioGroup
                  defaultValue={newEvent.time.time_type === "full_day" ? "full_day" : "range"}
                  aria-label="When is the event?"
                  value={newEvent.time.time_type}
                  onChange={(value) => {
                    setNewEvent(produce((draft) => (draft.time.time_type = value as "full_day" | "range")));
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
                              newEvent.time.time_type === "full_day",
                            "bg-secondary": newEvent.time.time_type === "range",
                          }
                        )}
                      >
                        Specific Time Range <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                    <RadioGroupItem value="full_day">
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-secondary rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent.time.time_type === "range",
                            "bg-secondary": newEvent.time.time_type === "full_day",
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
                  <Match when={newEvent.time.time_type === "range"}>
                    <div class="flex flex-row items-center justify-between gap-2 w-full">
                      <TextField class="w-full flex flex-col gap-2" aria-label="Start Time">
                        <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Start Time
                        </TextFieldLabel>
                        <TextFieldInput
                          type="date"
                          value={
                            newEvent.time.time_type === "range"
                              ? dayjs(newEvent.time.start_time).format("YYYY-MM-DD")
                              : undefined
                          }
                          onChange={(e) => {
                            const value = e.currentTarget.value;
                            setNewEvent(
                              produce((draft) => {
                                if (draft.time.time_type === "range") {
                                  draft.time.start_time = dayjs(value).toDate();
                                }
                              })
                            );
                          }}
                        />
                      </TextField>
                      <TextField class="w-full flex flex-col gap-2" aria-label="End Time">
                        <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          End Time
                        </TextFieldLabel>
                        <TextFieldInput type="date" required />
                      </TextField>
                    </div>
                  </Match>
                  <Match when={newEvent.time.time_type === "full_day"}>
                    <TextField class="w-full flex flex-col gap-2" aria-label="Date">
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Date
                      </TextFieldLabel>
                      <TextFieldInput
                        type="date"
                        value={
                          newEvent.time.time_type === "full_day"
                            ? dayjs(newEvent.time.day).format("YYYY-MM-DD")
                            : undefined
                        }
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setNewEvent(
                            produce((draft) => {
                              if (draft.time.time_type === "full_day") {
                                draft.time.day = dayjs(value).startOf("day").toDate();
                              }
                            })
                          );
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
                  value={newEvent.location.location_type === "in_person" ? "in_person" : "online"}
                  aria-label="When is the event?"
                  onChange={(value) => {
                    setNewEvent(produce((draft) => (draft.location.location_type = value as "in_person" | "online")));
                  }}
                  class="w-full flex flex-col gap-2"
                >
                  <RadioGroupLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    When is the event?
                  </RadioGroupLabel>
                  <div class="grid grid-cols-2 gap-2 w-full">
                    <RadioGroupItem value="online">
                      <RadioGroupItemControl class="hidden" />
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-secondary rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent.location.location_type === "in_person",
                            "bg-secondary": newEvent.location.location_type === "online",
                          }
                        )}
                      >
                        Online <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                    <RadioGroupItem value="in_person">
                      <RadioGroupItemLabel
                        class={cn(
                          "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-secondary rounded p-4 text-sm font-medium leading-none cursor-pointer",
                          {
                            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                              newEvent.location.location_type === "online",
                            "bg-secondary": newEvent.location.location_type === "in_person",
                          }
                        )}
                      >
                        <RadioGroupItemControl class="hidden" />
                        In Person <RadioGroupItemControl class="hidden" />
                      </RadioGroupItemLabel>
                    </RadioGroupItem>
                  </div>
                </RadioGroup>
              </div>
              <div class="flex flex-col items-start justify-between gap-2 w-full">
                <Switch>
                  <Match when={newEvent.location.location_type === "online"}>
                    <TextField class="w-full flex flex-col gap-2" aria-label="Location">
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        What is the URL of the event?
                      </TextFieldLabel>
                      <TextFieldInput
                        value={
                          newEvent.location.location_type === "online" && newEvent.location.url
                            ? newEvent.location.url
                            : urlQuery()
                        }
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setURLQuery(value);
                          setNewEvent(
                            produce((draft) => {
                              if (draft.location.location_type === "online") {
                                draft.location.url = value;
                              }
                            })
                          );
                        }}
                      />
                    </TextField>
                    <URLPreview query={urlQuery} />
                  </Match>
                  <Match when={newEvent.location.location_type === "in_person"}>
                    <TextField class="w-full flex flex-col gap-2" aria-label="Location">
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Where is the event going to take place?
                      </TextFieldLabel>
                      <TextFieldInput
                        value={
                          newEvent.location.location_type === "in_person" && newEvent.location.address
                            ? newEvent.location.address
                            : locationQuery()
                        }
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setLocationQuery(value);
                          setNewEvent(
                            produce((draft) => {
                              if (draft.location.location_type === "in_person") {
                                draft.location.address = value;
                              }
                            })
                          );
                        }}
                      />
                    </TextField>
                    <ClientMap query={locationQuery} />
                  </Match>
                </Switch>
              </div>
            </TabsContent>
          </Tabs>
          <div class="flex flex-row items-center justify-between gap-2 w-full">
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
            <div class="flex flex-row gap-2">
              <Button
                size="icon"
                variant={currentTab() === "general" ? "secondary" : "default"}
                disabled={createEvent.isPending || currentTab() === "general"}
                aria-label="Previous Tab"
                onClick={() => handleTabChange("backward")}
              >
                <ArrowLeft class="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={currentTab() === "location" ? "secondary" : "default"}
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
                disabled={createEvent.isPending}
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
      </div>
    </>
  );
}
