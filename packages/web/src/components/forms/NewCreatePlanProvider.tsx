import { getPlan, getPreviousPlans, getRecommendedPlans, savePlanGeneral } from "@/lib/api/plans";
import { createContextProvider } from "@solid-primitives/context";
import { createAsync, useAction, useSubmission } from "@solidjs/router";
import { JSXElement } from "solid-js";

export const [CreatePlanProvider, usePlanProvider] = createContextProvider((props: { plan_id: string }) => {
  const previousPlans = createAsync(() => getPreviousPlans(), { deferStream: true });
  const recommendedPlans = createAsync(() => getRecommendedPlans(), { deferStream: true });
  const savePlanAction = useAction(savePlanGeneral);
  const isSaving = useSubmission(savePlanGeneral);
  const plan = createAsync(() => getPlan(props.plan_id), { deferStream: true });

  return {
    previousPlans,
    recommendedPlans,
    savePlan: savePlanAction,
    isSaving,
    plan,
  };
});

export const CreatePlan = (props: { plan_id: string; children: JSXElement }) => {
  return (
    <CreatePlanProvider plan_id={props.plan_id}>
      <div class="flex flex-col gap-4 items-start w-full">
        <div class="flex flex-col">
          {/* <Button
            variant="secondary"
            size="sm"
            class="w-max gap-2"
            onClick={() => {
              history.back();
            }}
          >
            <ArrowLeft class="size-4" />
            Back
          </Button> */}
        </div>
        <h1 class="text-3xl font-semibold w-full capitalize">Create Plan</h1>
        <div class="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 py-4 w-full">{props.children}</div>
      </div>
    </CreatePlanProvider>
  );
};
