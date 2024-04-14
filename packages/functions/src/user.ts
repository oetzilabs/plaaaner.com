import { StatusCodes } from "http-status-codes";
import { ApiHandler } from "sst/node/api";
import { error, getUser, json } from "./utils";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { User } from "@oetzilabs-plaaaner-com/core/src/entities/users";
import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";

export const get = ApiHandler(async (_event) => {
  const user = await getUser();
  if (!user) {
    return error("User not found", StatusCodes.NOT_FOUND);
  }
  return json(user);
});

export const session = ApiHandler(async (_event) => {
  const user = await getUser();

  if (!user) {
    return error("User not found", StatusCodes.NOT_FOUND);
  }

  let workspace = await Workspace.lastCreatedByUser(user.id);
  let organization_id = null;
  let organization = await Organization.lastCreatedByUser(user.id);

  if (!organization) {
    organization = await Organization.create({ name: "default" }, user.id);
    await Organization.connectUser(organization.id, user.id);
  }

  if (!workspace && organization) {
    workspace = await Workspace.create({ name: "default" }, user.id, organization.id);

    await Workspace.connectUser(workspace.id, user.id);
    // console.log("workspace-inner", workspace);

    return json({ email: user.email, id: user.id, workspace_id: workspace.id, organization_id: organization.id });
  }

  return json({ email: user.email, id: user.id, workspace_id: workspace?.id, organization_id: organization.id });
});

export const all = ApiHandler(async (_event) => {
  const users = await User.all();
  return json(users);
});
