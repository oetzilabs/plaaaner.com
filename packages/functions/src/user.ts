import { StatusCodes } from "http-status-codes";
import { ApiHandler } from "sst/node/api";
import { error, getUser, json } from "./utils";
import { Workspace } from "@/core/entities/workspaces";

export const get = ApiHandler(async (event) => {
  const user = await getUser();
  if (!user) {
    return error("User not found", StatusCodes.NOT_FOUND);
  }
  return json(user);
});

export const session = ApiHandler(async (event) => {
  const user = await getUser();
  if (!user) {
    return error("User not found", StatusCodes.NOT_FOUND);
  }
  let workspace = await Workspace.lastCreatedFromUserId(user.id);
  if (!workspace) {
    workspace = await Workspace.create({ name: "default", owner_id: user.id });
    await Workspace.connectUser(workspace.id, user.id);
    return json({ email: user.email, id: user.id, workspace_id: workspace.id });
  }
  return json({ email: user.email, id: user.id, workspace_id: workspace.id });
});
