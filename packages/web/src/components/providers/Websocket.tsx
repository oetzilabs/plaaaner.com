import type { WebsocketMessage, WebsocketMessageProtocol } from "@/core/entities/websocket";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { createContextProvider } from "@solid-primitives/context";
import { Emitter, EmitterOn, Listener } from "@solid-primitives/event-bus";
import { ReconnectingWebSocket } from "@solid-primitives/websocket";
import { createAsync } from "@solidjs/router";
import { T } from "node_modules/@kobalte/core/dist/toggle-button-root-1cfacf95";
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
        console.log("opened websocket");
        const s = session();
        if (!s) {
          console.error("no session");
          return;
        }
        if (!s.user) {
          console.error("no logged in user, unable to send ping message");
          return;
        }
        const userId = s.user.id;
        if (!userId) {
          console.error("no user id, unable to send ping message");
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
      },
      error: (e: any) => {
        console.log("ws errored", e);
      },
    };

    onMount(() => {
      if (props.websocket) {
        props.websocket.addEventListener("open", handlers.open);
        props.websocket.addEventListener("close", handlers.close);
        props.websocket.addEventListener("error", handlers.error);
      }
      onCleanup(() => {
        if (props.websocket) {
          // props.websocket.removeEventListener("message", handlers.message);
          props.websocket.removeEventListener("open", handlers.open);
          props.websocket.removeEventListener("close", handlers.close);
          props.websocket.removeEventListener("error", handlers.error);
        }
      });
    });

    return {
      ws: props.websocket,
      send: props.emitter.emit.bind(props.emitter.emit, "send"),
      subscribe: <T extends Parameters<typeof props.emitter.on>[0]>(type: T) =>
        props.emitter.on.bind(props.emitter.on, type),
    };
  },
);
