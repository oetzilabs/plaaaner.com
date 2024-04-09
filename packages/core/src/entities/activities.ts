import { z } from "zod";
import { Plans } from "./plans";

export * as Activities from "./activities";

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
    const plans = await Plans.findBy({
      user_id: data.user_id,
      workspace_id: data.workspace_id,
      organization_id: data.organization_id,
      fromDate: data.fromDate,
    });

    return {
      plans
    };
  });
