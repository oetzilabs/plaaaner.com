// @refresh reload
import { Header } from "@/components/Header";
import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from "@kobalte/core";
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { AlertCircleIcon, CheckCheck, Info, Loader2 } from "lucide-solid";
import { ErrorBoundary, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import { Toaster } from "solid-sonner";
import { SessionProvider } from "@/components/SessionProvider";
import { WebsocketProvider } from "@/components/providers/Websocket";
import { Button } from "@/components/ui/button";
import { logout } from "./utils/api/actions";
import "./app.css";

// const getServerCookies = () => {
//   "use server";

//   const colorMode = getCookie("kb-color-mode");
//   return colorMode ? `kb-color-mode=${colorMode}` : "";
// };

export default function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 5000,
        refetchOnWindowFocus: false,
      },
    },
  });

  const storageManager = cookieStorageManagerSSR(isServer ? "kb-color-mode=dark" : document.cookie);
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div class="fixed z-[99999] flex flex-row items-center justify-center inset-0 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50]">
          <div class="flex flex-col gap-2">
            <span class="text-red-500 font-bold">Some Error occured...</span>
            <pre>{JSON.stringify(error, null, 2)}</pre>
            <Button onClick={() => reset()}>RESET</Button>
            <form action={logout} method="post">
              <Button type="submit">LOGOUT</Button>
            </form>
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
                <Suspense>
                  <ColorModeScript storageType={storageManager.type} initialColorMode="system" />
                  <ColorModeProvider storageManager={storageManager}>
                    <Toaster
                      position="bottom-right"
                      duration={5000}
                      theme="system"
                      icons={{
                        info: <Info class="w-6 h-6" />,
                        success: <CheckCheck class="w-6 h-6" />,
                        error: <AlertCircleIcon class="w-6 h-6" />,
                        loading: <Loader2 class="w-6 h-6 animate-spin" />,
                        warning: <AlertCircleIcon class="w-6 h-6" />,
                      }}
                    />
                    <div
                      class="w-full flex flex-col"
                      style={{
                        "flex-grow": "1",
                        "min-height": "100vh",
                      }}
                    >
                      <SessionProvider>
                        <WebsocketProvider>
                          <Header />
                          {props.children}
                        </WebsocketProvider>
                      </SessionProvider>
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
