import { Queries } from "@/utils/api/queries";
import {
  SubmitHandler,
  createForm,
  getValue,
  getValues,
  insert,
  remove,
  required,
  setValue,
} from "@modular-forms/solid";
import { createQuery } from "@tanstack/solid-query";
import { Minus, Plus } from "lucide-solid";
import { For } from "solid-js";
import { z } from "zod";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const InvitationsFormSchema = z.object({
  id: z.string(),
  attendees: z.array(
    z.object({
      attendee: z.string(),
    }),
  ),
  reminders: z.array(
    z.object({
      date: z.string(),
    }),
  ),
  notes: z.array(z.string()).optional(),
});

export default function Invitations(props: {
  id: string;
  onSubmit: SubmitHandler<z.infer<typeof InvitationsFormSchema>>;
}) {
  const [createEventForm, { Form, Field, FieldArray }] = createForm<z.infer<typeof InvitationsFormSchema>>({
    initialValues: {
      attendees: [],
      id: props.id,
    },
  });

  const attendees = createQuery(() => ({
    queryKey: ["attendees"],
    queryFn: async () => {
      return Queries.Attendees.all();
    },
  }));

  const isDisabledAttendee = (attendee: string) => {
    return getValues(createEventForm).attendees?.some((a) => a?.attendee === attendee);
  };

  const getAttendees = (): { label: string; value: string; disabled: boolean }[] => {
    if (!attendees.isSuccess) {
      return [];
    }
    return attendees.data.map((attendee) => ({
      label: attendee.name,
      value: attendee.id,
      disabled: isDisabledAttendee(attendee.id) ?? false,
    }));
  };

  return (
    <div class="flex flex-row gap-8 py-4 w-full">
      <Form onSubmit={props.onSubmit} class="flex flex-col gap-4 lg:max-w-[600px] w-full">
        <div class="flex flex-col items-start justify-between gap-2 w-full">
          <div class="flex flex-row items-center justify-between gap-2 w-full">
            <span class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Invitations
            </span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => insert(createEventForm, "attendees", { value: { attendee: "" } })}
              aria-label="Add Attendee"
            >
              <Plus class="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div class="flex flex-col items-start justify-between gap-2 w-full">
          <FieldArray name="attendees">
            {(fieldArray) => (
              <For each={fieldArray.items}>
                {(_, index) => (
                  <div class="flex flex-row items-center justify-between gap-2 w-full">
                    <Field name={`${fieldArray.name}.${index()}.attendee`} validate={required("Attendee is required")}>
                      {(field, props) => (
                        <Select
                          optionValue="value"
                          optionTextValue="label"
                          options={getAttendees()}
                          placeholder="Select an attendee"
                          optionDisabled="disabled"
                          itemComponent={(props) => (
                            <SelectItem item={props.item}>{props.item.rawValue.label}</SelectItem>
                          )}
                          value={getAttendees().find(
                            (attendee) =>
                              attendee.value === getValue(createEventForm, `${fieldArray.name}.${index()}.attendee`),
                          )}
                          onChange={(value) => {
                            if (!value) {
                              return;
                            }
                            setValue(createEventForm, `${fieldArray.name}.${index()}.attendee`, value.value);
                          }}
                          class="w-full"
                        >
                          <SelectTrigger class="w-full">
                            <SelectValue<ReturnType<typeof getAttendees>[number]>>
                              {(state) => state.selectedOption().label}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent />
                        </Select>
                      )}
                    </Field>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        remove(createEventForm, fieldArray.name, {
                          at: index(),
                        })
                      }
                      aria-label="Remove Attendee"
                      size="icon"
                    >
                      <Minus class="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </For>
            )}
          </FieldArray>
        </div>
        <Button type="submit" aria-label="Create Event">
          Create Event
        </Button>
      </Form>
    </div>
  );
}
