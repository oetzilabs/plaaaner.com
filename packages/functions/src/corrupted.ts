import { Workspace } from "@/core/entities/workspaces";
import { ApiHandler } from "sst/node/api";
import { json } from "./utils";

export const main = ApiHandler(async (_evt) => {
  const removed = await Workspace.removeCorrupt();
  return json({removed});
})
