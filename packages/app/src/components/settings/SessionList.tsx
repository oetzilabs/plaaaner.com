import { getAuthenticatedSession, getAuthenticatedSessions } from "@/lib/auth/util";
import type { UserSession } from "@/lib/auth/util";
import { revokeAllSessions, revokeSession } from "@/utils/api/actions";
import { createAsync, revalidate, useAction, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import { Copy } from "lucide-solid";
import { For, Show, Suspense } from "solid-js";
import { toast } from "solid-sonner";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { NotLoggedIn } from "../NotLoggedIn";
import { Badge } from "../ui/badge";

export const SessionList = (props: { session: UserSession }) => {
  const sessions = createAsync(() => getAuthenticatedSessions());
  const isRevokingAllSessions = useSubmission(revokeAllSessions);
  const allSessionRevoker = useAction(revokeAllSessions);
  const sessionRevoker = useAction(revokeSession);
  const isRevokingSession = useSubmission(revokeSession);

  return (
    <Show when={props.session} fallback={<NotLoggedIn />}>
      {(currentSession) => (
        <div class="flex flex-col items-start gap-8 w-full">
          <div class="flex flex-col items-start gap-2 w-full">
            <span class="text-lg font-semibold">Sessions</span>
            <span class="text-muted-foreground text-xs">Manage your sessions here.</span>
          </div>
          <div class="gap-4 w-full flex flex-col">
            <Suspense fallback={<For each={[0, 1]}>{() => <Skeleton class="w-full h-48" />}</For>}>
              <For each={sessions()}>
                {(s) => {
                  return (
                    <div class="rounded-md border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col w-full gap-4">
                      <div class="flex flex-row gap-2 items-center">
                        <span class="text-lg font-semibold">{s.id}</span>
                        <Show when={s.id === currentSession().id}>
                          <Badge>Current</Badge>
                        </Show>
                      </div>
                      <div class="w-full rounded-md border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-2 text-sm">
                        <div class="flex flex-row gap-2 w-full min-w-0 justify-between items-center">
                          <div class="w-24">
                            <span class="w-full">Access Token:</span>
                          </div>
                          <div class="flex flex-row items-center justify-between w-full gap-2">
                            <div class="flex flex-row flex-0 w-full">
                              <div class="flex flex-row gap-1 rounded w-full h-6 bg-muted items-center justify-center text-muted-foreground">
                                content hidden
                              </div>
                            </div>
                            <div class="flex flex-row items-center justify-end gap-2 flex-shrink">
                              <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                onClick={() => {
                                  if ("clipboard" in navigator && s.access_token) {
                                    navigator.clipboard.writeText(s.access_token);
                                    toast.info("Access token copied to clipboard");
                                  }
                                }}
                              >
                                <Copy class="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-row gap-1">
                          <span class="w-max">Workspace:</span>
                          <span class="text-muted-foreground">{s.workspace_id}</span>
                        </div>
                        <div class="flex flex-row gap-1">
                          <span class="w-max">Organization:</span>
                          <span class="text-muted-foreground">{s.organization_id}</span>
                        </div>
                      </div>
                      <div class="flex flex-row gap-2 items-center justify-between">
                        <span class="text-sm text-muted-foreground">Expires {dayjs(s.expiresAt).fromNow()}</span>
                        <Button
                          size="sm"
                          disabled={isRevokingSession.pending}
                          variant="destructive"
                          onClick={async () => {
                            await sessionRevoker(s.id);
                            await revalidate(getAuthenticatedSession.key);
                          }}
                        >
                          Revoke Session
                        </Button>
                      </div>
                    </div>
                  );
                }}
              </For>
            </Suspense>
          </div>
          <div class="flex flex-col gap-2 items-start w-full py-0">
            <div class="bg-red-100 dark:bg-red-900/50 w-full p-4 rounded-md border border-red-300 dark:border-red-700">
              <span class="text-red-500 dark:text-white text-sm">
                You can revoke all sessions to log out of all devices. This will also log you out of your{" "}
                <i>
                  <b>current</b>
                </i>{" "}
                device.
              </span>
              <div class="flex flex-row gap-2 w-full items-center justify-between">
                <div class="flex flex-row gap-2 w-full"></div>
                <div class="w-max">
                  <Button
                    variant="destructive"
                    size="sm"
                    type="submit"
                    class="w-max"
                    disabled={isRevokingAllSessions.pending}
                    onClick={async () => {
                      await allSessionRevoker();
                      await revalidate(getAuthenticatedSession.key);
                    }}
                  >
                    Revoke All Sessions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Show>
  );
};
