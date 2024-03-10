import { PlanTypes } from "@oetzilabs-plaaaner-com/core/src/entities/plan_types";
import { ApiHandler } from "sst/node/api";
import { json } from "../utils";

export const all = ApiHandler(async () => {
  const allPlanTypes = await PlanTypes.getAllTypes();
  return json(allPlanTypes);
});

