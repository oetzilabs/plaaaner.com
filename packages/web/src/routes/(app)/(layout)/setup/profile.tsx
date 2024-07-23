import { Button } from "@/components/ui/button";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { getProfile, updateProfile } from "@/lib/api/profile";
import { createAsync, useSubmission } from "@solidjs/router";
import { Show } from "solid-js";

export default function SetupProfilePage() {
  const profile = createAsync(() => getProfile());
  const isUpdating = useSubmission(updateProfile);

  return (
    <div class="flex flex-col gap-2 w-full py-10">
      <form class="flex flex-col gap-2 w-full" method="post" action={updateProfile}>
        <Show when={profile() !== undefined && profile()}>
          {(p) => (
            <TextFieldRoot name="name" disabled={isUpdating.pending} defaultValue={p().name}>
              <TextFieldLabel class="flex flex-col gap-2">
                Profile Name
                <TextField placeholder="Profile Name" />
              </TextFieldLabel>
            </TextFieldRoot>
          )}
        </Show>
        <Button disabled={isUpdating.pending} class="font-bold" type="submit">
          Save & Continue
        </Button>
      </form>
    </div>
  );
}
