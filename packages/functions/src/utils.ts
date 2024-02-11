import { User } from "@/core/entities/users";
import { createSessionBuilder } from "sst/node/future/auth";
import { StatusCodes } from "http-status-codes";
import { useHeader } from "sst/node/api";

export const getUser = async () => {
  const session = sessions.use();
  if (!session) throw new Error("No session found");
  if (session.type !== "user") {
    throw new Error("Invalid session type");
  }
  const userid = session.properties.userID;
  if (!userid) throw new Error("Invalid UserID in session");
  const user = await User.findById(userid);
  if (!user) throw new Error("No session found");
  return user;
};

export const json = (input: unknown, statusCode = StatusCodes.OK) => {
  return {
    statusCode,
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
  };
};

export const error = <T extends string | Record<string, any>>(error: T, statusCode = StatusCodes.BAD_REQUEST) => {
  const payload = typeof error === "string" ? { error } : error;
  return {
    statusCode,
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  };
};
export const text = (input: string, statusCode = StatusCodes.OK) => {
  return {
    statusCode,
    body: input,
    headers: {
      "Content-Type": "text/plain",
    },
  };
};

export const sessions = createSessionBuilder<{
  user: {
    userID: string;
  };
}>();
