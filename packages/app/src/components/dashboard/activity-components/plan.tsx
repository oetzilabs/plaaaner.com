import { UserSession } from "@/lib/auth/util";
import { Plans } from "@oetzilabs-plaaaner-com/core/src/entities/plans";
import { A } from "@solidjs/router";
import dayjs from "dayjs";
import { PlanCommentsSection } from "./comments";

export const PlanActivity = (props: { session: UserSession; plan: Plans.Frontend }) => {
  return (
    <>
      <A
        href={`/dashboard/organizations/${props.session.organization?.id}/workspace/${props.session.workspace?.id}/plans/${props.plan.id}`}
        class="rounded-md bg-background"
      >
        <div class="w-full h-48 border-b border-neutral-200 dark:border-neutral-800 bg-muted"></div>
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
      <PlanCommentsSection
        planId={props.plan.id}
        username={props.session.user?.name ?? "John Doe"}
        increment={3}
        session={props.session}
      />
    </>
  );
};
