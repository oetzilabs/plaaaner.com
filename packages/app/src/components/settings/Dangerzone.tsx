import { Button } from "@/components/ui/button";
import { deleteCorruptWorkspaces } from "@/lib/api/workspaces";
import { deleteCorruptOrganizations } from "@/lib/api/organizations";
import { useAction, useSubmission } from "@solidjs/router";

export const Dangerzone = () => {
  const removeCorruptWorkspaces = useAction(deleteCorruptWorkspaces);
  const removeCorruptOrganizations = useAction(deleteCorruptOrganizations);
  const isDeletingWorkspaces = useSubmission(deleteCorruptWorkspaces);
  const isDeletingOrganizations = useSubmission(deleteCorruptOrganizations);

  return (
    <div class="flex flex-col items-start gap-8 w-full">
      <div class="flex flex-col items-start gap-2 w-full">
        <span class="text-lg font-semibold">Dangerzone</span>
        <span class="text-sm text-muted-foreground">Please be causious what you click on!</span>
      </div>
      <div class="gap-4 w-full flex flex-col">
        <Button
          variant="destructive"
          disabled={isDeletingOrganizations.pending}
          onClick={async () => {
            await removeCorruptOrganizations();
          }}
        >
          Remove Corrupt Organizations
        </Button>
        <Button
          variant="destructive"
          disabled={isDeletingWorkspaces.pending}
          onClick={async () => {
            await removeCorruptWorkspaces();
          }}
        >
          Remove Corrupt Workspaces
        </Button>
        <div>{JSON.stringify(isDeletingWorkspaces.result)}</div>
        <div>{JSON.stringify(isDeletingOrganizations.result)}</div>
      </div>
    </div>
  );
};
