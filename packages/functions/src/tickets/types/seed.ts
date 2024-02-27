import { ApiHandler } from "sst/node/api";
import { TicketTypes } from "@oetzilabs-plaaaner-com/core/src/entities/ticket_types";
import { error, getUser, json } from "../../utils";
import { StatusCodes } from "http-status-codes";

export const main = ApiHandler(async () => {
  const createdTickets = await TicketTypes.create(TicketTypes.DEFAULT_TICKET_TYPES, null);
  return json(createdTickets);
});
