import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Toaster } from "solid-toast";

const queryClient = new QueryClient();
export const Providers = (props: { children: any }) => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        {props.children}
        <Toaster
          position="bottom-right"
          gutter={8}
          toastOptions={{
            duration: 2000,
          }}
        />
      </QueryClientProvider>
    </>
  );
};
