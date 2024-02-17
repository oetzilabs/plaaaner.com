import { StatusCodes } from "http-status-codes";
import { ApiHandler } from "sst/node/api";
import { error, getUser, json } from "./utils";

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
  return json({ email: user.email, id: user.id });
});
