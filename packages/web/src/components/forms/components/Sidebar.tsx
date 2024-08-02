import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Show } from "solid-js";
import { DEFAULT_PLAN, isFormEmpty, usePlanProvider } from "../CreatePlanProvider";
import { Eraser, Sparkles, Undo, History } from "lucide-solid";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { For } from "solid-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Sidebar = (props: { formRef: HTMLFormElement }) => {
  const plan = usePlanProvider();
  if (!plan)
    return (
      <div class="flex flex-row items-center gap-2">
        <Skeleton class="size-4" />
        <span>Tickets</span>
      </div>
    );
  return (
    <div class="lg:w-max w-full flex flex-col gap-8">
      <Show when={plan.previousPlans() != undefined && plan.previousPlans()}>
        {(pE) => (
          <div class="w-full flex flex-col gap-4">
            <div class="w-full flex flex-row items-center justify-between w-min-72">
              <div
                class={cn("flex flex-row gap-2 items-center", {
                  "opacity-50": plan.newPlan().referenced_from !== undefined,
                })}
              >
                <History class="size-4" />
                <h3 class="text-base font-medium capitalize">Previous {plan.newPlan().plan_type_id}</h3>
              </div>
              <div class="flex flex-row items-center gap-2">
                <Button
                  size="sm"
                  class="md:hidden flex w-max h-7 p-0 items-center text-xs justify-center gap-2 px-2 pl-3"
                  variant="outline"
                  onClick={() => {
                    if (!props.formRef) return;
                    props.formRef.reset();
                    plan.setNewPlan(DEFAULT_PLAN(plan.newPlan().plan_type_id));
                  }}
                  aria-label="Resets the Form"
                  disabled={plan.isCreating.pending || isFormEmpty(plan.newPlan())}
                >
                  Reset Form
                  <Eraser class="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  class="w-max h-7 p-0 items-center text-xs justify-center gap-2 px-2 pl-3"
                  variant={plan.newPlan().referenced_from === undefined ? "outline" : "secondary"}
                  onClick={() => {
                    const eH = plan.planHistory();
                    eH.undo();
                  }}
                  aria-label={`Undo Fill From Previous ${plan.newPlan().plan_type_id}`}
                  disabled={
                    plan.newPlan().referenced_from === undefined ||
                    plan.isCreating.pending ||
                    isFormEmpty(plan.newPlan())
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
                  "opacity-50": plan.newPlan().referenced_from !== undefined,
                })}
              >
                <AlertDescription class="text-xs">
                  You can also fill the form with a previous {plan.newPlan().plan_type_id} to save time.
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
                    <span class="text-xs text-muted-foreground">There are no previous {plan.newPlan().plan_type_id}s</span>
                  </div>
                }
              >
                {(innerPlan) => (
                  <Card
                    class={cn("rounded-md shadow-sm lg:w-max w-full lg:min-w-72 cursor-pointer ", {
                      "border-indigo-500 bg-indigo-400 dark:bg-indigo-600":
                        innerPlan.id === plan.newPlan().referenced_from,
                      "hover:bg-neutral-100 dark:hover:bg-neutral-900": plan.newPlan().referenced_from === undefined,
                      "opacity-100": plan.newPlan().referenced_from === innerPlan.id,
                      "opacity-50":
                        plan.newPlan().referenced_from !== undefined && plan.newPlan().referenced_from !== innerPlan.id,
                      "cursor-default": plan.newPlan().referenced_from !== undefined,
                    })}
                    onClick={() => {
                      if (plan.newPlan().referenced_from !== undefined) return;
                      plan.setNewPlan((ev) => ({
                        ...ev,
                        ...innerPlan,
                        referenced_from: innerPlan.id,
                      }));
                    }}
                  >
                    <CardHeader class="flex flex-col p-3 pb-2 ">
                      <CardTitle
                        class={cn("text-sm", {
                          "text-white": innerPlan.id === plan.newPlan().referenced_from,
                        })}
                      >
                        {innerPlan.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent class="p-3 pt-0 pb-4">
                      <CardDescription
                        class={cn("text-xs", {
                          "text-white": innerPlan.id === plan.newPlan().referenced_from,
                        })}
                      >
                        <p>{innerPlan.description}</p>
                      </CardDescription>
                    </CardContent>
                  </Card>
                )}
              </For>
            </div>
          </div>
        )}
      </Show>
      <Show when={plan.recommendedPlans() != undefined && plan.recommendedPlans()}>
        {(rE) => (
          <div class="w-full flex flex-col gap-4">
            <div class="w-full flex flex-row items-center justify-between w-min-72">
              <div
                class={cn("flex flex-row gap-2 items-center", {
                  "opacity-50": plan.newPlan().referenced_from !== undefined,
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
                    if (!props.formRef) return;
                    props.formRef.reset();
                    plan.setNewPlan(DEFAULT_PLAN(plan.newPlan().plan_type_id));
                  }}
                  aria-label="Resets the Form"
                  disabled={plan.isCreating.pending || isFormEmpty(plan.newPlan())}
                >
                  Reset Form
                  <Eraser class="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  class="w-max h-7 p-0 items-center text-xs justify-center gap-2 px-2 pl-3"
                  variant={plan.newPlan().referenced_from === undefined ? "outline" : "secondary"}
                  onClick={() => {
                    const eH = plan.planHistory();
                    eH.undo();
                  }}
                  aria-label={`Undo Fill From Previous ${plan.newPlan().plan_type_id}`}
                  disabled={
                    plan.newPlan().referenced_from === undefined ||
                    plan.isCreating.pending ||
                    isFormEmpty(plan.newPlan())
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
                  "opacity-50": plan.newPlan().referenced_from !== undefined,
                })}
              >
                <AlertDescription class="text-xs">
                  You can also fill the form with a recommended {plan.newPlan().plan_type_id} to save time.
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
                {(innerPlan) => (
                  <Card
                    class={cn("rounded-md shadow-sm lg:w-max w-full lg:min-w-72 cursor-pointer ", {
                      "border-indigo-500 bg-indigo-400 dark:bg-indigo-600":
                        innerPlan.id === plan.newPlan().referenced_from,
                      "hover:bg-neutral-100 dark:hover:bg-neutral-900": plan.newPlan().referenced_from === undefined,
                      "opacity-100": plan.newPlan().referenced_from === innerPlan.id,
                      "opacity-50":
                        plan.newPlan().referenced_from !== undefined && plan.newPlan().referenced_from !== innerPlan.id,
                      "cursor-default": plan.newPlan().referenced_from !== undefined,
                    })}
                    onClick={() => {
                      if (plan.newPlan().referenced_from !== undefined) return;
                      plan.setNewPlan((ev) => ({
                        ...ev,
                        ...plan,
                        referenced_from: innerPlan.id,
                      }));
                    }}
                  >
                    <CardHeader class="flex flex-col p-3 pb-2 ">
                      <CardTitle
                        class={cn("text-sm", {
                          "text-white": innerPlan.id === plan.newPlan().referenced_from,
                        })}
                      >
                        {innerPlan.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent class="p-3 pt-0 pb-4">
                      <CardDescription
                        class={cn("text-xs", {
                          "text-white": innerPlan.id === plan.newPlan().referenced_from,
                        })}
                      >
                        <p>{innerPlan.description}</p>
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
  );
};
