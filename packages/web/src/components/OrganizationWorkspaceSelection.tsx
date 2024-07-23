import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandHeading,
  CommandInput,
  CommandItem,
  CommandItemLabel,
  CommandList,
} from "@/components/ui/command";
import { getUserOrganizations } from "@/lib/api/organizations";
import { setDashboard } from "@/lib/api/user";
import { createAsync, revalidate, useAction, useNavigate, useSubmission } from "@solidjs/router";
import { Building, Target } from "lucide-solid";
import { createSignal, JSXElement, Show } from "solid-js";
import { useSession } from "./SessionProvider";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { getAuthenticatedSession } from "../lib/auth/util";

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
                  class="flex flex-row items-center justify-between p-4 pb-0 gap-4 cursor-pointer text-muted-foreground w-full group"
                  onClick={() => {
                    if (isChangingDashboard.pending) return;
                    setOpenSelector(true);
                  }}
                >
                  <div class="w-full flex flex-row items-center justify-between gap-2">
                    <Tooltip placement="right" gutter={8}>
                      <TooltipTrigger class="rounded-full">
                        <div class="size-10 bg-indigo-500 flex items-center justify-center text-white rounded-full">
                          <Building class="size-4" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div class="w-full flex flex-col gap-1">
                          <div class="w-full font-bold text-xs">
                            {session().organization?.name}{" "}
                            <Show when={session().workspace?.name !== "default" && session().workspace?.name}>
                              {(name) => <>({name()})</>}
                            </Show>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
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

                    await revalidate(getAuthenticatedSession.key);
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
