import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField, TextFieldInput, TextFieldLabel } from "@/components/ui/textfield";
import { getAuthenticatedUser } from "@/lib/auth/util";
import { saveUser } from "@/utils/api/actions";
import { createAsync, useSubmission } from "@solidjs/router";
import { Show, createSignal, onMount } from "solid-js";

export const Account = () => {
  const user = createAsync(() => getAuthenticatedUser());
  const [name, setName] = createSignal("");
  const isSavingUser = useSubmission(saveUser);
  onMount(() => {
    const u = user();
    if (u) setName(u.username);
  });
  return (
    <div class="flex flex-col items-start gap-2 w-full">
      <span class="text-lg font-semibold">Account</span>
      <form class="flex flex-col gap-4 items-start w-full py-4" action={saveUser} method="post">
        <TextField
          class="w-max flex flex-col gap-2"
          name="name"
          disabled={isSavingUser.pending}
          value={name()}
          onChange={(v) => {
            setName(v);
          }}
        >
          <TextFieldLabel class="flex flex-col gap-2">
            User
            <TextFieldInput
              placeholder="Username"
              class="w-max min-w-[600px] max-w-[600px]"
              disabled={isSavingUser.pending}
            />
          </TextFieldLabel>
        </TextField>
        <TextField class="w-max flex flex-col gap-2" value={user()?.email}>
          <TextFieldLabel class="flex flex-col gap-2">
            Email
            <TextFieldInput
              id="email"
              placeholder="Email"
              type="email"
              autoCapitalize="none"
              autocomplete="email"
              autocorrect="off"
              class="w-max min-w-[600px] max-w-[600px]"
              // onChange={(e) => {
              //   setEmail(e.target.value);
              // }}
              disabled
              readOnly
            />
          </TextFieldLabel>
        </TextField>
        <Button
          variant="default"
          size="sm"
          type="submit"
          class="w-max"
          aria-label="Save changes"
          disabled={isSavingUser.pending}
        >
          <span>Save</span>
        </Button>
        <Show when={typeof isSavingUser.result !== "undefined" && !isSavingUser.result}>
          <Alert class="flex flex-col items-start gap-2 w-full bg-error">There was an error saving your changes.</Alert>
        </Show>
      </form>
    </div>
  );
};
