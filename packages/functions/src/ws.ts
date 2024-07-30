import { WebsocketCore } from "@oetzilabs-plaaaner-com/core/src/entities/websocket";
import { APIGatewayProxyWebsocketHandlerV2, Handler } from "aws-lambda";
import { StatusCodes } from "http-status-codes"; // import { Resource } from "sst";
import { error, json } from "./utils";

export const connect: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const connectionId = event.requestContext.connectionId;
  if (!connectionId) return error("No connectionId", StatusCodes.BAD_REQUEST);
  const x = await WebsocketCore.connect(connectionId);
  return json(x);
};

export const disconnect: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const connectionId = event.requestContext.connectionId;
  if (!connectionId) return error("No connectionId", StatusCodes.BAD_REQUEST);
  const x = await WebsocketCore.disconnect(connectionId);
  return json(x);
};

export const ping: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const connectionId = event.requestContext.connectionId;
  if (!connectionId) return error("No connectionId", StatusCodes.BAD_REQUEST);
  const payload = JSON.parse(event.body || "{}");
  // console.log("ping payload", payload.payload);
  if (!payload.payload.userId) return error("No userId", StatusCodes.BAD_REQUEST);
  const userId = payload.payload.userId;

  const x = await WebsocketCore.update(connectionId, userId);
  // console.log("Updated Websocket Connection Entry", x);
  const id = payload.payload.id;
  const sentAt = Date.now();

  await WebsocketCore.sendMessageToConnection(
    {
      action: "pong",
      payload: {
        recievedId: id,
        sentAt: Date.now(),
      },
    },
    connectionId,
  );

  // const missingNotifications = await Notifications.sendMissingNotifications(userId);
  // console.log("missingNotifications", missingNotifications);
  return json({
    type: "pong",
    recievedId: id,
    sentAt,
  });
};

export const main: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const connectionId = event.requestContext.connectionId;
  if (!connectionId) return error("No connectionId", StatusCodes.BAD_REQUEST);
  const payload = JSON.parse(event.body || "{}");
  if (!payload.userId) return error("No userId", StatusCodes.BAD_REQUEST);
  const userId = payload.userId;
  const x = await WebsocketCore.update(connectionId, userId);
  return json(x);
};

export const sendnotification: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const connectionId = event.requestContext.requestId;
  if (!connectionId) return error("No connectionId", StatusCodes.BAD_REQUEST);

  const x = await WebsocketCore.broadcast({
    id: "test-user-notification",
    type: "user:info",
    title: "Test",
    content: "Test",
    dismissedAt: null,
  });

  return json(x);
};

export const revokeWebsocketConnections: Handler = async (event, context) => {
  const revoked = await WebsocketCore.revokeAll();
  const revokedConnections = [];
  for (const connection of revoked) {
    revokedConnections.push({ id: connection.id, userId: connection.userId });
  }
  return json({ revoked: revokedConnections });
};
