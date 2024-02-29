import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CreateEventFormSchema } from "@/utils/schemas/event";
import { createMediaQuery } from "@solid-primitives/media";
import { useNavigate } from "@solidjs/router";
import { ArrowLeft, CheckCheck, Clock, Eraser, Library, Loader2, MapPin, Plus, Redo, Ticket, Undo } from "lucide-solid";
import { Accessor, Match, Setter, Show, Switch } from "solid-js";
import { DEFAULT_PLAN, isFormEmpty, TabMovement, TabValue, usePlanProvider } from "../CreatePlanProvider";
import { General } from "./General";
import { LocationTab } from "./Location";
import { Time } from "./Time";
import { Tickets } from "./Tickets";
import { z } from "zod";

export const FormControls = (props: {
  formRef: HTMLFormElement;
  currentTab: Accessor<TabValue>;
  setCurrentTab: Setter<TabValue>;
}) => {
  const event = usePlanProvider();
  if (!event)
    return (
      <div class="flex flex-row items-center justify-between gap-2 w-full">
        <div class="flex flex-row items-center gap-2">
          <Skeleton class="size-4" />
          <Skeleton class="size-4" />
          <Skeleton class="size-4" />
        </div>
        <div class="flex flex-row gap-2">
          <Skeleton class="size-4" />
          <Skeleton class="size-4" />
          <Skeleton class="h-4 w-16" />
        </div>
      </div>
    );

  const isSmall = createMediaQuery("(max-width: 768px)", true);

  const handleTabChange = (direction: "forward" | "backward") => {
    const current = props.currentTab();
    const next = TabMovement[direction][current];
    if (next) {
      props.setCurrentTab(next);
    }
  };

  const isAllowedToCreatePlan = () => {
    const firstCondition = CreateEventFormSchema.safeParse(event.newPlan());
    if (!firstCondition.success) {
      return false;
    }
    const sn = event.suggestNewNames();
    const secondCondition = sn.length === 0;
    return firstCondition.success && secondCondition;
  };

  const navigate = useNavigate();

  return (
    <div class="flex flex-row items-center justify-between gap-2 w-full">
      <div class="flex flex-row items-center gap-2">
        <Button
          type="button"
          variant="outline"
          aria-label="Resets the Form"
          class="gap-2"
          size={isSmall() ? "icon" : "default"}
          onClick={() => {
            if (!props.formRef) return;
            event.setNewPlan(DEFAULT_PLAN(event.newPlan().event_type));
            props.formRef.reset();
            event.clearEventHistory();
          }}
          disabled={event.isCreating.pending || isFormEmpty(event.newPlan())}
        >
          <span class={cn("sr-only md:not-sr-only", { "md:sr-only": isSmall() })}>Reset Form</span>
          <Eraser class="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Undo last action"
          class="gap-2"
          onClick={() => {
            const eH = event.eventHistory();
            eH.undo();
          }}
          disabled={event.isCreating.pending || isFormEmpty(event.newPlan())}
        >
          <Undo class="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-label="Redo last action"
          class="gap-2"
          size="icon"
          onClick={() => {
            const eH = event.eventHistory();
            eH.redo();
          }}
          disabled={event.isCreating.pending || isFormEmpty(event.newPlan()) || !event.eventHistory().canRedo()}
        >
          <Redo class="w-4 h-4" />
        </Button>
      </div>
      <div class="flex flex-row gap-2">
        <Button
          size="icon"
          variant={props.currentTab() === "general" ? "outline" : "secondary"}
          disabled={event.isCreating.pending || props.currentTab() === "general"}
          aria-label="Previous Tab"
          onClick={() => handleTabChange("backward")}
        >
          <ArrowLeft class="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant={props.currentTab() === "tickets" ? "outline" : "secondary"}
          disabled={event.isCreating.pending || props.currentTab() === "tickets"}
          aria-label="Next Tab"
          onClick={() => handleTabChange("forward")}
        >
          <ArrowLeft class="w-4 h-4 transform rotate-180" />
        </Button>
        <Button
          type="submit"
          aria-label={`Create ${event.newPlan().event_type}`}
          class="flex flex-row items-center justify-between gap-2 capitalize"
          disabled={event.isCreating.pending || !isAllowedToCreatePlan()}
        >
          <Switch
            fallback={
              <>
                <span class="text-sm font-medium leading-none w-max">Create {event.newPlan().event_type}</span>
                <Plus class="w-4 h-4" />
              </>
            }
          >
            <Match when={event.isCreating.pending}>
              <span class="text-sm font-medium leading-none">Creating {event.newPlan().event_type}...</span>
              <Loader2 class="w-4 h-4 animate-spin" />
            </Match>
            <Match when={event.isCreating.result}>
              <span class="text-sm font-medium leading-none">{event.newPlan().event_type} Created!</span>
              <CheckCheck class="w-4 h-4" />
            </Match>
          </Switch>
        </Button>
        <Show when={!event.isCreating.pending && event.isCreating.result}>
          {(data) => (
            <Button
              variant="secondary"
              onClick={() => {
                navigate(`/plans/${data().id}`);
              }}
            >
              <span class="text-sm font-medium leading-none capitalize">View {event.newPlan().event_type}</span>
            </Button>
          )}
        </Show>
      </div>
    </div>
  );
};

