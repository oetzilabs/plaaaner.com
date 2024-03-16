import { As } from "@kobalte/core";
import { A } from "@solidjs/router";
import { Settings2 } from "lucide-solid";
import { Show } from "solid-js";
import { toast } from "solid-sonner";
import ModeToggle from "./ModeToogle";
import { useSession } from "./SessionProvider";
import { Button } from "./ui/button";
import UserMenu from "./UserMenu";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { OrganizationWorkspaceSelection } from "./OrganizationWorkspaceSelection";
import { Inbox } from "./dashboard/notifications";
import { PlansList } from "./dashboard/plans-list";
import { Activities } from "./dashboard/activity";

export const Sidebar = () => {
  const userSession = useSession();

  return (
    <div class="relative w-[300px] flex flex-col gap-0 border-r border-neutral-200 dark:border-neutral-800 grow">
      <Show
        when={typeof userSession !== "undefined" && userSession().user !== null && userSession()}
        fallback={
          <div class="w-full p-4 flex flex-col gap-2">
            <div class="w-full py-2 flex flex-col gap-2">
              <Skeleton class="w-full h-12" />
            </div>
            <div class="w-full py-2 flex flex-col gap-2">
              <Skeleton class="w-full h-6" />
              <Skeleton class="w-full h-6" />
              <Skeleton class="w-full h-6" />
            </div>
            <Separator class="w-full" />
            <div class="w-full py-2 flex flex-col gap-2">
              <div class="flex flex-row w-full items-center justify-between gap-2">
                <Skeleton class="w-full h-6" />
                <div class="w-max">
                  <Skeleton class="size-6" />
                </div>
              </div>
              <Skeleton class="w-full h-6" />
              <Skeleton class="w-full h-6" />
            </div>
            <div class="w-full py-2 flex flex-col gap-2">
              <div class="flex flex-row w-full items-center justify-between gap-2">
                <Skeleton class="w-full h-6" />
                <div class="w-max">
                  <Skeleton class="size-6" />
                </div>
              </div>
              <Skeleton class="w-full h-6" />
              <Skeleton class="w-full h-6" />
            </div>
          </div>
        }
      >
        {(s) => (
          <div class="flex flex-col gap-0 w-full grow h-full">
            <div class="w-full flex flex-col gap-4 py-2">
              <OrganizationWorkspaceSelection />
              <div class="w-full h-max flex flex-col px-4 gap-2">
                <Inbox session={s()} />
                <Activities session={s()} />
              </div>
              <div class="w-full h-max flex flex-col gap-2 px-4">
                <Separator class="w-full" />
              </div>
              <div class="w-full h-max flex flex-col gap-2 px-4">
                <PlansList session={s()} />
              </div>
            </div>
            <div class="w-full grow flex flex-col gap-6"></div>
            <div class="w-full flex items-center flex-col">
              <Button
                size="lg"
                variant="ghost"
                asChild
                class="flex flex-row items-center justify-start gap-2 w-full px-4 rounded-none"
              >
                <As
                  component={A}
                  href="/profile/settings"
                  class="flex flex-row items-center justify-start gap-2 w-full"
                >
                  <Settings2 class="h-4 w-4" />
                  Settings
                </As>
              </Button>
              <ModeToggle />
            </div>
            <div class="flex flex-row items-center justify-between w-full border-t border-neutral-200 dark:border-neutral-800">
              <UserMenu user={s().user} />
            </div>
          </div>
        )}
      </Show>
    </div>
  );
};
