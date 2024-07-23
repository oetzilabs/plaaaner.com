import type { WebsocketMessage, WebsocketMessageProtocol } from "@/core/entities/websocket";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { createContextProvider } from "@solid-primitives/context";
import { Emitter } from "@solid-primitives/event-bus";
import { ReconnectingWebSocket } from "@solid-primitives/websocket";
import { createAsync } from "@solidjs/router";
import { onCleanup, onMount } from "solid-js";
import { toast } from "solid-sonner";

export type WSStatus = "connected" | "disconnected" | "pinging" | "sending" | "connecting";

export const [Websocket, useWebsocket] = createContextProvider(
  (props: { websocket: ReconnectingWebSocket | null; emitter: Emitter<WebsocketMessageProtocol> }) => {
    const session = createAsync(() => getAuthenticatedSession());

    const createPingMessage = () => {
      const s = session();
      if (!s) {
        console.error("no session");
        return;
      }
      if (!s.user) {
        console.error("no user");
        return;
      }
      const userId = s.user.id;
      if (!userId) throw new Error("No user id");
      const id = Math.random().toString(36).substring(2);

      return {
        action: "ping",
        payload: {
          userId,
          id,
        },
      } as WebsocketMessage<
        "ping",
        {
          userId: string;
          id: string;
        }
      >;
    };

    const handlers = {
      open: () => {
        console.log("open");
        const s = session();
        if (!s) {
          console.error("no session");
          return;
        }
        if (!s.user) {
          console.error("no user");
          return;
        }
        const userId = s.user.id;
        if (!userId) {
          return;
        }
        try {
          const pm = createPingMessage();
          if (!pm) return;
          props.emitter.emit("send", { action: "send", payload: pm });
        } catch (e) {
          console.error("unable to send ping message", e);
          toast.error("Could not connect to server, check console for details");
        }
      },
      close: (e: any) => {
        console.log("ws closed", e);
        toast.info("Disconnected from server");
      },
      error: (e: any) => {
        console.log("ws errored", e);
        toast.error("Could not connect to server");
      },
    };
    onMount(() => {
      if (props.websocket) {
        props.websocket.addEventListener("open", handlers.open);
        props.websocket.addEventListener("close", handlers.close);
        props.websocket.addEventListener("error", handlers.error);
      }
    });

    onCleanup(() => {
      if (props.websocket) {
        // props.websocket.removeEventListener("message", handlers.message);
        props.websocket.removeEventListener("open", handlers.open);
        props.websocket.removeEventListener("close", handlers.close);
        props.websocket.removeEventListener("error", handlers.error);
      }
    });

    return {
      ws: props.websocket,
      send: props.emitter.emit.bind(props.emitter.emit, "send"),
      subscribe: (type: Parameters<typeof props.emitter.on>[0]) => props.emitter.on.bind(props.emitter.on, type),
    };
  },
);
