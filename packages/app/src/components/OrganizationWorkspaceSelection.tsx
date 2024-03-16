import { createSignal, createEffect, onCleanup, JSX, JSXElement, ComponentProps, Show } from "solid-js";
import {
  CommandDialog,
  CommandItem,
  CommandItemLabel,
  CommandInput,
  CommandList,
  CommandHeading,
} from "@/components/ui/command";
import { Building2, ChevronsUpDown, Target } from "lucide-solid";
import { Badge } from "@/components/ui/badge";
import { toast } from "solid-sonner";
import { createAsync, useAction, useNavigate, useSubmission } from "@solidjs/router";
import { getAuthenticatedUser } from "@/lib/auth/util";
import { getUserOrganizations } from "@/lib/api/organizations";
import { setDashboard } from "@/lib/api/user";
import { useSession } from "./SessionProvider";

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

export const OrganizationWorkspaceSelection = () => {
  const userSession = useSession();
  const userOrganizations = createAsync(() => getUserOrganizations());
  const setUserDashboard = useAction(setDashboard);
  const isChangingDashboard = useSubmission(setDashboard);
  type OrgList = NonNullable<Awaited<ReturnType<typeof userOrganizations>>>;

  const [openSelector, setOpenSelector] = createSignal(false);
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
  const navigate = useNavigate();

  return (
    <div class="flex flex-row items-center">
      <Show when={userOrganizations() !== undefined && userOrganizations()}>
        {(uO) => (
          <Show
            when={typeof userSession !== "undefined" && userSession()}
            fallback={<Badge variant="outline">No Organization</Badge>}
          >
            {(session) => (
              <>
                <div
                  class="flex flex-row items-center justify-between px-4 py-2 gap-4 cursor-pointer text-muted-foreground w-full group"
                  onClick={() => {
                    if (isChangingDashboard.pending) return;
                    setOpenSelector(true);
                  }}
                >
                  <div class="w-full flex flex-row items-center justify-between gap-2">
                    <div class="size-9 bg-indigo-500 flex items-center justify-center rounded-md text-white">
                      <Building2 class="size-4" />
                    </div>
                    <div class="flex flex-row w-full items-center justify-between group-hover:bg-neutral-100 group-hover:dark:bg-neutral-900 px-4 py-1 rounded-md">
                      <div class="w-full flex flex-col text-xs">
                        <div class="w-max font-bold">{session().organization?.name}</div>
                        <div class="w-max">{session().workspace?.name}</div>
                      </div>
                      <ChevronsUpDown class="size-3" />
                    </div>
                  </div>
                </div>
                <CommandDialog<OrgWorkspaceOption, List>
                  open={openSelector()}
                  onOpenChange={setOpenSelector}
                  options={createList(uO(), session().organization?.id, session().workspace?.id)}
                  optionValue={(v) => `${v.organizationId}_${v.workspaceId}`}
                  optionTextValue="label"
                  optionLabel="label"
                  optionGroupChildren="options"
                  placeholder="Choose a Workspace"
                  optionDisabled="disabled"
                  itemComponent={(props) => (
                    <CommandItem item={props.item} class="flex flex-row items-center gap-2">
                      {props.item.rawValue.icon}
                      <CommandItemLabel>
                        {props.item.rawValue.label}
                        {props.item.disabled ? " (selected)" : ""}
                      </CommandItemLabel>
                    </CommandItem>
                  )}
                  sectionComponent={(props) => <CommandHeading>{props.section.rawValue.label}</CommandHeading>}
                  class="md:rounded-lg md:border md:shadow-md"
                  onChange={async (value: OrgWorkspaceOption) => {
                    if (!value) return;
                    await setUserDashboard(value.organizationId, value.workspaceId);
                    navigate("/dashboard");
                  }}
                >
                  <CommandInput />
                  <CommandList />
                </CommandDialog>
              </>
            )}
          </Show>
        )}
      </Show>
    </div>
  );
};
