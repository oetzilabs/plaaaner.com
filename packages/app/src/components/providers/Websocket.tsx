import { createContextProvider } from "@solid-primitives/context";
import { createReconnectingWS } from "@solid-primitives/websocket";
import { createEventSignal } from "@solid-primitives/event-listener";
import { createSignal, JSX, onCleanup, onMount, Show } from "solid-js";
import { useSession } from "../SessionProvider";
import type { Notify } from "@oetzilabs-plaaaner-com/core/src/entities/notifications";
import { z } from "zod";
import { auth } from "./Authentication";

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
  if (!auth) {
    return null;
  }
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
    const userId = auth()!.userId;
    console.log(userId);
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
      const data = JSON.parse(e.data);
      const n = z.custom<Notify>().parse(data);
      setRecievedQueue([...recievedQueue(), n]);
      // update downstream
      const pongMessage = z.custom<PongMessage>().safeParse(data);
      if (pongMessage.success) {
        console.log("pong-message", pongMessage);
      } else {
        // updateFailed();
      }
    },
    open: (e: any) => {
      const a = auth();
      if(!a) return;
      const userId = a.userId;
      if (!userId) return;
      try {
        const pm = createPingMessage();
        setSentQueue([...sentQueue(), pm]);
        ws.send(JSON.stringify(pm));
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
    <Show when={mounted()}>
      <Websocket>{props.children}</Websocket>
    </Show>
  );
};
