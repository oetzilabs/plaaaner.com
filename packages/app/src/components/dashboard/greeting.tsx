import { A, createAsync, useAction, useSubmission } from "@solidjs/router";
import type { UserSession } from "@/lib/auth/util";
import { Show } from "solid-js";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-solid";
import { Badge } from "../ui/badge";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxTrigger } from "@/components/ui/combobox";
import { getUserOrganizations } from "@/lib/api/organizations";
import { setCurrentOrganization } from "@/lib/api/user";
import { toast } from "solid-sonner";

export const Greeting = (props: { session: UserSession }) => {
  const userOrganizations = createAsync(() => getUserOrganizations());
  const setUserOrganization = useAction(setCurrentOrganization);
  const isChangingOrganizations = useSubmission(setCurrentOrganization);

  const changeOrganization = async (organizationId: string) => {
    const formData = new FormData();
    formData.set("organization_id", organizationId);
    const changed = await setUserOrganization(formData);
    toast.success(`Organization changed to "${changed.name}"`);
  };

  return (
    <div class="flex flex-col gap-2">
      <div class="flex flex-col items-start gap-2 w-full">
        <Show when={userOrganizations() !== undefined && userOrganizations()}>
          {(uO) => (
            <Show when={props.session.organization} fallback={<Badge variant="outline">No Organization</Badge>}>
              {(cO) => (
                <Combobox
                  options={uO() ?? []}
                  value={cO()}
                  placeholder="Search organization..."
                  optionValue="id"
                  optionLabel="name"
                  optionDisabled="deletedAt"
                  allowsEmptyCollection={false}
                  onChange={async (v) => {
                    if (!v) return;
                    await changeOrganization(v.id);
                  }}
                  disabled={isChangingOrganizations.pending}
                  itemComponent={(props) => <ComboboxItem item={props.item}>{props.item.rawValue.name}</ComboboxItem>}
                >
                  <ComboboxTrigger>
                    <ComboboxInput />
                  </ComboboxTrigger>
                  <ComboboxContent />
                </Combobox>
              )}
            </Show>
          )}
        </Show>
        <div class="flex flex-row items-center justify-between w-full">
          <Show when={props.session.user}>{(u) => <h1 class="text-2xl font-bold">Welcome back, {u().name}</h1>}</Show>
          <Show when={props.session.user}>
            <A
              href="/plan/create"
              class={cn(
                "gap-2 w-max flex",
                buttonVariants({
                  variant: "default",
                  size: "sm",
                })
              )}
            >
              <Plus class="w-4 h-4" />
              <span class="w-max">Create Plan</span>
            </A>
          </Show>
        </div>
      </div>
      <Show when={props.session.workspace}>
        {(ws) => (
          <span class="text-xs text-muted-foreground">
            Here's what's happening {ws().name !== "default" ? `at '${ws().name}'` : "with your workspace"} today:
          </span>
        )}
      </Show>
    </div>
  );
};
