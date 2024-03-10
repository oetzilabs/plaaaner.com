import { ApiHandler } from "sst/node/api";
import { PlanTypes } from "@oetzilabs-plaaaner-com/core/src/entities/plan_types";
import { json } from "../utils";

export const main = ApiHandler(async () => {
  const createdPlanTypes = await PlanTypes.create(PlanTypes.DEFAULT_PLAN_TYPES, null);
  return json(createdPlanTypes);
});

export const upsert = ApiHandler(async () => {
  const createdPlanTypes = await PlanTypes.upsert(PlanTypes.DEFAULT_PLAN_TYPES, null);
  return json(createdPlanTypes);
});

