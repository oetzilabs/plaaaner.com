import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getWorkspace } from "@/lib/api/workspaces";
import { setWorkspaceOwner } from "@/lib/api/workspaces";
import { createAsync, redirect, useAction, useParams, useSubmission } from "@solidjs/router";
import { Show } from "solid-js";

export default function Workspace() {
  const { wid } = useParams();
  if (!wid) throw redirect("/dashboard/workspaces", 303);

  const ws = createAsync(() => getWorkspace(wid));

  const ownWorkspace = useAction(setWorkspaceOwner);
  const changingWorkspaceOwner = useSubmission(setWorkspaceOwner);

  const handleWorkspaceOwnerChange = async () => {
    await ownWorkspace(wid);
  };

  return (
    <div class="flex flex-col items-start h-full w-full py-10 gap-8">
      <div class="flex flex-col gap-1">
        <Show when={ws()}>
          {(w) => (
            <>
              <div class="w-max flex flex-row gap-2">
                <Badge variant="secondary" class="w-max">
                  Workspace
                </Badge>
                <Show
                  when={w().owner}
                  fallback={
                    <div class="flex gap-2">
                      <Badge variant="secondary">No owner</Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleWorkspaceOwnerChange}
                        disabled={changingWorkspaceOwner.pending}
                      >
                        Claim
                      </Button>
                    </div>
                  }
                >
                  {(o) => <Badge variant="default">Owner: {o().name}</Badge>}
                </Show>
              </div>
              <div class="w-full flex flex-col gap-4">
                <h1 class="text-3xl font-medium">{w().name}</h1>
                <div class="flex gap-4"></div>
              </div>
            </>
          )}
        </Show>
      </div>
    </div>
  );
}
