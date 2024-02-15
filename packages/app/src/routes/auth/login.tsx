import { createQuery } from "@tanstack/solid-query";
import { Queries } from "../../utils/api/queries";
import { For, Match, Switch } from "solid-js";
import { useAuthentication } from "../../components/providers/Authentication";
import { redirect } from "solid-start";
import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { As } from "@kobalte/core";
import { Button } from "../../components/ui/button";
import { isServer } from "solid-js/web";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  const authentication = useAuthentication();
  if (authentication.isAuthenticated) {
    return redirect("/dashboard", 303);
  }
  const loginProviders = createQuery(() => ({
    queryKey: ["login-providers"],
    queryFn: async () => {
      return Queries.Auth.loginProviders();
    },
    get enabled() {
      return !authentication.isAuthenticated && !isServer;
    },
  }));

  return (
    <div class="flex flex-col gap-2 items-center">
      <div class="py-20 pb-24 flex flex-col gap-20 items-center w-full">
        <div class="flex flex-col gap-6 items-center border border-neutral-200 dark:border-neutral-800 p-8 rounded-md">
          <span class="text-xl font-bold capitalize text-center">Sign in to your account</span>
          <div class="flex flex-col gap-4 items-center w-full">
            <Switch>
              <Match when={loginProviders.isPending}>
                <For each={[1, 2, 3]}>{(i) => <Skeleton class="w-full" />}</For>
              </Match>
              <Match when={loginProviders.isError}>Error: {loginProviders.error?.message}</Match>
              <Match when={loginProviders.isSuccess && loginProviders.data}>
                {(data) => (
                  <For each={data()}>
                    {(provider) => (
                      <Button asChild variant="default" size="lg" class="!w-full">
                        <As
                          component={A}
                          href={provider.url}
                          class="flex items-center justify-center w-max text-sm font-medium gap-4"
                        >
                          <Show when={authentication.lastUsedProvider() === provider.name}>
                            <div class="h-1 w-1 bg-green-500 rounded-full animate-pulse"></div>
                          </Show>
                          <img src={provider.logo} class="h-4 w-4" alt={provider.name} />
                          <span>{provider.name}</span>
                        </As>
                      </Button>
                    )}
                  </For>
                )}
              </Match>
            </Switch>
          </div>
          <div class="flex gap-1 text-xs w-full">
            By signing in, you agree to our{" "}
            <A href="/terms-of-service" class="text-blue-500 underline">
              Terms of Service
            </A>
            and
            <A href="/privacy" class="text-blue-500 underline">
              Privacy Policy
            </A>
          </div>
        </div>
      </div>
    </div>
  );
}
