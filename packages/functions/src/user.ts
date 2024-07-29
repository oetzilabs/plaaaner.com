import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";
import { User } from "@oetzilabs-plaaaner-com/core/src/entities/users";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { Handler } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { error, getUser, json } from "./utils";

export const get: Handler = async (_event) => {
  const authtoken = _event.headers["Authorization"] || _event.headers["authorization"];
  if (!authtoken) {
    return error("No Authorization header", StatusCodes.UNAUTHORIZED);
  }
  const user = await getUser(authtoken.split(" ")[1]);
  if (!user) {
    return error("User not found", StatusCodes.NOT_FOUND);
  }
  return json(user);
};

export const session: Handler = async (_event) => {
  const authtoken = _event.headers["Authorization"] || _event.headers["authorization"];
  if (!authtoken) {
    return error("No Authorization header", StatusCodes.UNAUTHORIZED);
  }
  const user = await getUser(authtoken.split(" ")[1]);

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
};

export const all: Handler = async (_event) => {
  const users = await User.all();
  return json(users);
};
