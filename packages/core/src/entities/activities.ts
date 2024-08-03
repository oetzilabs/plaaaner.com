import dayjs from "dayjs";
import { z } from "zod";
import { prefixed_cuid2 } from "../custom_cuid2";
import { Plans } from "./plans";
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
        user_id: prefixed_cuid2,
        workspace_id: prefixed_cuid2,
        organization_id: prefixed_cuid2,
      }),
    ]),
  )
  .implement(async (data) => {
    const activities: Activity[] = [];
    // const plans: Plans.Frontend[] = [];
    const plans: Plans.Frontend[] = await Plans.findByOptions({
      user_id: data.user_id,
      workspace_id: data.workspace_id,
      organization_id: data.organization_id,
    });

    for (const plan of plans) {
      activities.push({
        type: "plan",
        value: plan,
      });
    }

    const posts: Posts.Frontend[] = await Posts.findByOptions({
      user_id: data.user_id,
      workspace_id: data.workspace_id,
      organization_id: data.organization_id,
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
