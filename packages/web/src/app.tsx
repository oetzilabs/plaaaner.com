// @refresh reload
import { Header } from "@/components/Header";
import { Websocket } from "@/components/providers/Websocket";
import { Button } from "@/components/ui/button";
import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from "@kobalte/core";
import { createEmitter, createEventBus } from "@solid-primitives/event-bus";
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { AlertCircleIcon, CheckCheck, Info, Loader2 } from "lucide-solid";
import { createSignal, ErrorBoundary, onCleanup, onMount, Show, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import { Toaster } from "solid-sonner";
import { logout } from "./utils/api/actions";
import "./app.css";
import type { WebsocketMessage, WebsocketMessageProtocol } from "@/core/entities/websocket";
import { createReconnectingWS, ReconnectingWebSocket } from "@solid-primitives/websocket";

const [websocket, setWebsocket] = createSignal<ReconnectingWebSocket | null>(null);

export default function App() {
  const wsLink = import.meta.env.VITE_WS_LINK;
  const authLink = import.meta.env.VITE_AUTH_URL;
  if (!wsLink) return <div>No Websocket Link in Environtment</div>;
  if (!authLink) return <div>No Auth Link in Environtment</div>;
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 5000,
        refetchOnWindowFocus: false,
      },
    },
  });

  const bus = createEventBus<WebsocketMessage<string, unknown>>();
  const emitter = createEmitter<WebsocketMessageProtocol>();

  onMount(() => {
    let ws = websocket();
    if (!ws) {
      const webs = createReconnectingWS(wsLink);
      setWebsocket(webs);
      ws = webs;
    }

    emitter.on("send", (data) => {
      // console.log("send", data.payload);

      ws.send(JSON.stringify(data.payload));
    });

    emitter.on("message", (data) => {
      // console.log("message", data);
      bus.emit(data);
    });

    emitter.on("clear", () => {
      bus.clear();
    });

    const { clear, listen } = bus;

    const unsub = listen((data) => {
      console.info("[WS] Received message", data);
      // @ts-expect-error
      emitter.emit(data.action, data);
    });

    onCleanup(() => {
      ws.close();
      emitter.clear();
      clear();
      unsub();
    });
    ws.addEventListener("message", (e) => {
      // console.log("message", e);
      const data = JSON.parse(e.data);
      const { action, payload } = data;
      // console.log("received message", action, payload);
      emitter.emit(action, {
        action,
        payload,
      });
    });
  });

  //eslint-disable-next-line no-undef
  const storageManager = cookieStorageManagerSSR(isServer ? "kb-color-mode=dark" : document.cookie);
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div class="fixed z-[99999] flex flex-row items-center justify-center inset-0 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
          <div class="flex flex-col gap-6 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-950 items-center justify-center">
            <span class="text-red-500 font-bold">Something went wrong...</span>
            <Show when={error !== null && Object.keys(error).length > 0 && error} keyed>
              {(e) => <pre class="font-mono w-96 h-80 overflow-x-scroll">{JSON.stringify(e, null, 2)}</pre>}
            </Show>
            <div class="flex flex-row gap-2 w-max">
              <Button onClick={() => reset()}>RESET</Button>
              <form action={logout} method="post">
                <Button type="submit">LOGOUT</Button>
              </form>
            </div>
          </div>
        </div>
      )}
    >
      <QueryClientProvider client={queryClient}>
        {/*<SolidQueryDevtools initialIsOpen={false} />*/}
        <Router
          root={(props) => (
            <>
              <MetaProvider>
                <Title>Plaaaner.com</Title>
                <Suspense
                // fallback={
                //   <div class="w-full flex flex-col items-center justify-center h-screen bg-background text-muted-foreground gap-2">
                //     <Loader2 class="size-4 animate-spin" />
                //     Loading Page
                //   </div>
                // }
                >
                  <ColorModeScript storageType={storageManager.type} initialColorMode="system" />
                  <ColorModeProvider storageManager={storageManager}>
                    <Toaster
                      position="bottom-right"
                      duration={5000}
                      theme="system"
                      icons={{
                        info: <Info class="size-4" />,
                        success: <CheckCheck class="size-4" />,
                        error: <AlertCircleIcon class="size-4" />,
                        loading: <Loader2 class="size-4 animate-spin" />,
                        warning: <AlertCircleIcon class="size-4" />,
                      }}
                      gap={4}
                    />
                    <div
                      class="w-full flex flex-col"
                      style={{
                        "flex-grow": "1",
                        "min-height": "100vh",
                      }}
                    >
                      <Websocket websocket={websocket()} emitter={emitter}>
                        <Header />
                        {props.children}
                      </Websocket>
                    </div>
                  </ColorModeProvider>
                </Suspense>
              </MetaProvider>
            </>
          )}
        >
          <FileRoutes />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
