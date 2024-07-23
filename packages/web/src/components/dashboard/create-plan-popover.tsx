import { createNewPlan } from "@/lib/api/plans";
import { useAction, useSubmission } from "@solidjs/router";
import { Dayjs } from "dayjs";
import { Loader2, Plus } from "lucide-solid";
import { createSignal, Match, Switch } from "solid-js";
import { Button } from "../ui/button";
import { TextField, TextFieldLabel, TextFieldInput } from "../ui/textfield";

export const CreatePlanPopover = (props: { timeslot: Dayjs }) => {
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [planLocation, setPlanLocation] = createSignal("");
  const create = useAction(createNewPlan);
  const [planType, setPlanType] = createSignal<Parameters<typeof create>[0]["plan_type"]>("event");
  const isCreating = useSubmission(createNewPlan);
  const createPlan = async () => {
    await create({
      name: name(),
      days: [props.timeslot.toDate(), props.timeslot.add(30, "minutes").toDate()],
      tickets: [],
      capacity: {
        capacity_type: "none",
        value: "none",
      },
      location: {
        location_type: "other",
        details: planLocation(),
      },
      plan_type: planType(),
      time_slots: {},
      description: description(),
    });
  };

  return (
    <div class="flex flex-col gap-6 w-full pt-1 px-0">
      <div class="font-bold text-lg">New Plan</div>
      <div class="">
        <TextField
          onChange={(v) => {
            setName(v);
          }}
        >
          <TextFieldLabel class="gap-2 flex flex-col">
            <span class="font-bold">Name</span>
            <TextFieldInput />
          </TextFieldLabel>
        </TextField>
      </div>
      <div class="">
        <TextField
          onChange={(v) => {
            setDescription(v);
          }}
        >
          <TextFieldLabel class="gap-2 flex flex-col">
            <span class="font-bold">Description</span>
            <TextFieldInput />
          </TextFieldLabel>
        </TextField>
      </div>
      <div class="">
        <TextField
          onChange={(v) => {
            setPlanLocation(v);
          }}
        >
          <TextFieldLabel class="gap-2 flex flex-col">
            <span class="font-bold">Location</span>
            <TextFieldInput />
          </TextFieldLabel>
        </TextField>
      </div>
      <div class="w-full flex flex-row items-center justify-between">
        <div></div>
        <div>
          <Button
            class="flex flex-row items-center justify-center gap-2"
            onClick={async () => {
              await createPlan();
            }}
          >
            <Switch
              fallback={
                <>
                  <Plus class="size-4" />
                  <span>Create</span>
                </>
              }
            >
              <Match when={isCreating.pending}>
                <Loader2 class="size-4 animate-spin" />
                <span>Creating</span>
              </Match>
            </Switch>
          </Button>
        </div>
      </div>
    </div>
  );
};
