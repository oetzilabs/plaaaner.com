import { getUserOrganizations } from "@/lib/api/organizations";
import { setDashboard } from "@/lib/api/user";
import { cn } from "@/lib/utils";
import { As } from "@kobalte/core";
import { A, createAsync, useAction, useSubmission } from "@solidjs/router";
import { Building2, Plus, Settings2, Target } from "lucide-solid";
import { For, JSXElement, Show } from "solid-js";
import { toast } from "solid-sonner";
import ModeToggle from "./ModeToogle";
import { useSession } from "./SessionProvider";
import { Badge } from "./ui/badge";
import { Button, buttonVariants } from "./ui/button";
import UserMenu from "./UserMenu";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import {
  Command,
  CommandHeading,
  CommandInput,
  CommandItem,
  CommandItemLabel,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { OrganizationWorkspaceSelection } from "./OrganizationWorkspaceSelection";

type OrgWorkspaceOption = {
  icon: JSXElement;
  label: string;
  organizationId: string;
  workspaceId: string;
  disabled: boolean;
};

type List = {
  label: string;
  options: OrgWorkspaceOption[];
};

export const Sidebar = () => {
  const userSession = useSession();
  const userOrganizations = createAsync(() => getUserOrganizations());
  const setUserDashboard = useAction(setDashboard);
  const isChangingDashboard = useSubmission(setDashboard);
  type OrgList = NonNullable<Awaited<ReturnType<typeof userOrganizations>>>;

  const createList = (
    uO: OrgList,
    currentOrgId?: OrgList[number]["id"],
    workspaceId?: OrgList[number]["workspaces"][number]["id"]
  ): List[] => {
    const x: List[] = [];
    for (const org of uO) {
      x.push({
        label: org.name,
        options: org.workspaces.map((ws) => ({
          label: ws.name,
          icon: <Target class="size-3" />,
          disabled: org.id === currentOrgId && ws.id === workspaceId,
          workspaceId: ws.id,
          organizationId: org.id,
        })),
      });
    }
    return x;
  };

  return (
    <div class="relative w-[300px] flex flex-col gap-0 border-r border-neutral-200 dark:border-neutral-800 grow">
      <Show
        when={typeof userSession !== "undefined" && userSession().user !== null && userSession()}
        fallback={
          <div class="w-full p-4 flex flex-col gap-2">
            <div class="w-full py-2 flex flex-col gap-2">
              <Skeleton class="w-full h-8" />
              <Skeleton class="w-full h-12" />
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
            <div class="w-full flex flex-row gap-2">
              <div class="flex flex-col gap-2 w-full border-b border-neutral-200 dark:border-neutral-800">
                <OrganizationWorkspaceSelection />
              </div>
            </div>
            <div class="w-full grow"></div>
            <div class="w-full flex items-center flex-col border-t border-neutral-200 dark:border-neutral-800">
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
