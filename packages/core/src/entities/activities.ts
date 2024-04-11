import { z } from "zod";
import { Plans } from "./plans";
import dayjs from "dayjs";
import { Posts } from "./posts";

export * as Activities from "./activities";

export type Activity =
  | {
      type: "post";
      value: Posts.Frontend;
    }
  | {
      type: "plan";
      value: Plans.Frontend;
    };

export const getByOrganizationWorkspace = z
  .function(
    z.tuple([
      z.object({
        user_id: z.string().uuid(),
        workspace_id: z.string().uuid(),
        organization_id: z.string().uuid(),
        fromDate: z.date().nullable(),
      }),
    ])
  )
  .implement(async (data) => {
    const activities: Activity[] = [];
    // const plans: Plans.Frontend[] = [];
    const plans: Plans.Frontend[] = await Plans.findBy({
      user_id: data.user_id,
      workspace_id: data.workspace_id,
      organization_id: data.organization_id,
      fromDate: data.fromDate,
    });

    for (const plan of plans) {
      activities.push({
        type: "plan",
        value: plan,
      });
    }

    const posts: Posts.Frontend[] = await Posts.findBy({
      user_id: data.user_id,
      workspace_id: data.workspace_id,
      organization_id: data.organization_id,
      fromDate: data.fromDate,
    });

    for (const post of posts) {
      activities.push({
        type: "post",
        value: post,
      });
    }

    // sort by createdAt or updatedAt
    const sortedActivities = activities.sort((a, b) => {
      return dayjs(a.value.updatedAt ?? a.value.createdAt).isBefore(b.value.updatedAt ?? b.value.createdAt) ? 1 : -1;
    });

    return sortedActivities;
  });
