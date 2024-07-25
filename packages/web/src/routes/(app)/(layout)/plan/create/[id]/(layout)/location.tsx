import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemLabel,
  RadioGroupLabel,
} from "@/components/ui/radio-group";
import { TextArea } from "@/components/ui/textarea";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import URLPreview from "@/components/URLPreview";
import { getPlan, getPlanLocation, savePlanLocation } from "@/lib/api/plans";
import { cn } from "@/lib/utils";
import type { ConcertLocation } from "@oetzilabs-plaaaner-com/core/src/entities/plans";
import { A, createAsync, redirect, useAction, useParams, useSubmission } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { Clover, Container, Globe, Loader2, PartyPopper } from "lucide-solid";
import { createSignal, Match, Show, Switch } from "solid-js";
import { z } from "zod";

const ClientMap = clientOnly(() => import("@/components/ClientMap"));

export default function PlanCreateLocationPage() {
  const params = useParams();
  const v = params.id;
  const isUUID = z.string().uuid().safeParse(v);

  if (!v || !isUUID.success) {
    return redirect("/404", { status: 404 });
  }
  const planLocation = createAsync(() => getPlanLocation(isUUID.data), { deferStream: true });
  const plan = createAsync(() => getPlan(isUUID.data), { deferStream: true });
  const savePlanLocationAction = useAction(savePlanLocation);
  const isSaving = useSubmission(savePlanLocation);

  const [locationQuery, setLocationQuery] = createSignal("");
  const [urlQuery, setURLQuery] = createSignal("");

  const [location, setLocation] = createSignal<ConcertLocation>({
    location_type: "other",
    details: "",
  });

  return (
    <Show when={typeof planLocation() !== "undefined" && planLocation()}>
      {(pL) => {
        const lo_type = pL().location_type;
        switch (lo_type) {
          case "venue":
            setLocation({
              location_type: lo_type,
              address: "",
            });
            break;
          case "online":
            setLocation({
              location_type: lo_type,
              url: "",
            });

            break;
          case "festival":
            setLocation({
              location_type: lo_type,
              address: "",
            });
            break;
          case "other":
            setLocation({
              location_type: lo_type,
              details: "",
            });
            break;
          default:
            const s: never = lo_type;
            break;
        }
        console.log("lo_type", lo_type);

        return (
          <>
            <div class="flex flex-col items-start justify-between gap-2 w-full">
              <RadioGroup
                value={location().location_type}
                aria-label={`Where is the plan going to take place?`}
                onChange={(value) => {
                  const v = value as ConcertLocation["location_type"];
                  switch (v) {
                    case "venue":
                      setLocation({
                        location_type: v,
                        address: "",
                      });
                      break;
                    case "online":
                      setLocation({
                        location_type: v,
                        url: "",
                      });

                      break;
                    case "festival":
                      setLocation({
                        location_type: v,
                        address: "",
                      });
                      break;
                    case "other":
                      setLocation({
                        location_type: v,
                        details: "",
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
                  Where is the plan going to take place?
                </RadioGroupLabel>
                <div class="grid grid-cols-2 gap-2 w-full">
                  <RadioGroupItem value="venue">
                    <RadioGroupItemLabel
                      class={cn(
                        "flex flex-row items-center justify-center  gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                        {
                          "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                            location().location_type !== "venue",
                          "bg-secondary": location().location_type === "venue",
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
                            location().location_type !== "festival",
                          "bg-secondary": location().location_type === "festival",
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
                            location().location_type !== "online",
                          "bg-secondary": location().location_type === "online",
                        },
                      )}
                    >
                      <Globe class="size-4" />
                      Online <RadioGroupItemControl class="hidden" />
                    </RadioGroupItemLabel>
                  </RadioGroupItem>
                  <RadioGroupItem value="other">
                    <RadioGroupItemLabel
                      class={cn(
                        "flex flex-row items-center justify-center  gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                        {
                          "peer-disabled:cursor-not-allowed peer-disabled:opacity-70":
                            location().location_type !== "other",
                          "bg-secondary": location().location_type === "other",
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
                <Match when={location().location_type === "online"}>
                  <TextFieldRoot
                    class="w-full flex flex-col gap-2"
                    aria-label="Location"
                    value={
                      // @ts-ignore
                      location().location_type === "online" && pL().url
                        ? // @ts-ignore
                          pL().url
                        : urlQuery()
                    }
                    onChange={(value) => {
                      setURLQuery(value);
                      setLocation({
                        location_type: "online",
                        url: value,
                      });
                    }}
                  >
                    <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      What is the URL of the plan?
                    </TextFieldLabel>
                    <TextField />
                  </TextFieldRoot>
                  <URLPreview query={urlQuery} />
                </Match>
                <Match when={location().location_type === "venue"}>
                  <TextFieldRoot
                    class="w-full flex flex-col gap-2"
                    aria-label="Location"
                    value={
                      // @ts-ignore
                      location().location_type === "venue" && pL().address
                        ? // @ts-ignore
                          pL().address
                        : locationQuery()
                    }
                    onChange={(value) => {
                      setLocationQuery(value);
                      setLocation({
                        location_type: "venue",
                        address: value,
                      });
                    }}
                  >
                    <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Where is the plan going to take place?
                    </TextFieldLabel>
                    <TextField />
                  </TextFieldRoot>
                  <ClientMap query={locationQuery} />
                </Match>
                <Match when={location().location_type === "festival"}>
                  <TextFieldRoot
                    class="w-full flex flex-col gap-2"
                    aria-label="Location"
                    value={
                      // @ts-ignore
                      location().location_type === "festival" && pL().address
                        ? // @ts-ignore
                          pL().address
                        : locationQuery()
                    }
                    onChange={(value) => {
                      setLocationQuery(value);
                      setLocation({
                        location_type: "festival",
                        address: value,
                      });
                    }}
                  >
                    <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Where is the plan going to take place?
                    </TextFieldLabel>
                    <TextField />
                  </TextFieldRoot>
                  <ClientMap query={locationQuery} />
                </Match>
                <Match when={location().location_type === "other"}>
                  <TextFieldRoot
                    class="w-full flex flex-col gap-2"
                    aria-label="Other Location"
                    value={
                      // @ts-ignore
                      location().location_type === "other" && pL().details
                        ? // @ts-ignore
                          pL().details
                        : locationQuery()
                    }
                    onChange={(value) => {
                      setLocationQuery(value);
                      setLocation({
                        location_type: "other",
                        details: value,
                      });
                    }}
                  >
                    <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Where is the plan going to take place?
                    </TextFieldLabel>
                    <TextArea autoResize />
                  </TextFieldRoot>
                </Match>
              </Switch>
            </div>
            <div class="w-full flex flex-row items-center justify-between gap-2">
              <div class="w-full"></div>
              <div class="w-max flex flex-row items-center justify-end gap-2">
                <Button
                  disabled={isSaving.pending}
                  size="sm"
                  class="w-full flex flex-row items-center justify-center gap-2"
                  onClick={async () => {
                    const l = location();
                    const p = plan();
                    if (!p) return;
                    await savePlanLocationAction({
                      plan_id: p.id,
                      plan: {
                        location: l,
                      },
                    });
                  }}
                >
                  <Switch>
                    <Match when={!isSaving.pending}>
                      <span class="text-sm font-medium leading-none">Save</span>
                    </Match>
                    <Match when={isSaving.pending}>
                      <Loader2 class="w-4 h-4 animate-spin" />
                      <span class="text-sm font-medium leading-none">Saving</span>
                    </Match>
                  </Switch>
                </Button>
                <A href="/dashboard">
                  <Button size="sm" class="w-full flex flex-row items-center justify-center gap-2">
                    <span class="text-sm font-medium leading-none w-max">Go To Dashboard</span>
                  </Button>
                </A>
              </div>
            </div>
          </>
        );
      }}
    </Show>
  );
}
