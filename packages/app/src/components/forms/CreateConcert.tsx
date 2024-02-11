import { As } from "@kobalte/core";
import { createForm, setValue, SubmitHandler, zodForm } from "@modular-forms/solid";
import { A } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { ArrowLeft, Plus } from "lucide-solid";
import { For, Match, Show, Switch } from "solid-js";
import { z } from "zod";
import { Queries } from "../../utils/api/queries";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { TextField, TextFieldErrorMessage, TextFieldInput, TextFieldLabel } from "../ui/textfield";
import { CreateConcertFormSchema } from "../../utils/schemas/concert";
import dayjs from "dayjs";

export default function CreateConcertForm() {
  const [createEventForm, { Form, Field }] = createForm<z.infer<typeof CreateConcertFormSchema>>({
    initialValues: {},
    validateOn: "blur",
    validate: zodForm(CreateConcertFormSchema),
  });

  const previousConcerts = createQuery(() => ({
    queryKey: ["previousConcerts"],
    queryFn: async () => {
      return Queries.Concerts.all();
    },
  }));

  const suggestNewNames = (name: string) => {
    if (!previousConcerts.isSuccess) {
      return [];
    }
    const lastCounter = previousConcerts.data.reduce((acc, project) => {
      if (project.name.startsWith(name)) {
        const counter = +project.name.replace(name, "");
        if (!isNaN(counter)) {
          return Math.max(acc, counter);
        }
      }
      return acc;
    }, 0);
    const suggestions = [];
    for (let i = 1; i < 4; i++) {
      suggestions.push(`${name}-${lastCounter + i}`);
    }
    return suggestions;
  };

  const isSubmissionDisabled = () => {
    return createEventForm.invalid || !createEventForm.touched;
  };

  const handleSubmit: SubmitHandler<z.infer<typeof CreateConcertFormSchema>> = async (data) => {
    console.log("submitted", data);
  };

  return (
    <div class="flex flex-col gap-4 lg:max-w-[600px] w-full">
      <Card class="min-w-full max-w-[500px] w-full">
        <CardHeader class="text-lg font-semibold w-full">Create Concert</CardHeader>
        <CardContent class="w-[500px]">
          <div class="flex flex-row gap-8 py-4 w-full">
            <Form onSubmit={handleSubmit} class="flex flex-col gap-4 lg:max-w-[600px] w-full">
              <div class="flex flex-col items-start gap-2 w-full">
                <Field name="name">
                  {(field, props) => (
                    <TextField {...field} class="w-full flex flex-col gap-2" aria-label="Event Name">
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        What is the name of the Concert?
                      </TextFieldLabel>
                      <TextFieldInput {...props} />
                      <Show when={(field.value ?? "").length >= 3 && field.value}>
                        {(v) => (
                          <Switch>
                            <Match when={suggestNewNames(v())}>
                              {(data) => (
                                <div class="grid grid-cols-3 gap-2">
                                  <For
                                    each={data()}
                                    fallback={
                                      <div class="col-span-full">
                                        <span class="text-sm font-medium leading-none text-emerald-500">
                                          Lucky you, the name is available!
                                        </span>
                                      </div>
                                    }
                                  >
                                    {(suggestion) => <Badge variant="outline">{suggestion}</Badge>}
                                  </For>
                                </div>
                              )}
                            </Match>
                          </Switch>
                        )}
                      </Show>
                      <TextFieldErrorMessage class="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-red-500 text-sm font-medium leading-none">
                        {field.error}
                      </TextFieldErrorMessage>
                    </TextField>
                  )}
                </Field>
                <Field name="description">
                  {(field, props) => (
                    <TextField {...field} class="w-full flex flex-col gap-2" aria-label="Event Description">
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        What is the Concert about?
                      </TextFieldLabel>
                      <TextFieldInput {...props} />
                      <TextFieldErrorMessage class="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-red-500 text-sm font-medium leading-none">
                        {field.error}
                      </TextFieldErrorMessage>
                    </TextField>
                  )}
                </Field>
                <Field name="date" type="Date">
                  {(field, props) => (
                    <TextField
                      class="w-full"
                      aria-label="Date"
                      onChange={(value) => {
                        setValue(createEventForm, "date", dayjs(value).toDate());
                      }}
                      defaultValue={
                        field.value ? dayjs(field.value).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
                      }
                    >
                      <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Date
                      </TextFieldLabel>
                      <TextFieldInput {...props} type="date" required />
                    </TextField>
                  )}
                </Field>
              </div>
              <div class="flex flex-row items-center justify-between gap-2 w-full">
                <div></div>
                <div>
                  <Button
                    type="submit"
                    aria-label="Create Event"
                    class="flex flex-row items-center justify-between gap-2"
                    disabled={isSubmissionDisabled()}
                  >
                    Create Concert
                    <Plus class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
