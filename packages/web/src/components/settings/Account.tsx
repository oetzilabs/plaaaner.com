import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField, TextFieldInput, TextFieldLabel } from "@/components/ui/textfield";
import { getLocale, changeLocaleCookie } from "@/lib/api/locale";
import { saveUser } from "@/lib/api/user";
import type { UserSession } from "@/lib/auth/util";
import { createAsync, useAction, useSubmission } from "@solidjs/router";
import { CheckCheck, Loader2 } from "lucide-solid";
import { Match, Show, Suspense, Switch } from "solid-js";
import { NotLoggedIn } from "../NotLoggedIn";
import { Combobox, ComboboxItem, ComboboxTrigger, ComboboxContent, ComboboxInput } from "@/components/ui/combobox";
import { createFilter } from "@kobalte/core";
import { createSignal } from "solid-js";

export const Account = (props: { session: UserSession }) => {
  const isSavingUser = useSubmission(saveUser);

  const locale = createAsync(() => getLocale());
  const setLocale = useAction(changeLocaleCookie);
  const isSettingLocale = useSubmission(changeLocaleCookie);
  const locales = ["en-US", "de-DE"];

  const filter = createFilter({ sensitivity: "base" });
  const [options, setOptions] = createSignal(locales);
  const onInputChange = (value: string) => {
    setOptions(locales.filter((option) => filter.contains(option, value)));
  };

  return (
    <Show when={props.session} fallback={<NotLoggedIn />}>
      {(s) => (
        <div class="flex flex-col items-start gap-8 w-full">
          <div class="flex flex-col items-start gap-4 w-full">
            <span class="text-lg font-semibold">Account</span>
            <span class="text-muted-foreground text-xs">Make changes to your account here.</span>
          </div>
          <form class="flex flex-col gap-4 items-start w-full py-4" action={saveUser} method="post">
            <Show when={props.session.user}>
              {(u) => (
                <>
                  <TextField
                    class="w-max flex flex-col gap-2"
                    name="name"
                    disabled={isSavingUser.pending}
                    defaultValue={u().name}
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
                <Match
                  when={!isSavingUser.pending && !(isSavingUser.result instanceof Error) && isSavingUser.result?.id}
                >
                  <span>Saved</span>
                  <CheckCheck class="size-4" />
                </Match>
              </Switch>
            </Button>
            <Show when={typeof isSavingUser.result !== "undefined" && !isSavingUser.result}>
              <Alert class="flex flex-col items-start gap-2 w-full bg-error">
                There was an error saving your changes.
              </Alert>
            </Show>
          </form>
          <Suspense fallback={"Loading..."}>
            <Show when={locale()}>
              {(l) => (
                <div class="flex flex-col gap-4 w-full">
                  <div class="flex flex-row gap-4 items-center p-2">
                    <span class="font-bold text-lg">Language (Region)</span>
                    <Show when={isSettingLocale.pending}>
                      <span class="text-sm text-muted-foreground">Saving</span>
                      <Loader2 class="animate-spin size-4" />
                    </Show>
                  </div>
                  <Combobox
                    defaultValue={l().language}
                    options={options()}
                    placeholder="Choose a Language"
                    disabled={isSettingLocale.pending}
                    onChange={async (v) => {
                      if (!v) return;
                      await setLocale(v);
                    }}
                    itemComponent={(props) => <ComboboxItem item={props.item}>{props.item.rawValue}</ComboboxItem>}
                    class="w-max"
                    disallowEmptySelection
                  >
                    <ComboboxTrigger>
                      <ComboboxInput />
                    </ComboboxTrigger>
                    <ComboboxContent />
                  </Combobox>
                </div>
              )}
            </Show>
          </Suspense>
        </div>
      )}
    </Show>
  );
};
