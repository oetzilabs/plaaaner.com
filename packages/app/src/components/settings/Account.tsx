import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { As } from "@kobalte/core";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TextField, TextFieldInput, TextFieldLabel } from "@/components/ui/textfield";
import { getAuthenticatedUser } from "@/lib/auth/util";
import { saveUser, disableUser } from "@/utils/api/actions";
import { createAsync, useAction, useSubmission } from "@solidjs/router";
import { AlertTriangleIcon, CheckCheck, Loader2 } from "lucide-solid";
import { Show, Match, Switch } from "solid-js";
import { Separator } from "@/components/ui/separator";
import { toast } from "solid-sonner";

export const Account = () => {
  const user = createAsync(() => getAuthenticatedUser());
  const isSavingUser = useSubmission(saveUser);
  const isDisablingUser = useSubmission(disableUser);
  const disableUserAction = useAction(disableUser);

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
      <Separator />
      <div class="flex flex-col gap-2 w-full">
        <span class="text-lg font-semibold">Disable Account</span>
        <div class="bg-red-100 dark:bg-red-900/50 w-full p-4 rounded-md border border-red-300 dark:border-red-700 flex flex-col gap-4">
          <div class="flex flex-row gap-2">
            <AlertTriangleIcon class="size-4" />
            <div class="flex flex-col gap-0.5">
              <span class="text-red-500 dark:text-white text-sm">We understand. </span>
              <span class="text-red-500 dark:text-white text-sm">
                You can disable your account and come back later if you change your mind. We appreciate you giving
                Plaaaner a try.
              </span>
            </div>
          </div>
          <div class="flex flex-row gap-2 w-full items-center justify-between">
            <div class="flex flex-row gap-2 w-full"></div>
            <div class="w-max">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <As
                    component={Button}
                    variant="destructive"
                    size="sm"
                    type="submit"
                    class="w-max"
                    disabled={isDisablingUser.pending}
                  >
                    <Switch fallback={<span>Disable Account</span>}>
                      <Match when={isDisablingUser.pending}>
                        <span>Disabling Account</span>
                        <Loader2 class="size-4 animate-spin" />
                      </Match>
                    </Switch>
                  </As>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you really sure, you want to disable your account?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogClose>Cancel</AlertDialogClose>
                    <AlertDialogAction
                      asChild
                      onClick={() => {
                        toast.promise(disableUserAction, {
                          loading: "Hold on a second, we're disabling your account",
                          icon: <Loader2 class="size-4 animate-spin" />,
                          error: "There was an error disabling your Account",
                          success: "Account has been disabled, redirecting to home page!",
                        });
                      }}
                    >
                      <As component={Button} variant="destructive">
                        Continue
                      </As>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
