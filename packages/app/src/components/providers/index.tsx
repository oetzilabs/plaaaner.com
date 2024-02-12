import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { AlertCircleIcon, CheckCheck, Info, Loader2 } from "lucide-solid";
import { Toaster } from "solid-sonner";

const queryClient = new QueryClient();
export const Providers = (props: { children: any }) => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SolidQueryDevtools initialIsOpen={false} />
        {props.children}
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
      </QueryClientProvider>
    </>
  );
};