const TicketsTabTrigger = () => {
  const event = usePlanProvider();
  if (!event)
    return (
      <div class="flex flex-row items-center gap-2">
        <Skeleton class="size-4" />
        <span>Tickets</span>
      </div>
    );

  return (
    <span>
      {event.newPlan().capacity.capacity_type !== "none" &&
      parseInt(
        event.newPlan().capacity.value as Exclude<
          z.infer<typeof CreateEventFormSchema>["capacity"]["value"],
          "none"
        > as string,
      ) > 0
        ? event.newPlan().capacity.value
        : ""}{" "}
      Ticket
      {event.newPlan().capacity.capacity_type !== "none" &&
      parseInt(
        event.newPlan().capacity.value as Exclude<
          z.infer<typeof CreateEventFormSchema>["capacity"]["value"],
          "none"
        > as string,
      ) === 1
        ? ""
        : "s"}
    </span>
  );
};

export const Form = (props: {
  formRef: HTMLFormElement;
  currentTab: Accessor<TabValue>;
  setCurrentTab: Setter<TabValue>;
}) => {
  const plan = usePlanProvider();
  if (!plan)
    return (
      <div class="flex flex-col gap-6 w-full">
        <Skeleton class="w-full h-8" />
        <Skeleton class="w-full h-40" />
      </div>
    );

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const nE = plan.newPlan();
    await plan.createPlan(nE);
  };

  return (
    <form onSubmit={handleSubmit} class="flex flex-col gap-6 xl:w-1/2 lg:w-2/3 w-full self-start" ref={props.formRef!}>
      <Show when={plan.event_type_id()}>{(eti) => <input hidden value={eti()} name="plan_type_id" />}</Show>
      <Tabs
        defaultValue="general"
        value={props.currentTab()}
        onChange={(value) => props.setCurrentTab(value as TabValue)}
      >
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
            <TicketsTabTrigger />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" class="flex flex-col gap-6 w-full">
          <General />
        </TabsContent>
        <TabsContent value="time" class="flex flex-col gap-6 w-full">
          <Time />
        </TabsContent>
        <TabsContent value="location" class="flex flex-col gap-6 w-full">
          <LocationTab />
        </TabsContent>
        <TabsContent value="tickets" class="flex flex-col gap-6 w-full">
          <Tickets />
        </TabsContent>
      </Tabs>
      <FormControls formRef={props.formRef!} setCurrentTab={props.setCurrentTab} currentTab={props.currentTab} />
    </form>
  );
};
