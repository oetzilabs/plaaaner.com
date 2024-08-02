import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getWorkspace, setWorkspaceOwner } from "@/lib/api/workspaces";
import { getAuthenticatedSession } from "@/lib/auth/util";
import {
  createAsync,
  redirect,
  revalidate,
  RoutePreloadFuncArgs,
  useAction,
  useParams,
  useSubmission,
} from "@solidjs/router";
import { Show } from "solid-js";

export const route = {
  preload: async (props: RoutePreloadFuncArgs) => {
    const session = await getAuthenticatedSession();
    const ws = await getWorkspace(props.params.wid);
    return { ws, session };
  },
};

export default function Workspace() {
  const params = useParams();
  if (!params.wid) throw redirect("/dashboard/workspaces", 303);

  const ws = createAsync(() => getWorkspace(params.wid));

  const ownWorkspace = useAction(setWorkspaceOwner);
  const changingWorkspaceOwner = useSubmission(setWorkspaceOwner);

  const handleWorkspaceOwnerChange = async () => {
    await ownWorkspace(params.wid);

    await revalidate(getAuthenticatedSession.key);
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
                  keyed
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
                  {(o) => <Badge variant="default">Owner: {o.name}</Badge>}
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
