import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CreatePlanFormSchema } from "@/utils/schemas/plan";
import { createMediaQuery } from "@solid-primitives/media";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { ArrowLeft, CheckCheck, Clock, Eraser, Library, Loader2, MapPin, Plus, Redo, Ticket, Undo } from "lucide-solid";
import { Accessor, Match, onMount, Setter, Show, Switch } from "solid-js";
import { z } from "zod";
import { DEFAULT_PLAN, isFormEmpty, TabMovement, TabValue, usePlanProvider } from "../CreatePlanProvider";
import { General } from "./General";
import { LocationTab } from "./Location";
import { Tickets } from "./Tickets";
import { Time } from "./Time";

export const FormControls = (props: {
  formRef: HTMLFormElement;
  currentTab: Accessor<TabValue>;
  setCurrentTab: Setter<TabValue>;
}) => {
  const plan = usePlanProvider();
  if (!plan)
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
    const firstCondition = CreatePlanFormSchema.safeParse(plan.newPlan());
    if (!firstCondition.success) {
      return false;
    }
    const sn = plan.suggestNewNames();
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
            plan.setNewPlan(DEFAULT_PLAN(plan.newPlan().plan_type_id));
            props.formRef.reset();
            plan.clearPlanHistory();
          }}
          disabled={plan.isCreating.pending || isFormEmpty(plan.newPlan())}
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
            const eH = plan.planHistory();
            eH.undo();
          }}
          disabled={plan.isCreating.pending || isFormEmpty(plan.newPlan())}
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
            const eH = plan.planHistory();
            eH.redo();
          }}
          disabled={plan.isCreating.pending || isFormEmpty(plan.newPlan()) || !plan.planHistory().canRedo()}
        >
          <Redo class="w-4 h-4" />
        </Button>
      </div>
      <div class="flex flex-row gap-2">
        <Button
          size="icon"
          variant={props.currentTab() === "general" ? "outline" : "secondary"}
          disabled={plan.isCreating.pending || props.currentTab() === "general"}
          aria-label="Previous Tab"
          onClick={() => handleTabChange("backward")}
        >
          <ArrowLeft class="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant={props.currentTab() === "tickets" ? "outline" : "secondary"}
          disabled={plan.isCreating.pending || props.currentTab() === "tickets"}
          aria-label="Next Tab"
          onClick={() => handleTabChange("forward")}
        >
          <ArrowLeft class="w-4 h-4 transform rotate-180" />
        </Button>
        <Button
          type="submit"
          aria-label={`Create ${plan.newPlan().plan_type_id}`}
          class="flex flex-row items-center justify-between gap-2 capitalize"
          disabled={plan.isCreating.pending || !isAllowedToCreatePlan()}
        >
          <Switch
            fallback={
              <>
                <span class="text-sm font-medium leading-none w-max">Create {plan.newPlan().plan_type_id}</span>
                <Plus class="w-4 h-4" />
              </>
            }
          >
            <Match when={plan.isCreating.pending}>
              <span class="text-sm font-medium leading-none">Creating {plan.newPlan().plan_type_id}...</span>
              <Loader2 class="w-4 h-4 animate-spin" />
            </Match>
            <Match when={plan.isCreating.result}>
              <span class="text-sm font-medium leading-none">{plan.newPlan().plan_type_id} Created!</span>
              <CheckCheck class="w-4 h-4" />
            </Match>
          </Switch>
        </Button>
        <Show when={!plan.isCreating.pending && plan.isCreating.result} keyed>
          {(data) => (
            <Button
              variant="secondary"
              onClick={() => {
                navigate(`/plans/${data.id}`);
              }}
            >
              <span class="text-sm font-medium leading-none capitalize">View {plan.newPlan().plan_type_id}</span>
            </Button>
          )}
        </Show>
      </div>
    </div>
  );
};

const TicketsTabTrigger = () => {
  const plan = usePlanProvider();
  if (!plan)
    return (
      <div class="flex flex-row items-center gap-2">
        <Skeleton class="size-4" />
        <span>Tickets</span>
      </div>
    );

  return (
    <span>
      {plan.newPlan().capacity.capacity_type !== "none" &&
      parseInt(
        plan.newPlan().capacity.value as Exclude<
          z.infer<typeof CreatePlanFormSchema>["capacity"]["value"],
          "none"
        > as string,
      ) > 0
        ? plan.newPlan().capacity.value
        : ""}{" "}
      Ticket
      {plan.newPlan().capacity.capacity_type !== "none" &&
      parseInt(
        plan.newPlan().capacity.value as Exclude<
          z.infer<typeof CreatePlanFormSchema>["capacity"]["value"],
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
  const [searchParams, setSearchParams] = useSearchParams();
  onMount(() => {
    const initialDataViaUrl = z
      .object({
        title: z.string(),
        description: z.string(),
      })
      .safeParse(searchParams);
    if (!initialDataViaUrl.success) {
      return;
    }
    plan?.setNewPlan((p) => ({
      ...p,
      name: initialDataViaUrl.data.title,
      description: initialDataViaUrl.data.description,
    }));
  });

  const handleSubmit = async (e: Event) => {
    const p = plan;
    if (!p) return;
    e.preventDefault();
    const nE = p.newPlan();
    await p.createPlan(nE);
  };

  return (
    <form onSubmit={handleSubmit} class="flex flex-col gap-6 xl:w-1/2 lg:w-2/3 w-full self-start" ref={props.formRef!}>
      <Show when={plan?.plan_type_id()}>{(eti) => <input hidden value={eti()} name="plan_type_id" />}</Show>
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
          <TabsTrigger value="tickets" class="text-sm font-medium leading-none gap-2 pl-1.5 md:pl-3" disabled>
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
