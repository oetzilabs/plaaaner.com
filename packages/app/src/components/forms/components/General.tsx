import { Button } from "@/components/ui/button";
import { TextField, TextFieldLabel, TextFieldInput } from "@/components/ui/textfield";
import { As } from "@kobalte/core";
import { Badge, Loader2 } from "lucide-solid";
import { Show, For } from "solid-js";
import { usePlanProvider } from "../CreatePlanProvider";

export const General = () => {
  const plan = usePlanProvider();

  if (!plan) return <Loader2 class="size-4 animate-spin" />;

  return (
    <>
      <TextField class="w-full flex flex-col gap-2" aria-label={`${plan.newPlan().plan_type} Name`}>
        <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          The Name of the <span class="capitalize">{plan.newPlan().plan_type}</span>
        </TextFieldLabel>
        <TextFieldInput
          value={plan.newPlan().name}
          onChange={(e) => {
            const value = e.currentTarget.value;
            plan.setNewPlan((ev) => ({ ...ev, name: value }));
          }}
        />
        <Show
          when={plan.previousPlans() !== undefined && plan.previousPlans()}
          fallback={<Loader2 class="w-4 h-4 animate-spin" />}
        >
          <Show when={plan.suggestNewNames().length > 0 && plan.suggestNewNames()}>
            {(v) => (
              <>
                <span class="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  <span class="capitalize">{plan.newPlan().plan_type}</span> '{plan.newPlan().name}' exists already!
                  Suggested Names:
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
                          plan.setNewPlan((ev) => ({ ...ev, name: suggestion }));
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
      <TextField class="w-full flex flex-col gap-2">
        <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          What is the {plan.newPlan().plan_type} about? (optional)
        </TextFieldLabel>
        <TextFieldInput
          aria-label={`What is the ${plan.newPlan().plan_type} about? (optional)`}
          value={plan.newPlan().description ?? ""}
          onChange={(e) => {
            const value = e.currentTarget.value;
            plan.setNewPlan((ev) => ({ ...ev, description: value }));
          }}
        />
      </TextField>
    </>
  );
};
