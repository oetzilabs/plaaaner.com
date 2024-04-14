import { TextField, TextFieldLabel, TextFieldInput } from "@/components/ui/textfield";
import { getPlan, savePlanGeneral } from "@/lib/api/plans";
import { createAsync, redirect, useAction, useNavigate, useParams, useSubmission } from "@solidjs/router";
import { Loader2 } from "lucide-solid";
import { Match } from "solid-js";
import { Show, Switch, createDeferred, createEffect, createSignal } from "solid-js";
import { z } from "zod";
import { Button } from "@/components/ui/button";

export default function PlanCreateGeneralPage() {
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

  const navigate = useNavigate();

  return (
    <Show when={typeof plan() !== "undefined" && plan()}>
      {(p) => {
        const t = p().name;
        const d = p().description ?? "";
        setTitle(t);
        setDescription(d);
        return (
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
            <div class="flex flex-row items-center justify-between gap-2 w-full">
              <div class="w-full flex-1 flex flex-row items-center justify-start gap-2"></div>
              <div class="w-max flex flex-row items-center justify-end gap-2">
                <Button
                  disabled={isSaving.pending}
                  size="sm"
                  class="w-full flex flex-row items-center justify-center gap-2"
                  onClick={async () => {
                    await savePlanAction({ plan_id: p().id, plan: { name: t, description: d } });
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
                <Button
                  size="sm"
                  class="w-full flex flex-row items-center justify-center gap-2"
                  onClick={() => {
                    navigate(`/plan/create/${p().id}/time`);
                  }}
                >
                  <span class="text-sm font-medium leading-none">Next</span>
                </Button>
              </div>
            </div>
          </>
        );
      }}
    </Show>
  );
}
