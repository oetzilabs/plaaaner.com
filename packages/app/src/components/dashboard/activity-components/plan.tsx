import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserSession } from "@/lib/auth/util";
import { setFreshActivities } from "@/lib/utils";
import { As } from "@kobalte/core";
import { Plans } from "@oetzilabs-plaaaner-com/core/src/entities/plans";
import { A, useAction, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import { CircleAlert, Ellipsis, Eye, EyeOff, Trash } from "lucide-solid";
import { Match, Show, Switch } from "solid-js";
import { toast } from "solid-sonner";
import { PlanCommentsSection } from "./comments";
import { deletePlan } from "@/lib/api/plans";

export const PlanActivity = (props: { session: UserSession; plan: Plans.Frontend }) => {
  const removePlan = useAction(deletePlan);
  const isDeletingPlan = useSubmission(deletePlan);

  return (
    <>
      <div class="rounded-md bg-background relative">
        <div class="absolute top-4 right-4 z-[2]">
          <DropdownMenu>
            <DropdownMenuTrigger class="p-2" asChild>
              <As component={Button} variant="outline" size="sm" class="!p-2">
                <Ellipsis class="size-4" />
              </As>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem disabled>
                <CircleAlert class="size-4" />
                Report
              </DropdownMenuItem>
              <Show when={props.plan.owner.id === props.session?.user?.id}>
                <Switch>
                  <Match when={props.plan.status === "published"}>
                    <DropdownMenuItem>
                      <EyeOff class="size-4" />
                      Hide
                    </DropdownMenuItem>
                  </Match>
                  <Match when={props.plan.status === "hidden" || props.plan.status === "draft"}>
                    <DropdownMenuItem>
                      <Eye class="size-4" />
                      {props.plan.updatedAt ? "Republish" : "Publish"}
                    </DropdownMenuItem>
                  </Match>
                </Switch>
              </Show>
              <Show when={props.plan.owner.id === props.session?.user?.id}>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="cursor-pointer text-rose-500 hover:!text-rose-500 hover:!bg-rose-100"
                  disabled={isDeletingPlan.pending}
                  closeOnSelect={false}
                  onSelect={async () => {
                    if (props.plan.owner.id !== props.session?.user?.id) return;
                    const removed = await removePlan(props.plan.id);
                    if (!removed) {
                      toast.error("Could not delete post");
                      return;
                    }
                    toast.success("Post deleted, refreshing!");
                    setFreshActivities([{ change: "remove", activity: { type: "plan", value: removed } }]);
                  }}
                >
                  <Trash class="size-4" />
                  Delete
                </DropdownMenuItem>
              </Show>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <A
          href={`/dashboard/o//${props.session.organization?.id}/workspace/${props.session.workspace?.id}/plans/${props.plan.id}`}
          class="rounded-md bg-background"
        >
          <div class="w-full h-48 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 relative"></div>
          <div class="flex flex-col p-4 border-b border-neutral-200 dark:border-neutral-800 w-full">
            <div class="flex flex-col items-start w-full">
              <div class="flex flex-col gap-0.5">
                <h3 class="text-sm font-semibold w-max">{props.plan.owner.name}</h3>
                <time class="text-xs font-normal leading-none text-muted-foreground w-max">
                  {dayjs(props.plan.createdAt).format("Do MMM, YYYY")}
                </time>
              </div>
              <span class="text-xs font-normal text-neutral-500 dark:text-neutral-400">{props.plan.description}</span>
            </div>
          </div>
        </A>
      </div>
      <PlanCommentsSection
        planId={props.plan.id}
        username={props.session.user?.name ?? "John Doe"}
        increment={3}
        session={props.session}
      />
    </>
  );
};
