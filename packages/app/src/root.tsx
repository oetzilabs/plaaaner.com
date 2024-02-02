// @refresh reload
import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from "@kobalte/core";
import { Suspense, useContext } from "solid-js";
import { isServer } from "solid-js/web";
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title, ServerContext } from "solid-start";
import { Header } from "@/components/Header";
import { Providers } from "@/components/providers";
import "./root.css";

export default function Root() {
  const event = useContext(ServerContext);

  const storageManager = cookieStorageManagerSSR(
    isServer ? event?.request.headers.get("cookie") ?? "" : document.cookie
  );

  return (
    <Html lang="en">
      <Head>
        <Title>plaaaner.com</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <ColorModeScript storageType={storageManager.type} />
            <ColorModeProvider storageManager={storageManager}>
              <Providers>
                <Header />
                <div class="py-10 container flex flex-col px-4">
                  <Routes>
                    <FileRoutes />
                  </Routes>
                </div>
              </Providers>
            </ColorModeProvider>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
