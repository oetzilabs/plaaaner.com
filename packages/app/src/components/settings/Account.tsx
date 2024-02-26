import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField, TextFieldInput, TextFieldLabel } from "@/components/ui/textfield";
import { saveUser } from "@/lib/api/user";
import { getAuthenticatedUser } from "@/lib/auth/util";
import { createAsync, useSubmission } from "@solidjs/router";
import { CheckCheck, Loader2 } from "lucide-solid";
import { Match, Show, Switch } from "solid-js";

export const Account = () => {
  const user = createAsync(() => getAuthenticatedUser());
  const isSavingUser = useSubmission(saveUser);

  return (
    <div class="flex flex-col items-start gap-8 w-full">
      <div class="flex flex-col items-start gap-2 w-full">
        <span class="text-lg font-semibold">Account</span>
        <span class="text-muted-foreground text-xs">Make changes to your account here.</span>
      </div>
      <form class="flex flex-col gap-4 items-start w-full py-4" action={saveUser} method="post">
        <Show when={user() !== undefined && user()}>
          {(u) => (
            <>
              <TextField
                class="w-max flex flex-col gap-2"
                name="name"
                disabled={isSavingUser.pending}
                defaultValue={u().username}
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
              <TextField class="w-max flex flex-col gap-2" defaultValue={u().email}>
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
                    disabled
                    readOnly
                  />
                </TextFieldLabel>
              </TextField>
            </>
          )}
        </Show>
        <Button
          variant="default"
          size="sm"
          type="submit"
          class="w-max gap-2"
          aria-label="Save changes"
          disabled={isSavingUser.pending}
        >
          <Switch fallback={<span>Save</span>}>
            <Match when={isSavingUser.pending}>
              <span>Saving</span>
              <Loader2 class="size-4 animate-spin" />
            </Match>
            <Match when={!isSavingUser.pending && !(isSavingUser.result instanceof Error) && isSavingUser.result?.id}>
              <span>Saved</span>
              <CheckCheck class="size-4" />
            </Match>
          </Switch>
        </Button>
        <Show when={typeof isSavingUser.result !== "undefined" && !isSavingUser.result}>
          <Alert class="flex flex-col items-start gap-2 w-full bg-error">There was an error saving your changes.</Alert>
        </Show>
      </form>
    </div>
  );
};
