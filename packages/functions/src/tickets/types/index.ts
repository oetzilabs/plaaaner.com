import { Tickets } from "@oetzilabs-plaaaner-com/core/src/entities/tickets";
import { ApiHandler } from "sst/node/api";
import { json } from "../../utils";

export const all = ApiHandler(async () => {
  const allTicketTypes = await Tickets.getAllTypes();
  return json(allTicketTypes);
});
