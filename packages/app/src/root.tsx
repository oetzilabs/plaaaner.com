// @refresh reload
import { Header } from "@/components/Header";
import { Providers } from "@/components/providers";
import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from "@kobalte/core";
import { Suspense, useContext } from "solid-js";
import { isServer } from "solid-js/web";
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, ServerContext, Title } from "solid-start";
import { Footer } from "./components/Footer";
import "./root.css";
import { Layout } from "@/components/providers/Layout";

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
                <Layout>
                  <Routes>
                    <FileRoutes />
                  </Routes>
                </Layout>
              </Providers>
            </ColorModeProvider>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
