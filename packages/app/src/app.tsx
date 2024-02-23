// @refresh reload
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from "@kobalte/core";
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { AlertCircleIcon, CheckCheck, Info, Loader2 } from "lucide-solid";
import { Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import { Toaster } from "solid-sonner";
// import { getCookie } from "vinxi/http";
import "./app.css";
import { SessionProvider } from "./components/SessionProvider";

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
      },
    },
  });

  const storageManager = cookieStorageManagerSSR(isServer ? "kb-color-mode=dark" : document.cookie);
  return (
    <QueryClientProvider client={queryClient}>
      <SolidQueryDevtools initialIsOpen={false} />
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
                  <Header />
                  <div
                    class="w-full flex flex-col container px-4"
                    style={{
                      "flex-grow": "1",
                    }}
                  >
                    <SessionProvider>{props.children}</SessionProvider>
                  </div>
                  <Footer />
                </ColorModeProvider>
              </Suspense>
            </MetaProvider>
          </>
        )}
      >
        <FileRoutes />
      </Router>
    </QueryClientProvider>
  );
}
