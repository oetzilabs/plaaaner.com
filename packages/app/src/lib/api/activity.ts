import { Activities } from "@oetzilabs-plaaaner-com/core/src/entities/activities";
import { cache, redirect } from "@solidjs/router";
import { getEvent } from "vinxi/http";

export const getActivitySettings = cache(async () => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.context.user;
  return {
    type: "everything",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  // const n = await Activities.findManyByUserId(user.id);
  // return n;
}, "notificationSettings");

export const getActivities = cache(async () => {
  "use server";
  const event = getEvent()!;

  if (!event.context.session) {
    throw redirect("/auth/login");
  }

  const session = event.context.session;

  if (!session.organization_id) {
    throw redirect("/setup/organization");
  }

  if (!session.workspace_id) {
    throw redirect(`/organizations/${session.organization_id}/workspace/new`);
  }

  if (!event.context.user) {
    throw redirect("/auth/login");
  }

  const user = event.context.user;

  const acs = await Activities.getByOrganizationWorkspace({
    user_id: user.id,
    organization_id: session.organization_id,
    workspace_id: session.workspace_id,
  });

  return acs;
}, "activities");
