import { getUserOrganizations } from "@/lib/api/organizations";
import { setDashboard } from "@/lib/api/user";
import { cn } from "@/lib/utils";
import { As } from "@kobalte/core";
import { A, createAsync, useAction, useSubmission } from "@solidjs/router";
import { Building2, Plus, Settings2, Target } from "lucide-solid";
import { For, Show } from "solid-js";
import { toast } from "solid-sonner";
import ModeToggle from "./ModeToogle";
import { useSession } from "./SessionProvider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import UserMenu from "./UserMenu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Sidebar = () => {
  const userSession = useSession();
  const userOrganizations = createAsync(() => getUserOrganizations());
  const setUserDashboard = useAction(setDashboard);
  const isChangingDashboard = useSubmission(setDashboard);

  return (
    <div class="relative w-[300px] flex flex-col gap-0 border-r border-neutral-200 dark:border-neutral-800 grow">
      <Show
        when={typeof userSession !== "undefined" && userSession().user !== null && userSession()}
        fallback={<div class="py-4 w-full"></div>}
      >
        {(s) => (
          <div class="flex flex-col gap-0 w-full grow h-full">
            <div class="w-full flex flex-col">
              <Button size="lg" variant="ghost" asChild class="w-full items-center justify-start rounded-none p-4">
                <As component={A} href="/dashboard">
                  Dashboard
                </As>
              </Button>
            </div>
            <div class="w-full flex flex-col">
              <div class="flex flex-row pt-4 px-4 items-center justify-between">
                <span class="font-bold">Organizations</span>
                <div class="w-max">
                  <Button size="icon" variant="ghost" asChild class="size-8">
                    <As component={A} href="/dashboard/organizations/new">
                      <Plus class="size-4" />
                    </As>
                  </Button>
                </div>
              </div>
              <Show when={userOrganizations() !== undefined && userOrganizations()}>
                {(uO) => (
                  <Show
                    when={typeof userSession !== "undefined" && userSession()}
                    fallback={<Badge variant="outline">No Organization</Badge>}
                  >
                    {(session) => (
                      <div class="pb-4">
                        <Accordion
                          collapsible
                          class="w-full"
                          defaultValue={session().organization !== null ? [session().organization!.id] : []}
                        >
                          <For each={uO() ?? []}>
                            {(o) => (
                              <AccordionItem value={o.id} class="w-full flex flex-col border-none">
                                <AccordionTrigger class="px-4 hover:no-underline w-full">{o.name}</AccordionTrigger>
                                <AccordionContent class="w-full flex flex-col items-start justify-start">
                                  <For each={o.workspaces}>
                                    {(workspaces) => (
                                      <Button
                                        class="flex flex-row items-center justify-start rounded-none w-full gap-2"
                                        variant={
                                          session().organization?.id === o.id &&
                                          workspaces.workspace.id === session().workspace?.id
                                            ? "secondary"
                                            : "ghost"
                                        }
                                        onClick={async () => {
                                          if (
                                            session().organization?.id === o.id &&
                                            workspaces.workspace.id === session().workspace?.id
                                          )
                                            return;
                                          await setDashboard(o.id, workspaces.workspace.id);
                                        }}
                                      >
                                        <Target class="size-4" />
                                        <span
                                          class={cn("font-medium", {
                                            "font-bold": o.id === session().id,
                                          })}
                                        >
                                          {o.name}
                                        </span>
                                      </Button>
                                    )}
                                  </For>
                                  <div class="px-4 w-full flex">
                                    <Button
                                      asChild
                                      class="flex flex-row items-center justify-center w-full gap-2"
                                      size="sm"
                                      variant="outline"
                                    >
                                      <As component={A} href={`/dashboard/organizations/${o.id}/workspaces/new`}>
                                        <Plus class="size-4" />
                                        <span>Workspace</span>
                                      </As>
                                    </Button>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )}
                          </For>
                        </Accordion>
                      </div>
                    )}
                  </Show>
                )}
              </Show>
            </div>
            <div class="w-full grow"></div>
            <div class="flex flex-row gap-2 items-center justify-between w-full p-4 border-t border-neutral-200 dark:border-neutral-800">
              <UserMenu user={s().user} />
              <div class="w-max flex gap-2 items-center flex-row">
                <Button size="icon" variant="ghost" asChild class="size-8">
                  <As component={A} href="/profile/settings">
                    <Settings2 class="h-4 w-4" />
                  </As>
                </Button>
                <ModeToggle />
              </div>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
};
