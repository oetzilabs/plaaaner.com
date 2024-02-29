import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemLabel,
  RadioGroupLabel,
} from "@/components/ui/radio-group";
import { TextFieldTextArea } from "@/components/ui/textarea";
import { TextField, TextFieldInput, TextFieldLabel } from "@/components/ui/textfield";
import URLPreview from "@/components/URLPreview";
import { cn } from "@/lib/utils";
import { clientOnly } from "@solidjs/start";
import { Clover, Container, Globe, PartyPopper } from "lucide-solid";
import { Match } from "solid-js";
import { createSignal, Switch } from "solid-js";
import { usePlanProvider } from "../CreatePlanProvider";

const ClientMap = clientOnly(() => import("@/components/ClientMap"));

export const LocationTab = () => {
  const plan = usePlanProvider();
  if (!plan) return null;

  const [locationQuery, setLocationQuery] = createSignal("");
  const [urlQuery, setURLQuery] = createSignal("");

  return (
    <>
      <div class="flex flex-col items-start justify-between gap-2 w-full">
        <RadioGroup
          value={plan.newPlan().location.location_type}
          aria-label={`Where is the ${plan.newPlan().event_type}?`}
          onChange={(value) => {
            const v = value as ReturnType<typeof plan.newPlan>["location"]["location_type"];
            switch (v) {
              case "venue":
                plan.setNewPlan((ev) => {
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
                plan.setNewPlan((ev) => {
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
                plan.setNewPlan((ev) => {
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
                plan.setNewPlan((ev) => {
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
            Where is the {plan.newPlan().event_type}?
          </RadioGroupLabel>
          <div class="grid grid-cols-2 gap-2 w-full">
            <RadioGroupItem value="venue">
              <RadioGroupItemLabel
                class={cn(
                  "flex flex-row items-center justify-center  gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                  {
                    "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                      plan.newPlan().location.location_type !== "venue",
                    "bg-secondary": plan.newPlan().location.location_type === "venue",
                  },
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
                      plan.newPlan().location.location_type !== "festival",
                    "bg-secondary": plan.newPlan().location.location_type === "festival",
                  },
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
                      plan.newPlan().location.location_type !== "online",
                    "bg-secondary": plan.newPlan().location.location_type === "online",
                  },
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
                      plan.newPlan().location.location_type !== "other",
                    "bg-secondary": plan.newPlan().location.location_type === "other",
                  },
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
          <Match when={plan.newPlan().location.location_type === "online"}>
            <TextField class="w-full flex flex-col gap-2" aria-label="Location">
              <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                What is the URL of the {plan.newPlan().event_type}?
              </TextFieldLabel>
              <TextFieldInput
                value={
                  // @ts-ignore
                  plan.newPlan().location.location_type === "online" && plan.newPlan().location.url
                    ? // @ts-ignore
                      plan.newPlan().location.url
                    : urlQuery()
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = e.currentTarget.value;
                    setLocationQuery(value);
                    plan.setNewPlan((ev) => ({
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
                  plan.setNewPlan((ev) => {
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
          <Match when={plan.newPlan().location.location_type === "venue"}>
            <TextField class="w-full flex flex-col gap-2" aria-label="Location">
              <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Where is the {plan.newPlan().event_type} going to take place?
              </TextFieldLabel>
              <TextFieldInput
                value={
                  // @ts-ignore
                  plan.newPlan().location.location_type === "venue" && plan.newPlan().location.address
                    ? // @ts-ignore
                      plan.newPlan().location.address
                    : locationQuery()
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = e.currentTarget.value;
                    setLocationQuery(value);
                    plan.setNewPlan((ev) => ({
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
                  plan.setNewPlan((ev) => {
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
          <Match when={plan.newPlan().location.location_type === "festival"}>
            <TextField class="w-full flex flex-col gap-2" aria-label="Location">
              <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Where is the {plan.newPlan().event_type} going to take place?
              </TextFieldLabel>
              <TextFieldInput
                value={
                  // @ts-ignore
                  plan.newPlan().location.location_type === "festival" && plan.newPlan().location.address
                    ? // @ts-ignore
                      plan.newPlan().location.address
                    : locationQuery()
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = e.currentTarget.value;
                    setLocationQuery(value);
                    plan.setNewPlan((ev) => ({
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
                  plan.setNewPlan((ev) => {
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
          <Match when={plan.newPlan().location.location_type === "other"}>
            <TextField class="w-full flex flex-col gap-2" aria-label="Other Location">
              <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Where is the {plan.newPlan().event_type} going to take place?
              </TextFieldLabel>
              <TextFieldTextArea
                autoResize
                value={
                  // @ts-ignore
                  plan.newPlan().location.location_type === "other" && plan.newPlan().location.details
                    ? // @ts-ignore
                      plan.newPlan().location.details
                    : locationQuery()
                }
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setLocationQuery(value);
                  plan.setNewPlan((ev) => {
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
    </>
  );
};
