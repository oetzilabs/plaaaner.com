import { Button } from "@/components/ui/button";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { getPlan, savePlanGeneral } from "@/lib/api/plans";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RouteDefinition, useAction, useNavigate, useParams, useSubmission } from "@solidjs/router";
import { Loader2 } from "lucide-solid";
import { createSignal, Match, Show, Switch } from "solid-js";

export const route = {
  preload: async (props) => {
    const session = await getAuthenticatedSession();
    const plan = await getPlan(props.params.plan_id);
    return { plan, session };
  },
} satisfies RouteDefinition;

export default function PlanCreateGeneralPage() {
  const params = useParams();

  const plan = createAsync(() => getPlan(params.plan_id), { deferStream: true });
  const savePlanAction = useAction(savePlanGeneral);
  const isSaving = useSubmission(savePlanGeneral);

  const [title, setTitle] = createSignal<string>("");
  const [description, setDescription] = createSignal<string>("");

  const navigate = useNavigate();

  return (
    <Show when={plan() && plan()}>
      {(p) => {
        const t = p().name;
        const d = p().description ?? "";
        setTitle(t);
        setDescription(d);
        return (
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
              </div>
            </div>
          </>
        );
      }}
    </Show>
  );
}
