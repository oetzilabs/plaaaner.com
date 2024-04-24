import { createContextProvider } from "@solid-primitives/context";
import { createReconnectingWS } from "@solid-primitives/websocket";
import { createEventSignal } from "@solid-primitives/event-listener";
import { createSignal, JSX, onCleanup, onMount, Show } from "solid-js";
import { useSession } from "../SessionProvider";
import type { Notify } from "@oetzilabs-plaaaner-com/core/src/entities/notifications";
import { z } from "zod";
import { auth } from "./Authentication";
import { ActivityChange, setFreshActivities } from "../../lib/utils";

export type WSStatus = "connected" | "disconnected" | "pinging" | "sending" | "connecting";

type PongMessage = {
  action: "pong";
  recievedId: string;
  sentAt: string;
};

type PingMessage = {
  action: "ping";
  userId: string;
  id: string;
};

export const [Websocket, useWebsocketProvider] = createContextProvider(() => {
  const auth = useSession();
  const wsLink = import.meta.env.VITE_WS_LINK;
  if (!wsLink) throw new Error("No Websocket Link in Environtment");

  const ws = createReconnectingWS(wsLink);
  const messageEvent = createEventSignal(ws, "message");
  const message = () => messageEvent().data;

  const [status, setStatus] = createSignal<WSStatus>("disconnected");
  const [errors, setErrors] = createSignal<string[]>([]);
  const [sentQueue, setSentQueue] = createSignal<any[]>([]);
  const [recievedQueue, setRecievedQueue] = createSignal<Notify[]>([]);

  const createPingMessage = (): PingMessage => {
    const userId = auth?.()!.user?.id;
    if (!userId) throw new Error("No user id");
    const id = Math.random().toString(36).substring(2);

    return {
      action: "ping",
      userId,
      id,
    };
  };

  const handlers = {
    message: (e: any, ...a: any) => {
      console.info("message", e);
      const data = JSON.parse(e.data);
      const n = z.custom<Notify>().safeParse(data);
      if (n.success) {
        setRecievedQueue([...recievedQueue(), n.data]);
      }
      // update downstream
      const pongMessage = z.custom<PongMessage>().safeParse(data);
      if (pongMessage.success) {
        console.log("pong-message", pongMessage);
      } else {
        // updateFailed();
      }
      const activityMessage = z.custom<{ type: "activity"; value: ActivityChange[] }>().safeParse(data);
      if (activityMessage.success && activityMessage.data.type === "activity") {
        console.log("activity-message changed", activityMessage.data);
        setFreshActivities(activityMessage.data.value);
      }
    },
    open: (e: any) => {
      const userId = auth?.()!.user?.id;
      if (!userId) {
        // console.log("hey, no user");
        return;
      }
      try {
        const pm = createPingMessage();
        setSentQueue([...sentQueue(), pm]);
        ws.send(JSON.stringify(pm));
        console.log("Sent message:", pm);
        setStatus("connected");
      } catch (e) {
        console.error("no user session", e);
      }
    },
    close: (e: any) => {
      console.log("ws closed", e);
      setStatus("disconnected");
    },
    error: (e: any) => {
      console.log("ws errored", e);
      setErrors([...errors(), e]);
    },
  };

  ws.addEventListener("message", handlers.message);
  ws.addEventListener("open", handlers.open);
  ws.addEventListener("close", handlers.close);
  ws.addEventListener("error", handlers.error);

  onCleanup(() => {
    ws.removeEventListener("message", handlers.message);
    ws.removeEventListener("open", handlers.open);
    ws.removeEventListener("close", handlers.close);
    ws.removeEventListener("error", handlers.error);
  });

  return {
    ws,
    status,
    recievedQueue,
    sentQueue,
    errors,
    message,
  };
});

export const WebsocketProvider = (props: { children: JSX.Element }) => {
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));
  return (
    <Show when={mounted()} fallback={props.children}>
      <Websocket>{props.children}</Websocket>
    </Show>
  );
};
