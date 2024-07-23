import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxHiddenSelect,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { createOrganization, getNoneConnectedOrganizations, requestOrganizationJoin } from "@/lib/api/organizations";
import { createAsync, useSubmission } from "@solidjs/router";
import { Show } from "solid-js";

export default function SetupProfilePage() {
  const allOrganizations = createAsync(() => getNoneConnectedOrganizations());
  const isCreatingOrganization = useSubmission(createOrganization);
  const isRequestingInvite = useSubmission(requestOrganizationJoin);

  return (
    <div class="flex flex-col gap-2 w-full p-4">
      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create</TabsTrigger>
          <Show when={allOrganizations() !== undefined && (allOrganizations() ?? []).length > 0}>
            <TabsTrigger value="join" disabled={(allOrganizations() ?? []).length > 0}>
              Join
            </TabsTrigger>
          </Show>
        </TabsList>
        <TabsContent value="create">
          <form class="flex flex-col gap-2 w-full" method="post" action={createOrganization}>
            <TextFieldRoot name="name" disabled={isCreatingOrganization.pending}>
              <TextFieldLabel class="flex flex-col gap-2">
                Organization Name
                <TextField placeholder="Organization Name" />
              </TextFieldLabel>
            </TextFieldRoot>
            <div class="flex flex-row items-center justify-between">
              <div></div>
              <div>
                <Button disabled={isCreatingOrganization.pending} class="font-bold" type="submit">
                  Save & Continue
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="join">
          <form class="flex flex-col gap-2 w-full" method="post" action={requestOrganizationJoin}>
            <Show
              when={
                allOrganizations() !== undefined && allOrganizations()?.map((o) => ({ value: o.id, label: o.name }))
              }
            >
              {(allOrgs) => (
                <Combobox
                  name="organization_id"
                  optionValue="value"
                  optionLabel="label"
                  optionTextValue="label"
                  options={allOrgs()}
                  placeholder="Select an Organization"
                  itemComponent={(props) => <ComboboxItem item={props.item}>{props.item.rawValue.label}</ComboboxItem>}
                  class="w-full"
                >
                  <ComboboxTrigger class="w-full">
                    <ComboboxInput />
                  </ComboboxTrigger>
                  <ComboboxHiddenSelect />
                  <ComboboxContent />
                </Combobox>
              )}
            </Show>
            <div class="flex flex-row items-center justify-between">
              <div></div>
              <div>
                <Button disabled={isRequestingInvite.pending} class="font-bold" type="submit">
                  Request to Join
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
