import { Badge } from "@/components/ui/badge";
import { getOrganizationById } from "@/lib/api/organizations";
import { createAsync, redirect, useParams } from "@solidjs/router";
import { Show } from "solid-js";

export default function OrganizationPage() {
  const { organization_id } = useParams();
  if (!organization_id) return redirect("/404", 404);

  const org = createAsync(() => getOrganizationById(organization_id), { deferStream: true });

  return (
    <Show when={typeof org !== "undefined" && org()}>
      {(organization) => (
        <div class="p-4 flex flex-col grow">
          <div class="flex flex-row items-center justify-start gap-2">
            <span class="text-3xl font-bold">{organization().name}</span>
            <Badge variant="secondary" class="w-max h-max">
              {organization().owner.name}
            </Badge>
          </div>
        </div>
      )}
    </Show>
  );
}
