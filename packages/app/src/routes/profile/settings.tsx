import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField, TextFieldInput, TextFieldLabel } from "@/components/ui/textfield";
import { getWorkspaces } from "@/lib/api/workspaces";
import { getAuthenticatedUser } from "@/lib/auth/util";
import { As } from "@kobalte/core";
import { A, createAsync, useLocation, useSubmission, useAction } from "@solidjs/router";
import { BellRing, HandCoins, Layout, MessagesSquare, Receipt, Trash, User } from "lucide-solid";
import { For, Match, Show, Switch, createSignal, onMount } from "solid-js";
import { Alert } from "../../components/ui/alert";
import { disconnectFromWorkspace, saveUser, deleteWorkspace } from "../../utils/api/actions";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "../../components/ui/card";
dayjs.extend(relativeTime);

export default function ProfileSettingsPage() {
  const lo = useLocation();
  const [tab, seTab] = createSignal("account");

  const user = createAsync(() => getAuthenticatedUser());
  const workspaces = createAsync(() => getWorkspaces());
  const [name, setName] = createSignal("");

  const isSaving = useSubmission(saveUser);
  const isDisconnecting = useSubmission(disconnectFromWorkspace);
  const removeWorkspace = useAction(deleteWorkspace);
  const isDeleting = useSubmission(deleteWorkspace);

  const confirmDelete = () => {
    if (confirm("Are you sure you want to delete this workspace?")) {
      return true;
    }
    return false;
  };

  const handleDelete = async (id: string) => {
    if (!confirmDelete()) {
      return;
    }
    await removeWorkspace(id);
  };

  onMount(() => {
    const t = lo.hash.replace("#", "");
    if (t) {
      seTab(t);
    }
    const u = user();
    if (u) {
      setName(u.username);
    }
  });

  return (
    <div class="flex flex-col items-start h-full w-full py-10 gap-8">
      <div class="flex flex-col gap-1">
        <Badge variant="secondary" class="w-max">
          Profile
        </Badge>
        <h1 class="text-3xl font-medium">Settings</h1>
      </div>
      <div class="flex flex-col items-start gap-2 w-full">
        <Tabs
          value={tab()}
          onChange={(t) => {
            seTab(t);
            // set hash with `lo`
            location.hash = t;
          }}
          class="w-full py-0"
          orientation="vertical"
        >
          <TabsList class="w-max h-full">
            <TabsTrigger class="border-b-0 border-r-2 items-center justify-start gap-2" value="account">
              <User class="w-4 h-4" />
              Account
            </TabsTrigger>
            <TabsTrigger class="border-b-0 border-r-2 items-center justify-start gap-2" value="workspaces">
              <Layout class="w-4 h-4" />
              Workspaces
            </TabsTrigger>
            <TabsTrigger class="border-b-0 border-r-2 items-center justify-start gap-2" value="billing">
              <HandCoins class="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger class="border-b-0 border-r-2 items-center justify-start gap-2" value="notifications">
              <BellRing class="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger class="border-b-0 border-r-2 items-center justify-start gap-2" value="messages">
              <MessagesSquare class="w-4 h-4" />
              Messages
            </TabsTrigger>
          </TabsList>
          <TabsContent class="px-4 py-0 mt-0 flex flex-col w-full gap-8" value="account">
            <span class="text-muted-foreground text-xs">Make changes to your account here.</span>
            <div class="flex flex-col items-start gap-2 w-full">
              <span class="text-lg font-semibold">Account</span>
              <form class="flex flex-col gap-4 items-start w-full py-4" action={saveUser} method="post">
                <TextField class="w-max flex flex-col gap-2" name="name" disabled={isSaving.pending}>
                  <TextFieldLabel class="flex flex-col gap-2">
                    User
                    <TextFieldInput
                      placeholder="Username"
                      class="w-max min-w-[600px] max-w-[600px]"
                      value={name()}
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      disabled={isSaving.pending}
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
                  disabled={isSaving.pending}
                >
                  <span>Save</span>
                </Button>
                <Show when={typeof isSaving.result !== "undefined" && !isSaving.result}>
                  <Alert class="flex flex-col items-start gap-2 w-full bg-error">
                    There was an error saving your changes.
                  </Alert>
                </Show>
              </form>
            </div>
          </TabsContent>
          <TabsContent class="px-4 py-0 mt-0 w-full flex flex-col gap-8" value="workspaces">
            <span class="text-muted-foreground text-xs">Set up your workspaces here.</span>
            <Switch>
              <Match when={!workspaces()}>
                <div>Loading...</div>
              </Match>
              <Match when={workspaces()}>
                {(ws) => (
                  <Switch>
                    <Match when={ws().length === 0}>
                      <Alert class="flex flex-col items-start gap-2 w-full bg-muted">
                        <span class="text-lg font-semibold">No workspaces</span>
                        <span class="text-sm text-muted-foreground">Create a new workspace</span>
                        <Button variant="default" size="sm" type="submit" class="w-max" asChild>
                          <As component={A} href="/workspaces/new">
                            <span>Create workspace</span>
                          </As>
                        </Button>
                      </Alert>
                    </Match>
                    <Match when={ws().length > 0}>
                      <div class="flex flex-col items-start gap-8 w-full">
                        <div class="flex flex-col items-start gap-2 w-full">
                          <span class="text-lg font-semibold">Workspaces</span>
                          <span class="text-sm text-muted-foreground">Manage your workspaces</span>
                        </div>
                        <div class="gap-2 w-full grid grid-cols-2">
                          <For each={ws()}>
                            {(workspace) => {
                              return (
                                <Card>
                                  <CardHeader class="w-full">
                                    <div class="flex flex-row items-center gap-2 w-full">
                                      <span class="w-full">{workspace.name}</span>
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        type="button"
                                        aria-label={`Delete workspace '${workspace.name}'`}
                                        disabled={isDeleting.pending}
                                        onClick={() => handleDelete(workspace.id)}
                                      >
                                        <Trash class="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <CardDescription>
                                      <span>Created {dayjs(workspace.createdAt).fromNow()}</span>
                                      <span>{workspace.users.length} Users</span>
                                    </CardDescription>
                                  </CardContent>
                                  <CardFooter>
                                    <div class="w-full"></div>
                                    <div class="w-max flex items-center justify-end gap-2">
                                      <Button variant="outline" size="sm" type="submit" class="w-max" asChild>
                                        <As component={A} href={`/dashboard/workspaces/${workspace.id}`}>
                                          <span>Manage</span>
                                        </As>
                                      </Button>
                                      <form
                                        class="flex flex-col gap-2 items-end w-full py-0"
                                        action={disconnectFromWorkspace}
                                        method="post"
                                      >
                                        <input type="hidden" name="workspaceId" value={workspace.id} />
                                        <Button
                                          variant="secondary"
                                          size="sm"
                                          type="submit"
                                          class="w-max"
                                          aria-label="Disconnect from workspace"
                                          disabled={isDisconnecting.pending}
                                        >
                                          <span>Disconnect from Workspace</span>
                                        </Button>
                                        <Show
                                          when={
                                            typeof isDisconnecting.result !== "undefined" && !isDisconnecting.result
                                          }
                                        >
                                          <Alert class="flex flex-col items-start gap-2 w-full bg-error">
                                            There was an error disconnecting from the workspace.
                                          </Alert>
                                        </Show>
                                      </form>
                                    </div>
                                  </CardFooter>
                                </Card>
                              );
                            }}
                          </For>
                        </div>
                      </div>
                    </Match>
                  </Switch>
                )}
              </Match>
            </Switch>
          </TabsContent>
          <TabsContent class="px-4 py-0 mt-0 w-full flex flex-col gap-8" value="billing">
            <span class="text-muted-foreground text-xs">Manage your billing here.</span>
            <div class="flex flex-col items-start gap-2 w-full">
              <span class="text-lg font-semibold">Billing</span>
              <span class="text-sm text-muted-foreground">Manage your billing</span>
            </div>
          </TabsContent>
          <TabsContent class="px-4 py-0 mt-0 w-full flex flex-col gap-8" value="notifications">
            <span class="text-muted-foreground text-xs">Manage your notifications here.</span>
            <div class="flex flex-col items-start gap-2 w-full">
              <span class="text-lg font-semibold">Notifications</span>
              <span class="text-sm text-muted-foreground">Manage your notifications</span>
            </div>
          </TabsContent>
          <TabsContent class="px-4 py-0 mt-0 w-full flex flex-col gap-8" value="messages">
            <span class="text-muted-foreground text-xs">Manage your messages here.</span>
            <div class="flex flex-col items-start gap-2 w-full">
              <span class="text-lg font-semibold">Messages</span>
              <span class="text-sm text-muted-foreground">Manage your messages</span>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}