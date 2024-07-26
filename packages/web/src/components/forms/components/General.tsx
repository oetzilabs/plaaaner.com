import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { createAsync, redirect, revalidate, useAction, useParams, useSubmission } from "@solidjs/router";
import { createDeferred, createEffect, createSignal, Show } from "solid-js";
import { z } from "zod";
import { getActivities } from "../../../lib/api/activity";
import { getPlan, getPlans, getUpcomingThreePlans, savePlanGeneral } from "../../../lib/api/plans";

export const General = () => {
  const params = useParams();

  const plan = createAsync(() => getPlan(params.id), { deferStream: true });
  const savePlanAction = useAction(savePlanGeneral);
  const isSaving = useSubmission(savePlanGeneral);

  const [title, setTitle] = createSignal<string>("");
  const [description, setDescription] = createSignal<string>("");

  const defferedTitle = createDeferred(title, { timeoutMs: 500 });
  const defferedDescription = createDeferred(description, { timeoutMs: 500 });

  createEffect(async () => {
    const t = defferedTitle();
    const d = defferedDescription();
    if (t.length > 0 && d.length > 0) {
      const currentPlan = plan();
      if (!currentPlan) return;
      await savePlanAction({ plan_id: currentPlan.id, plan: { name: t, description: d } });

      await revalidate(getActivities.key);
      await revalidate(getUpcomingThreePlans.key);
      await revalidate(getPlans.key);
    }
  });

  return (
    <>
      <Show when={typeof plan() !== "undefined" && plan()}>
        {(p) => (
          <>
            <TextFieldRoot
              class="w-full flex flex-col gap-2"
              aria-label={`What is the Plan Name?`}
              value={title()}
              onChange={setTitle}
            >
              <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                What is the Plan Name?
              </TextFieldLabel>
              <TextField />
            </TextFieldRoot>
            <TextFieldRoot class="w-full flex flex-col gap-2" value={description()} onChange={setDescription}>
              <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                What is the Plan about? (optional)
              </TextFieldLabel>
              <TextField aria-label={`What is the Plan about? (optional)`} />
            </TextFieldRoot>
          </>
        )}
      </Show>
    </>
  );
};
