import { Button } from "@/components/ui/button";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxTrigger } from "@/components/ui/combobox";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemInput,
  RadioGroupItemLabel,
  RadioGroupLabel,
} from "@/components/ui/radio-group";
import { TextArea } from "@/components/ui/textarea";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import URLPreview from "@/components/URLPreview";
import { getPlan, savePlanLocation } from "@/lib/api/plans";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import type { ConcertLocation, Plans } from "@oetzilabs-plaaaner-com/core/src/entities/plans";
import { debounce } from "@solid-primitives/scheduled";
import { A, createAsync, RouteDefinition, useAction, useParams, useSubmission } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { createQuery } from "@tanstack/solid-query";
import { Clover, Container, Globe, Loader2, PartyPopper } from "lucide-solid";
import { createSignal, ErrorBoundary, Match, Show, Suspense, Switch } from "solid-js";

const ClientMap = clientOnly(() => import("@/components/ClientMap"));

export const route = {
  preload: async (props) => {
    const session = await getAuthenticatedSession();
    const plan = await getPlan(props.params.id);
    return { plan, session };
  },
} satisfies RouteDefinition;

const DEFAULT_LOCATION: Record<ConcertLocation["location_type"], ConcertLocation> = {
  venue: {
    location_type: "venue",
    address: "",
  },
  online: {
    location_type: "online",
    url: "",
  },
  festival: {
    location_type: "festival",
    address: "",
  },
  other: {
    location_type: "other",
    details: "",
  },
};

export default function PlanCreateLocationPage() {
  const params = useParams();
  const plan = createAsync(() => getPlan(params.id), { deferStream: true });

  return (
    <Show when={plan() && plan()} keyed fallback={<div>Loading...</div>}>
      {(p) => <Wrapper plan={p} />}
    </Show>
  );
}

const getLocationQuery = (location: ConcertLocation) => {
  if (location.location_type === "venue") return location.address;
  if (location.location_type === "festival") return location.address;
  if (location.location_type === "online") return location.url;
  return "";
};

const getUrlQuery = (location: ConcertLocation) => {
  if (location.location_type === "online") return location.url;
  return "";
};

