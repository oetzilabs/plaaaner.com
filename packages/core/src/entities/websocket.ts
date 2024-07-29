import { ApiGatewayManagementApi, GoneException } from "@aws-sdk/client-apigatewaymanagementapi";
import dayjs from "dayjs";
import { eq, gte, lte } from "drizzle-orm";
import { Resource } from "sst";
import { z } from "zod";
import { db } from "../drizzle/sql/index";
import { websockets } from "../drizzle/sql/schema";
import { Notify } from "./notifications";
import { Workspace } from "./workspaces";

export * as WebsocketCore from "./websocket";

export type WebsocketMessage<N extends string, P = unknown> = {
  action: N;
  payload: P;
};

export type WebsocketMessageProtocol = {
  send: WebsocketMessage<"send", WebsocketMessage<string, unknown>>;
  message: WebsocketMessage<"message", unknown>;
  clear: WebsocketMessage<"clear", unknown>;
  push: WebsocketMessage<"push", unknown>;
  pull: WebsocketMessage<"pull", unknown>;
  ping: WebsocketMessage<
    "ping",
    {
      userId: string;
      id: string;
    }
  >;
  pong: WebsocketMessage<
    "pong",
    {
      recievedId: string;
      sentAt: number;
    }
  >;
};

export const connect = z.function(z.tuple([z.string()])).implement(async (connectionId) => {
  const [x] = await db.insert(websockets).values({ connectionId }).returning({
    id: websockets.id,
    connectionId: websockets.connectionId,
  });
  return x;
});

export const getConnection = z.function(z.tuple([z.string().uuid()])).implement(async (userId) => {
  const [x] = await db
    .select({ connectionId: websockets.connectionId })
    .from(websockets)
    .where(eq(websockets.userId, userId));
  return x;
});

export const update = z.function(z.tuple([z.string(), z.string().uuid()])).implement(async (connectionId, userId) => {
  const [x] = await db
    .update(websockets)
    .set({ updatedAt: new Date(), userId })
    .where(eq(websockets.connectionId, connectionId))
    .returning({
      id: websockets.id,
      connectionId: websockets.connectionId,
    });
  return x;
});

export const disconnect = z.function(z.tuple([z.string()])).implement(async (connectionId) => {
  const [x] = await db.delete(websockets).where(eq(websockets.connectionId, connectionId)).returning({
    id: websockets.id,
    connectionId: websockets.connectionId,
  });
  return x;
});

export const sendMessageToConnection = async (message: any, connectionId: string) => {
  const apiG = new ApiGatewayManagementApi({
    endpoint: Resource.Websocket.url,
  });
  try {
    // Send the message to the given client
    const websocketSentMessage = await apiG.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(message),
    });
    // console.log({ websocketSentMessage });
  } catch (e: unknown) {
    const eTyped = e as { statusCode: number };
    console.log("error sending message", e);
    if (eTyped.statusCode === 410) {
      // Remove stale connections
      await db.delete(websockets).where(eq(websockets.connectionId, connectionId)).returning();
    } else if (eTyped instanceof GoneException) {
      console.log(`GoneException: ${eTyped.message}`);
      await db.delete(websockets).where(eq(websockets.connectionId, connectionId)).returning();
    } else {
      console.error(e);
    }
  }
};

export const sendMessageToUsersInWorkspace = z
  .function(z.tuple([z.string(), z.string().uuid(), z.any()]))
  .implement(async (workspaceId, userId, message) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    const users = workspace.users.map((user) => user.user);
    if (!users) {
      throw new Error("No users in workspace");
    }

    for (let i = 0; i < users.length; i++) {
      const connection = await getConnection(users[i].id);
      await sendMessageToConnection(message, connection.connectionId);
    }
    return users;
  });

export const broadcast = z.function(z.tuple([z.any()])).implement(async (message) => {
  // get all connectionstrings
  const connectionIds = await db
    .select({ connectionId: websockets.connectionId })
    .from(websockets)
    .where(gte(websockets.updatedAt, dayjs().subtract(5, "minute").toDate()));
  const sentResult = [];
  // send message to all connections
  for (let i = 0; i < connectionIds.length; i++) {
    const connectionId = connectionIds[i].connectionId;
    await sendMessageToConnection(message, connectionId);
    sentResult.push({
      connectionId,
      notification: message,
    });
  }
  return sentResult;
});

export const revokeAll = z.function(z.tuple([])).implement(async () => {
  return db.delete(websockets).returning();
});
