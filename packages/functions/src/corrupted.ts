import { Plans } from "@/core/entities/plans";
import { Workspace } from "@/core/entities/workspaces";
import { ApiHandler } from "sst/node/api";
import { json } from "./utils";

// export const main = ApiHandler(async (_evt) => {
//   const removed = await Workspace.removeCorrupt();
//   return json({ removed });
// });

export const plans = ApiHandler(async (_evt) => {
  const removed = await Plans.removeAll();
  return json({ removed });
});
