import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField, TextFieldInput, TextFieldLabel } from "@/components/ui/textfield";
import { getWorkspaces } from "@/lib/api/workspaces";
import { getAuthenticatedSession, getAuthenticatedUser } from "@/lib/auth/util";
import { deleteWorkspace, disconnectFromWorkspace, saveUser, setCurrentWorkspace } from "@/utils/api/actions";
import { As } from "@kobalte/core";
import { A, createAsync, useAction, useLocation, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BellRing, HandCoins, Layout, MessagesSquare, Trash, User } from "lucide-solid";
import { For, Match, Show, Switch, createSignal, onMount } from "solid-js";
import { toast } from "solid-sonner";
dayjs.extend(relativeTime);

export default function ProfileSettingsPage() {
  const lo = useLocation();
  const [tab, seTab] = createSignal("account");

  const user = createAsync(() => getAuthenticatedUser());
  const session = createAsync(() => getAuthenticatedSession());
  const workspaces = createAsync(() => getWorkspaces());

  const [name, setName] = createSignal("");
  const [uId, setUId] = createSignal("");
  const [sessionWorkspaceId, setSessionWorkspaceId] = createSignal("");

  const removeWorkspace = useAction(deleteWorkspace);

  const isSavingUser = useSubmission(saveUser);
  const isDisconnectingFromWorkspace = useSubmission(disconnectFromWorkspace);
  const isSettingCurrentWorkspace = useSubmission(setCurrentWorkspace);
  const isDeletingWorkspace = useSubmission(deleteWorkspace);

  const confirmWorkspaceDeletion = () => {
    if (confirm("Are you sure you want to delete this workspace?")) {
      return true;
    }
    return false;
  };

  const handleWorkspaceDeletion = async (id: string) => {
    if (!confirmWorkspaceDeletion()) {
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
      setUId(u.id);
    }
    const s = session();
    if (s) {
      setSessionWorkspaceId(s.workspace_id);
    } else {
      toast.error("You are not logged in.");
    }
  });

  return (
    <div class="flex flex-col items-start h-full w-full py-10 gap-8">
      <div class="flex flex-col gap-1">
        <div class="flex flex-row gap-2">
          <Badge variant="secondary" class="w-max">
            Profile
          </Badge>
          <Badge variant="outline" class="w-max">
            {sessionWorkspaceId()}
          </Badge>
        </div>
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
                <TextField class="w-max flex flex-col gap-2" name="name" disabled={isSavingUser.pending}>
                  <TextFieldLabel class="flex flex-col gap-2">
                    User
                    <TextFieldInput
                      placeholder="Username"
                      class="w-max min-w-[600px] max-w-[600px]"
                      value={name()}
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
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
                                      <div class="w-full flex flex-row gap-2">
                                        <span>{workspace.name}</span>
                                        <Show when={workspace.owner && workspace.owner_id === uId()}>
                                          <Badge variant="default">Owner: {workspace.owner?.name}</Badge>
                                        </Show>
                                        <Show when={workspace.id === sessionWorkspaceId()}>
                                          <Badge variant="secondary">Current</Badge>
                                        </Show>
                                      </div>
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        type="button"
                                        aria-label={`Delete workspace '${workspace.name}'`}
                                        disabled={isDeletingWorkspace.pending}
                                        onClick={() => handleWorkspaceDeletion(workspace.id)}
                                      >
                                        <Trash class="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <CardDescription class="flex flex-col gap-1">
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
                                        action={setCurrentWorkspace}
                                        method="post"
                                      >
                                        <input type="hidden" name="workspace_id" value={workspace.id} />
                                        <Button
                                          variant="secondary"
                                          size="sm"
                                          type="submit"
                                          class="w-max"
                                          aria-label="Connect to Workspace"
                                          disabled={isSettingCurrentWorkspace.pending}
                                        >
                                          <span>Connect to Workspace</span>
                                        </Button>
                                      </form>
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
                                          disabled={isDisconnectingFromWorkspace.pending}
                                        >
                                          <span>Disconnect from Workspace</span>
                                        </Button>
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
