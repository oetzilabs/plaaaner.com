import { Alert } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fillDefaultTicketTypes, getDefaultTicketTypeCount, getUserOrganizations } from "@/lib/api/organizations";
import { setCurrentOrganization } from "@/lib/api/user";
import { getAuthenticatedUser } from "@/lib/auth/util";
import type { UserSession } from "@/lib/auth/util";
import { deleteOrganization, disconnectFromOrganization } from "@/utils/api/actions";
import { As } from "@kobalte/core";
import { A, createAsync, useAction, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import { Loader2, Plus, Trash } from "lucide-solid";
import { For, Show, Suspense } from "solid-js";
import { toast } from "solid-sonner";
import { cn } from "../../lib/utils";
import { Switch } from "solid-js";
import { Match } from "solid-js";
import { NotLoggedIn } from "../NotLoggedIn";

export const Organizations = (props: { session: UserSession }) => {
  const user = createAsync(() => getAuthenticatedUser());
  const organizations = createAsync(() => getUserOrganizations());
  const defaultTicketTypeCount = createAsync(() => getDefaultTicketTypeCount(), { deferStream: true });

  const disconnectOrganization = useAction(disconnectFromOrganization);
  const isDisconnectingFromOrganization = useSubmission(disconnectFromOrganization);
  const setCurrentOrg = useAction(setCurrentOrganization);
  const isSettingCurrentOrganization = useSubmission(setCurrentOrganization);
  const isDeletingOrganization = useSubmission(deleteOrganization);

  const removeOrganization = useAction(deleteOrganization);
  const fillInDefaultTicketTypes = useAction(fillDefaultTicketTypes);
  const isFillingDefaultTicketTypes = useSubmission(fillDefaultTicketTypes);

  return (
    <Show when={props.session} fallback={<NotLoggedIn />}>
      {(s) => (
        <div class="flex flex-col items-start gap-8 w-full">
          <div class="flex flex-col items-start gap-4 w-full">
            <div class="flex flex-row items-center justify-between w-full gap-2">
              <div class="w-full">
                <span class="text-lg font-semibold">Organizations</span>
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
                  Create Organization
                </A>
              </div>
            </div>
            <span class="text-sm text-muted-foreground">Manage your organizations</span>
          </div>
          <div class="gap-4 w-full flex flex-col">
            <Suspense fallback={<For each={[0, 1]}>{() => <Skeleton class="w-full h-48" />}</For>}>
              <For
                each={organizations()}
                fallback={
                  <Alert class="flex flex-col items-start gap-2 w-full bg-muted">
                    <span class="text-lg font-semibold">No organizations</span>
                    <span class="text-sm text-muted-foreground">Create a new Organization</span>
                    <Button variant="default" size="sm" type="submit" class="w-max" asChild>
                      <As component={A} href="/organization/new">
                        <span>Create Organization</span>
                      </As>
                    </Button>
                  </Alert>
                }
              >
                {(organization) => {
                  return (
                    <div class="rounded-md border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col w-full gap-4">
                      <div class="flex flex-row items-center gap-2 w-full">
                        <div class="w-full flex flex-row gap-2 items-center">
                          <span class="font-bold">{organization.name}</span>
                          <Show when={organization.owner && organization.owner.id === user()?.id}>
                            <Badge variant="default">Owner: {organization.owner?.name}</Badge>
                          </Show>
                          <Show when={organization.id === s().organization?.id}>
                            <Badge variant="secondary">Current</Badge>
                          </Show>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <As
                              component={Button}
                              variant="destructive"
                              size="icon"
                              disabled={isDeletingOrganization.pending}
                            >
                              <Trash class="w-4 h-4" />
                            </As>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you really sure, you want to delete this organization?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogClose>Cancel</AlertDialogClose>
                              <AlertDialogAction
                                asChild
                                onClick={() => {
                                  toast.promise(removeOrganization(organization.id), {
                                    loading: "Hold on a second, we're deleting the organization",
                                    icon: <Loader2 class="size-4 animate-spin" />,
                                    error: "There was an error deleting the organization",
                                    success: "Organization has been deleted, redirecting to home page!",
                                  });
                                }}
                              >
                                <As component={Button} variant="destructive">
                                  Continue
                                </As>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div class="w-full rounded-md border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-4 text-sm">
                        <span>Created {dayjs(organization.createdAt).fromNow()}</span>
                        <span>{organization.users.length} Users</span>
                        <span>
                          {organization.ticket_types.filter((tt) => !tt.ticket_type.name.startsWith("default")).length}{" "}
                          Ticket Types
                        </span>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 ">
                          <For
                            each={organization.ticket_types.filter((tt) => !tt.ticket_type.name.startsWith("default"))}
                          >
                            {(ticket_type) => (
                              <Badge
                                variant={ticket_type.ticket_type.name.startsWith("default") ? "secondary" : "default"}
                                class={cn("w-full p-2 px-3", {
                                  "text-muted-foreground cursor-not-allowed":
                                    ticket_type.ticket_type.name.startsWith("default"),
                                })}
                              >
                                {ticket_type.ticket_type.name} ({ticket_type.ticket_type.payment_type})
                              </Badge>
                            )}
                          </For>
                        </div>
                        <Show when={defaultTicketTypeCount() !== undefined && defaultTicketTypeCount()}>
                          {(count) => (
                            <Show
                              when={
                                organization.ticket_types.filter((tt) => !tt.ticket_type.name.startsWith("default"))
                                  .length !==
                                count() -
                                  organization.ticket_types.filter((tt) => tt.ticket_type.name.startsWith("default"))
                                    .length
                              }
                            >
                              Default Ticket Types: {count()}
                              <Button
                                onClick={async () => {
                                  await fillInDefaultTicketTypes();
                                }}
                                class="w-max items-center justify-center gap-2"
                                size="sm"
                                disabled={isFillingDefaultTicketTypes.pending}
                              >
                                <Switch>
                                  <Match when={isFillingDefaultTicketTypes.pending}>
                                    <Loader2 class="size-4 animate-spin" />
                                    <span>Adding Default Ticket Types</span>
                                  </Match>
                                  <Match when={!isFillingDefaultTicketTypes.pending}>Add Default Ticket Types</Match>
                                </Switch>
                              </Button>
                            </Show>
                          )}
                        </Show>
                      </div>
                      <div class="w-full flex items-center justify-between gap-2">
                        <div class="w-full"></div>
                        <div class="w-max flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" type="submit" class="w-max" asChild>
                            <As component={A} href={`/dashboard/organizations/${organization.id}`}>
                              <span>Manage</span>
                            </As>
                          </Button>
                          <div class="flex flex-col gap-2 items-end w-full py-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              type="submit"
                              class="w-max"
                              aria-label="Connect to Organization"
                              disabled={
                                isSettingCurrentOrganization.pending || organization.id === s().organization?.id
                              }
                              onClick={async () => {
                                await setCurrentOrg(organization.id);
                              }}
                            >
                              <span>Connect</span>
                            </Button>
                          </div>
                          <div class="flex flex-col gap-2 items-end w-full py-0">
                            <input type="hidden" name="organizationId" value={organization.id} />
                            <Button
                              variant="secondary"
                              size="sm"
                              type="submit"
                              class="w-max"
                              aria-label="Disconnect from organization"
                              disabled={isDisconnectingFromOrganization.pending || organizations()!.length === 1}
                              onClick={async () => {
                                await disconnectOrganization(organization.id);
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
          </div>
        </div>
      )}
    </Show>
  );
};
