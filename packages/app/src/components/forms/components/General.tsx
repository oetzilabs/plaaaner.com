import { TextField, TextFieldLabel, TextFieldInput } from "@/components/ui/textfield";
import { Show, createDeferred, createEffect, createSignal } from "solid-js";
import { createAsync, redirect, revalidate, useAction, useParams, useSubmission } from "@solidjs/router";
import { getPlan, getPlans, getUpcomingThreePlans, savePlanGeneral } from "../../../lib/api/plans";
import { z } from "zod";
import { getActivities } from "../../../lib/api/activity";

export const General = () => {
  const params = useParams();
  const v = params.id;
  const isUUID = z.string().uuid().safeParse(v);

  if (!v || !isUUID.success) {
    return redirect("/404", { status: 404 });
  }

  const plan = createAsync(() => getPlan(isUUID.data), { deferStream: true });
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
    <Show when={typeof plan() !== "undefined" && plan()}>
      {(p) => (
        <>
          <TextField class="w-full flex flex-col gap-2" aria-label={`What is the Plan Name?`}>
            <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              What is the Plan Name?
            </TextFieldLabel>
            <TextFieldInput
              value={title()}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setTitle(value);
              }}
            />
          </TextField>
          <TextField class="w-full flex flex-col gap-2">
            <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              What is the Plan about? (optional)
            </TextFieldLabel>
            <TextFieldInput
              aria-label={`What is the Plan about? (optional)`}
              value={description()}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setDescription(value);
              }}
            />
          </TextField>
        </>
      )}
    </Show>
  );
};
