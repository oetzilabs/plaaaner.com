import { z } from "zod";

export * as Activities from "./activities";

export const getByOrganizationWorkspace = z.function(z.tuple([z.string().uuid(), z.string().uuid()])).implement(async(organization_id, workspace_id) => {
  const ac: any[] = [];

  return ac;
});

