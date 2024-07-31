import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { setDashboard } from "@/lib/api/user";
import { revalidate, useAction, useNavigate, useSubmission } from "@solidjs/router";
import { Building, Target } from "lucide-solid";
import { createSignal, For, JSXElement, Show } from "solid-js";
import { getAuthenticatedSession, UserSession } from "../lib/auth/util";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

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

export const OrganizationWorkspaceSelection = (props: { session: UserSession }) => {
  const setUserDashboard = useAction(setDashboard);
  const isChangingDashboard = useSubmission(setDashboard);

  const [openSelector, setOpenSelector] = createSignal(false);
  const createList = <T extends UserSession["organizations"]>(
    uO: T,
    currentOrgId?: string,
    workspaceId?: string,
  ): List[] => {
    const x: List[] = [];
    for (const org of uO) {
      x.push({
        label: org.name,
        options: org.workspaces.map((ws) => ({
          label: ws.workspace.name,
          icon: <Target class="size-3" />,
          disabled: org.id === currentOrgId && ws.workspace.id === workspaceId,
          workspaceId: ws.workspace.id,
          organizationId: org.id,
        })),
      });
    }
    return x;
  };
  const navigate = useNavigate();

  return (
    <div class="flex flex-row items-center">
      <Show when={props.session && props.session.user !== null && props.session.organizations}>
        {(uO) => (
          <Show
            when={props.session && props.session.user !== null && props.session}
            fallback={<Badge variant="outline">No Organization</Badge>}
          >
            {(s) => (
              <>
                <div
                  class="flex flex-row items-center justify-between p-2 pb-0 gap-4 cursor-pointer text-muted-foreground w-full group"
                  onClick={() => {
                    if (isChangingDashboard.pending) return;
                    setOpenSelector(true);
                  }}
                >
                  <div class="w-full flex flex-row items-center justify-between gap-2">
                    <Tooltip placement="right" gutter={8}>
                      <TooltipTrigger class="rounded-full">
                        <div class="size-8 bg-indigo-500 flex items-center justify-center text-white rounded-full">
                          <Building class="size-4" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div class="w-full flex flex-col gap-1">
                          <div class="w-full font-bold text-xs">
                            {s().organization?.name}{" "}
                            <Show when={s().workspace?.name !== "default" && s().workspace?.name}>
                              {(name) => <>({name()})</>}
                            </Show>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <CommandDialog
                  open={openSelector()}
                  onOpenChange={setOpenSelector}
                  class="md:rounded-lg md:border md:shadow-md"
                >
                  <CommandInput />
                  <CommandList>
                    <CommandEmpty class="text-muted-foreground">No results found.</CommandEmpty>
                    <For each={createList(uO(), s().organization?.id, s().workspace?.id)}>
                      {(list) => (
                        <CommandGroup heading={list.label}>
                          <For each={list.options}>
                            {(option) => (
                              <CommandItem
                                disabled={option.disabled}
                                onClick={async () => {
                                  if (!option.disabled) {
                                    await setUserDashboard(option.organizationId, option.workspaceId);

                                    await revalidate(getAuthenticatedSession.key);
                                    navigate("/dashboard");
                                  }
                                }}
                              >
                                <div class="flex flex-row items-center gap-2">
                                  {option.icon}
                                  <span class="">
                                    {option.label}
                                    {option.organizationId === s().organization?.id &&
                                      option.workspaceId === s().workspace?.id &&
                                      " (current)"}
                                  </span>
                                </div>
                              </CommandItem>
                            )}
                          </For>
                        </CommandGroup>
                      )}
                    </For>
                  </CommandList>
                </CommandDialog>
              </>
            )}
          </Show>
        )}
      </Show>
    </div>
  );
};
