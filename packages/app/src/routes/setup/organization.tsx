import { Button } from "@/components/ui/button";
import { TextField, TextFieldLabel, TextFieldInput } from "@/components/ui/textfield";
import { useSubmission } from "@solidjs/router";
import { createOrganization } from "../../lib/api/organizations";

export default function SetupOrganizationPage() {
  const isCreating = useSubmission(createOrganization);
  return (
    <div class="flex flex-col gap-2 w-full py-10">
      <form class="flex flex-col gap-2 w-full" method="post" action={createOrganization}>
        <TextField name="name" disabled={isCreating.pending}>
          <TextFieldLabel class="flex flex-col gap-2">
            Organization Name
            <TextFieldInput placeholder="Organization Name" />
          </TextFieldLabel>
        </TextField>
        <Button disabled={isCreating.pending} class="font-bold" type="submit">
          Create Organization
        </Button>
      </form>
    </div>
  );
}
