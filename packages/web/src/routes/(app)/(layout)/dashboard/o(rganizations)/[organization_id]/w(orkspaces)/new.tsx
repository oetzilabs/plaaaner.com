import { useSession } from "@/components/SessionProvider";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, CheckboxControl, CheckboxLabel } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { createWorkspace } from "@/lib/api/workspaces";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { revalidate, useAction, useParams, useSubmission } from "@solidjs/router";
import { Layout, Receipt, User } from "lucide-solid";
import { createSignal, Show } from "solid-js";

export default function NewWorkspace() {
  const session = useSession();
  const { organization_id } = useParams();

  const workspaceCreator = useAction(createWorkspace);
  const isCreatingWorkspace = useSubmission(createWorkspace);

  const [newWorkspace, setNewWorkspace] = createSignal<Parameters<typeof createWorkspace>[0]>({
    name: "",
    connect: session?.()?.workspace?.id === null,
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const nW = newWorkspace();
    await workspaceCreator(nW, organization_id);
    await revalidate(getAuthenticatedSession.key);
  };

  return (
    <div class="flex flex-col items-start h-full w-full p-4 gap-8">
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
                <TextFieldRoot
                  class="w-max flex flex-col gap-2"
                  name="name"
                  disabled={isCreatingWorkspace.pending}
                  value={newWorkspace().name}
                  onChange={(value) => {
                    setNewWorkspace({ ...newWorkspace(), name: value });
                  }}
                >
                  <TextFieldLabel class="flex flex-col gap-2">
                    Workspace Name
                    <TextField
                      placeholder="Username"
                      class="w-max min-w-[600px] max-w-[600px]"
                      disabled={isCreatingWorkspace.pending}
                    />
                  </TextFieldLabel>
                </TextFieldRoot>
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
