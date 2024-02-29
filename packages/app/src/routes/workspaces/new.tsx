import { useAction, useSubmission } from "@solidjs/router";
import { User, Layout, Receipt } from "lucide-solid";
import { Show, createSignal } from "solid-js";
import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger, TabsContent, Tabs } from "@/components/ui/tabs";
import { TextFieldLabel, TextFieldInput, TextField } from "@/components/ui/textfield";
import { createWorkspace } from "@/lib/api/workspaces";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useSession } from "@/components/SessionProvider";
import { Checkbox, CheckboxControl, CheckboxLabel } from "@/components/ui/checkbox";

export default function NewWorkspace() {
  const session = useSession();

  const cW = useAction(createWorkspace);
  const isCreatingWorkspace = useSubmission(createWorkspace);

  const [newWorkspace, setNewWorkspace] = createSignal<Parameters<typeof createWorkspace>[0]>({
    name: "",
    connect: session?.()?.workspace_id === null,
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const nW = newWorkspace();
    await cW(nW);
  };

  return (
    <div class="flex flex-col items-start h-full w-full py-10 gap-8">
      <div class="flex flex-col gap-2">
        <Badge variant="secondary" class="w-max">
          Workspaces
        </Badge>
        <h1 class="text-3xl font-medium">Create a New Workspace</h1>
      </div>
      <div class="flex flex-col items-start gap-2 w-full">
        <form class="flex flex-col gap-4 items-start w-full py-4" onSubmit={handleSubmit}>
          <Tabs class="w-full" defaultValue="general">
            <TabsList class="w-full">
              <TabsTrigger class="items-center justify-start gap-2" value="general">
                <User class="w-4 h-4" />
                General
              </TabsTrigger>
              <TabsTrigger class="items-center justify-start gap-2" value="invites">
                <Layout class="w-4 h-4" />
                Invites
              </TabsTrigger>
              <TabsTrigger class="items-center justify-start gap-2" value="permissions">
                <Receipt class="w-4 h-4" />
                Permissions
              </TabsTrigger>
            </TabsList>
            <TabsContent class="flex flex-col w-full gap-8" value="general">
              <span class="text-muted-foreground text-xs">Setup your general information about the workspace.</span>
              <div class="flex flex-col items-start gap-2 w-full">
                <span class="text-lg font-semibold">Account</span>
                <TextField class="w-max flex flex-col gap-2" name="name" disabled={isCreatingWorkspace.pending}>
                  <TextFieldLabel class="flex flex-col gap-2">
                    Workspace Name
                    <TextFieldInput
                      placeholder="Username"
                      class="w-max min-w-[600px] max-w-[600px]"
                      value={newWorkspace().name}
                      onChange={(e) => {
                        setNewWorkspace({ ...newWorkspace(), name: e.target.value });
                      }}
                      disabled={isCreatingWorkspace.pending}
                    />
                  </TextFieldLabel>
                </TextField>
                <Checkbox onChange={(b) => setNewWorkspace((nw) => ({ ...nw, connect: b }))} class="flex flex-row">
                  <CheckboxLabel class="text-sm font-bold flex flex-row items-center justify-start gap-2">
                    <CheckboxControl />
                    Connect to Workspace
                  </CheckboxLabel>
                </Checkbox>
                <Show when={typeof isCreatingWorkspace.result !== "undefined" && !isCreatingWorkspace.result}>
                  <Alert class="flex flex-col items-start gap-2 w-full bg-error">
                    There was an error saving your changes.
                  </Alert>
                </Show>
              </div>
            </TabsContent>
            <TabsContent class="w-full flex flex-col gap-8" value="invites"></TabsContent>
            <TabsContent class="w-full flex flex-col gap-8" value="permissions">
              <span class="text-muted-foreground text-xs">Manage your permissions here.</span>
              <div class="flex flex-col items-start gap-2 w-full">
                <span class="text-lg font-semibold">Permissions</span>
                <span class="text-sm text-muted-foreground">Manage your workspace permissions</span>
              </div>
            </TabsContent>
          </Tabs>
          <Button
            variant="default"
            size="sm"
            type="submit"
            class="w-max"
            aria-label="Save changes"
            disabled={isCreatingWorkspace.pending}
          >
            <span>Save</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
