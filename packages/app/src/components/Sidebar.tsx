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
          <div class="w-full p-4 flex flex-col gap-4">
            <div class="w-full p-4 flex flex-col gap-2">
              <Skeleton class="w-full h-6" />
            </div>
            <div class="w-full p-4 flex flex-col gap-2">
              <div class="w-full items-center justify-between gap-2">
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
            <div class="w-full p-4 flex flex-col gap-2">
              <div class="w-full items-center justify-between gap-2">
                <Skeleton class="w-full h-6" />
                <div class="w-max">
                  <Skeleton class="size-6" />
                </div>
              </div>
              <Skeleton class="w-full h-6" />
              <Skeleton class="w-full h-6" />
            </div>
            <div class="w-full p-4 flex flex-col gap-2">
              <div class="w-full items-center justify-between gap-2">
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
              <div class="flex flex-row gap-2">
                <A href="/dashboard" class={cn(buttonVariants({ variant: "outline", size: "icon" }), "size-8")}>
                  <Building2 class="size-3" />
                </A>
                <Show when={userOrganizations() !== undefined && userOrganizations()}>
                  {(uO) => (
                    <Show
                      when={typeof userSession !== "undefined" && userSession()}
                      fallback={<Badge variant="outline">No Organization</Badge>}
                    >
                      {(session) => (
                        <Command<OrgWorkspaceOption, List>
                          options={createList(uO(), session().organization?.id, session().workspace?.id)}
                          optionValue={(v) => `${v.organizationId}_${v.workspaceId}`}
                          optionTextValue="label"
                          disabled={isChangingDashboard.pending}
                          optionLabel="label"
                          optionDisabled="disabled"
                          optionGroupChildren="options"
                          placeholder="Choose a workspace"
                          itemComponent={(props) => (
                            <CommandItem item={props.item}>
                              {props.item.rawValue.icon}
                              <CommandItemLabel>{props.item.rawValue.label}</CommandItemLabel>
                            </CommandItem>
                          )}
                          sectionComponent={(props) => <CommandHeading>{props.section.rawValue.label}</CommandHeading>}
                          class="rounded-lg border shadow-md"
                          onChange={async (value: OrgWorkspaceOption) => {
                            if (!value) return;
                            await setUserDashboard(value.organizationId, value.workspaceId);
                          }}
                        >
                          <CommandInput />
                          <CommandList />
                        </Command>
                      )}
                    </Show>
                  )}
                </Show>
              </div>
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
