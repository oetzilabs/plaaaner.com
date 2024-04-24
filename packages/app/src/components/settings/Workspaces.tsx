import { Button, buttonVariants } from "@/components/ui/button";
import { getAuthenticatedSession, getAuthenticatedUser } from "@/lib/auth/util";
import type { UserSession } from "@/lib/auth/util";
import { deleteWorkspace, disconnectFromWorkspace, connectToWorkspace } from "@/lib/api/workspaces";
import { A, createAsync, revalidate, useAction, useSubmission } from "@solidjs/router";
import { For, Show, Suspense } from "solid-js";
import { getWorkspaces } from "../../lib/api/workspaces";
import { Badge } from "../ui/badge";
import { Plus, Trash } from "lucide-solid";
import { As } from "@kobalte/core";
import dayjs from "dayjs";
import { Alert } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { NotLoggedIn } from "../NotLoggedIn";

export const Workspaces = (props: { session: UserSession }) => {
  const user = createAsync(() => getAuthenticatedUser());
  const workspaces = createAsync(() => getWorkspaces());

  const disconnectFromWorkspaceAction = useAction(disconnectFromWorkspace);
  const isDisconnectingFromWorkspace = useSubmission(disconnectFromWorkspace);
  const isDeletingWorkspace = useSubmission(deleteWorkspace);
  const removeWorkspace = useAction(deleteWorkspace);

  const connectToWorkspaceAction = useAction(connectToWorkspace);
  const isConnectingToWorkspace = useSubmission(connectToWorkspace);

  const handleWorkspaceDeletion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workspace?")) {
      return;
    }
    await removeWorkspace(id);
    await revalidate(getAuthenticatedSession.key);
  };

  return (
    <Show when={props.session} fallback={<NotLoggedIn />}>
      {(s) => (
        <div class="flex flex-col items-start gap-8 w-full">
          <div class="flex flex-col items-start gap-4 w-full">
            <div class="flex flex-row items-center justify-between w-full gap-2">
              <div class="w-full">
                <span class="text-lg font-semibold">Workspaces</span>
              </div>
              <div class="w-max">
                <A
                  href="/organizations/new"
                  class={cn(
                    buttonVariants({
                      variant: "default",
                      size: "sm",
                    }),
                    "w-max gap-2 items-center"
                  )}
                >
                  <Plus class="size-4" />
                  Create Workspaces
                </A>
              </div>
            </div>
            <span class="text-sm text-muted-foreground">Manage your workspaces</span>
          </div>
          <div class="gap-4 w-full flex flex-col">
            <Suspense fallback={<For each={[0, 1]}>{() => <Skeleton class="w-full h-48" />}</For>}>
              <For
                each={workspaces()}
                fallback={
                  <Alert class="flex flex-col items-start gap-2 w-full bg-muted">
                    <span class="text-lg font-semibold">No workspaces</span>
                    <span class="text-sm text-muted-foreground">Create a new workspace</span>
                    <Button variant="default" size="sm" type="submit" class="w-max" asChild>
                      <As component={A} href="/dashboard/w/new">
                        <span>Create workspace</span>
                      </As>
                    </Button>
                  </Alert>
                }
              >
                {(workspace) => {
                  return (
                    <div class="rounded-md border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col w-full gap-4">
                      <div class="flex flex-row items-center gap-2 w-full">
                        <div class="w-full flex flex-row gap-2 items-center">
                          <span class="font-bold">{workspace.name}</span>
                          <Show when={workspace.owner && workspace.owner_id === user()?.id}>
                            <Badge variant="default">Owner: {workspace.owner?.name}</Badge>
                          </Show>
                          <Show when={workspace.id === s().workspace?.id}>
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
                      <div class="w-full rounded-md border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-4 text-sm">
                        <span>Created {dayjs(workspace.createdAt).fromNow()}</span>
                        <div class="flex flex-row items-start justify-start gap-1 text-xs">
                          <For
                            each={workspace.users}
                            fallback={
                              <span class="text-muted-foreground">No users are connected to this workspace.</span>
                            }
                          >
                            {(u) => <span class="text-muted-foreground">{u.user.name}</span>}
                          </For>
                        </div>
                      </div>
                      <div class="w-full flex items-center justify-between gap-2">
                        <div class="w-full"></div>
                        <div class="w-max flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" type="submit" class="w-max" asChild>
                            <As component={A} href={`/dashboard/w/${workspace.id}`}>
                              <span>Manage</span>
                            </As>
                          </Button>
                          <div class="flex flex-col gap-2 items-end w-full py-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              type="submit"
                              class="w-max"
                              aria-label="Connect to Workspace"
                              disabled={isConnectingToWorkspace.pending || workspace.id === s().workspace?.id}
                              onClick={async () => {
                                await connectToWorkspaceAction(workspace.id);
                                await revalidate(getAuthenticatedSession.key);
                              }}
                            >
                              <span>Connect</span>
                            </Button>
                          </div>
                          <div class="flex flex-col gap-2 items-end w-full py-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              type="submit"
                              class="w-max"
                              aria-label="Disconnect from workspace"
                              disabled={isDisconnectingFromWorkspace.pending}
                              onClick={async () => {
                                await disconnectFromWorkspaceAction(workspace.id);
                                await revalidate(getAuthenticatedSession.key);
                              }}
                            >
                              <span>Disconnect</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </Suspense>
            <div class="flex flex-col items-start gap-2">
              <A
                href="/dashboard/w/new"
                class={cn(
                  "flex flex-row items-center gap-2 justify-center",
                  buttonVariants({
                    variant: "default",
                  })
                )}
              >
                <Plus class="w-4 h-4" />
                Create Workspace
              </A>
            </div>
          </div>
        </div>
      )}
    </Show>
  );
};