const Wrapper = (props: { plan: Plans.Frontend }) => {
  const savePlanLocationAction = useAction(savePlanLocation);
  const isSaving = useSubmission(savePlanLocation);
  const [locationQuery, setLocationQuery] = createSignal(getLocationQuery(props.plan.location));
  const [urlQuery, setURLQuery] = createSignal(getUrlQuery(props.plan.location));

  const [location, setLocation] = createSignal<ConcertLocation>(props.plan.location);

  const debouncedLocationInputChange = debounce(setLocationQuery, 500);

  const onInputChange = (value: string) => {
    debouncedLocationInputChange(value);
  };

  const locationSearch = createQuery(() => ({
    queryKey: ["location-search", locationQuery()],
    queryFn: async (params) => {
      const q = params.queryKey[1];
      if (q.length <= 2) {
        return null;
      }
      const result = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURI(q)}&format=json&addressdetails=1`,
      ).then((res) => res.json() as Promise<{ display_name: string; lat: number; lon: number; class: string }[]>);
      const addresses = result.map((r) => r.display_name);
      return addresses;
    },
    get enable() {
      const q = locationQuery();
      return q.length > 2;
    },
  }));

  return (
    <>
      <div class="flex flex-col items-start justify-between gap-2 w-full">
        <RadioGroup
          value={location().location_type}
          aria-label={`Where is the plan going to take place?`}
          onChange={(value) => {
            const v = value as ConcertLocation["location_type"];
            console.log("v", v);
            if (v in DEFAULT_LOCATION) {
              setLocation(DEFAULT_LOCATION[v]);
            }
          }}
          class="w-full flex flex-col gap-2"
        >
          <RadioGroupLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Where is the plan going to take place?
          </RadioGroupLabel>
          <div class="grid grid-cols-2 gap-2 w-full">
            <RadioGroupItem value="venue">
              <RadioGroupItemInput />
              <RadioGroupItemLabel
                class={cn(
                  "flex flex-row items-center justify-center  gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                  {
                    "peer-disabled:cursor-not-allowed peer-disabled:opacity-70": location().location_type !== "venue",
                    "bg-secondary": location().location_type === "venue",
                  },
                )}
              >
                <Container class="size-4" />
                Venue <RadioGroupItemControl class="hidden" />
              </RadioGroupItemLabel>
            </RadioGroupItem>
            <RadioGroupItem value="festival">
              <RadioGroupItemInput />
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
              <RadioGroupItemInput />
              <RadioGroupItemLabel
                class={cn(
                  "flex flex-row items-center justify-center  gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                  {
                    "peer-disabled:cursor-not-allowed peer-disabled:opacity-70": location().location_type !== "online",
                    "bg-secondary": location().location_type === "online",
                  },
                )}
              >
                <Globe class="size-4" />
                Online <RadioGroupItemControl class="hidden" />
              </RadioGroupItemLabel>
            </RadioGroupItem>
            <RadioGroupItem value="other">
              <RadioGroupItemInput />
              <RadioGroupItemLabel
                class={cn(
                  "flex flex-row items-center justify-center  gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                  {
                    "peer-disabled:cursor-not-allowed peer-disabled:opacity-70": location().location_type !== "other",
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
      <Suspense
        fallback={
          <div class="w-full flex flex-col gap-4 grow items-center justify-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <Loader2 class="size-4 animate-spin" />
          </div>
        }
      >
        <div class="flex flex-col items-start justify-between gap-2 w-full grow">
          <Switch>
            <Match when={location().location_type === "online"}>
              <TextFieldRoot
                class="w-full flex flex-col gap-2"
                aria-label="Location"
                value={
                  // @ts-ignore
                  location().location_type === "online" && pL.url
                    ? // @ts-ignore
                      pL.url
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
            <Match
              when={
                location().location_type === "venue" &&
                (location() as Extract<ConcertLocation, { location_type: "venue" }>)
              }
            >
              {(lA) => (
                <>
                  <div class="flex flex-row items-start justify-between gap-2 w-full">
                    <Combobox
                      class="w-full"
                      options={locationSearch.data ?? []}
                      onInputChange={onInputChange}
                      defaultValue={lA().address}
                      onChange={(value) => {
                        if (!value) return;
                        setLocation({
                          location_type: "venue",
                          address: value,
                        });
                        setLocationQuery(value);
                      }}
                      itemComponent={(props) => (
                        <ComboboxItem item={props.item} onClick={() => {}}>
                          {props.item.rawValue}
                        </ComboboxItem>
                      )}
                    >
                      <ComboboxTrigger class="w-full">
                        <ComboboxInput placeholder="Search for a location" class="w-full" value={lA().address} />
                      </ComboboxTrigger>
                      <ComboboxContent />
                    </Combobox>
                    <Button
                      onClick={() => {
                        setLocation({ location_type: "venue", address: "" });
                        setLocationQuery("");
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                  <Suspense fallback={<Loader2 class="size-4 animate-spin" />}>
                    <ErrorBoundary
                      fallback={(e, r) => (
                        <div class="text-red-500 flex flex-col gap-2">
                          <span>There was an error loading the map</span>
                          <pre>{JSON.stringify(e.stack)}</pre>
                          <Button
                            onClick={() => {
                              r();
                            }}
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                    >
                      <ClientMap query={locationQuery} />
                    </ErrorBoundary>
                  </Suspense>
                </>
              )}
            </Match>
            <Match
              when={
                location().location_type === "festival" &&
                (location() as Extract<ConcertLocation, { location_type: "festival" }>)
              }
            >
              {(lA) => (
                <>
                  <div class="flex flex-row items-start justify-between gap-2 w-full">
                    <Combobox
                      class="w-full"
                      options={locationSearch.data ?? []}
                      defaultValue={lA().address}
                      onInputChange={onInputChange}
                      onChange={(value) => {
                        if (!value) return;
                        setLocation({
                          location_type: "festival",
                          address: value,
                        });
                        setLocationQuery(value);
                      }}
                      itemComponent={(props) => <ComboboxItem item={props.item}>{props.item.rawValue}</ComboboxItem>}
                    >
                      <ComboboxTrigger class="w-full">
                        <ComboboxInput placeholder="Search for a location" class="w-full" value={lA().address} />
                      </ComboboxTrigger>
                      <ComboboxContent />
                    </Combobox>
                    <Button
                      onClick={() => {
                        setLocation({ location_type: "festival", address: "" });
                        setLocationQuery("");
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                  <Suspense fallback={<Loader2 class="size-4 animate-spin" />}>
                    <ErrorBoundary
                      fallback={(e, r) => (
                        <div class="text-red-500 flex flex-col gap-2">
                          <span>There was an error loading the map</span>
                          <pre>{JSON.stringify(e.stack)}</pre>
                          <Button
                            onClick={() => {
                              r();
                            }}
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                    >
                      <ClientMap query={locationQuery} />
                    </ErrorBoundary>
                  </Suspense>
                </>
              )}
            </Match>
            <Match when={location().location_type === "other"}>
              <TextFieldRoot
                class="w-full flex flex-col gap-2"
                aria-label="Other Location"
                value={
                  // @ts-ignore
                  location().location_type === "other" && pL.details
                    ? // @ts-ignore
                      pL.details
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
      </Suspense>
      <div class="w-full flex flex-row items-center justify-between gap-2">
        <div class="w-full"></div>
        <div class="w-max flex flex-row items-center justify-end gap-2">
          <Button
            disabled={isSaving.pending}
            size="sm"
            class="w-full flex flex-row items-center justify-center gap-2"
            onClick={async () => {
              const l = location();
              const p = props.plan;
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
};
