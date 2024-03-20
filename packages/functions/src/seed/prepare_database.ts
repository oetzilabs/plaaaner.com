import { ApiHandler } from "sst/node/api";
import { Plans } from "@oetzilabs-plaaaner-com/core/src/entities/plans";
import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { PlanTypes } from "@oetzilabs-plaaaner-com/core/src/entities/plan_types";
import { User } from "@oetzilabs-plaaaner-com/core/src/entities/users";
import { json } from "../utils";
import dayjs from "dayjs";

export const main = ApiHandler(async () => {
  const system_user = await User.create({
    name: "system_user",
    email: "system@plaaaner.com",
    emailVerifiedAt: new Date(),
  });

  const system_user_org = await Organization.create(
    {
      name: "system_org",
    },
    system_user.id
  );

  const system_user_workspace = await Workspace.create(
    {
      name: "system_workspace",
    },
    system_user.id,
    system_user_org.id
  );

  const plan_type = await PlanTypes.findByName("");

  if (!plan_type) {
    console.error("No plan_type found");
    return;
  }

  const plansToCreate: Parameters<typeof Plans.create>[0] = [
    {
      name: "system_test_plan",
      ends_at: dayjs().add(3, "hours").toDate(),
      starts_at: dayjs().toDate(),
      plan_type_id: plan_type.id,
      description: "this is a system test plan",
    },
  ];

  const plans = await Plans.create(plansToCreate, system_user.id, system_user_workspace.id);

  return json(plans);
});
