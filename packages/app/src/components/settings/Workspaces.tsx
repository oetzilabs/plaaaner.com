import { Button } from "@/components/ui/button";
import { getAuthenticatedSession, getAuthenticatedUser } from "@/lib/auth/util";
import { deleteWorkspace, disconnectFromWorkspace, setCurrentWorkspace } from "@/utils/api/actions";
import { A, createAsync, useAction, useSubmission } from "@solidjs/router";
import { For, Show, Suspense } from "solid-js";
import { getWorkspaces } from "../../lib/api/workspaces";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "../ui/card";
import { Trash } from "lucide-solid";
import { As } from "@kobalte/core";
import dayjs from "dayjs";
import { Alert } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";

export const Workspaces = () => {
  const session = createAsync(() => getAuthenticatedSession());
  const user = createAsync(() => getAuthenticatedUser());
  const workspaces = createAsync(() => getWorkspaces());

  const isDisconnectingFromWorkspace = useSubmission(disconnectFromWorkspace);
  const isSettingCurrentWorkspace = useSubmission(setCurrentWorkspace);
  const isDeletingWorkspace = useSubmission(deleteWorkspace);
  const removeWorkspace = useAction(deleteWorkspace);

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
  return (
    <div class="flex flex-col items-start gap-8 w-full">
      <div class="flex flex-col items-start gap-2 w-full">
        <span class="text-lg font-semibold">Workspaces</span>
        <span class="text-sm text-muted-foreground">Manage your workspaces</span>
      </div>
      <div class="gap-2 w-full flex flex-col">
        <Suspense fallback={<For each={[0, 1]}>{() => <Skeleton class="w-full h-48" />}</For>}>
          <For
            each={workspaces()}
            fallback={
              <Alert class="flex flex-col items-start gap-2 w-full bg-muted">
                <span class="text-lg font-semibold">No workspaces</span>
                <span class="text-sm text-muted-foreground">Create a new workspace</span>
                <Button variant="default" size="sm" type="submit" class="w-max" asChild>
                  <As component={A} href="/workspaces/new">
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
                    <div class="w-full flex flex-row gap-2">
                      <span>{workspace.name}</span>
                      <Show when={workspace.owner && workspace.owner_id === user()?.id}>
                        <Badge variant="default">Owner: {workspace.owner?.name}</Badge>
                      </Show>
                      <Show when={workspace.id === session()?.workspace_id}>
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
                  <div class="w-full rounded-md border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-1 text-sm">
                    <span>Created {dayjs(workspace.createdAt).fromNow()}</span>
                    <span>{workspace.users.length} Users</span>
                  </div>
                  <div class="w-full flex items-center justify-between gap-2">
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
                          <span>Connect</span>
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
                          <span>Disconnect</span>
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </Suspense>
      </div>
    </div>
  );
};
