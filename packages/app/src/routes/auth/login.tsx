import { createQuery } from "@tanstack/solid-query";
import { Queries } from "../../utils/api/queries";
import { For, Match, Switch } from "solid-js";
import { useAuthentication } from "../../components/providers/Authentication";
import { redirect } from "solid-start";
import { Show } from "solid-js";
import { A } from "@solidjs/router";

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
  }));

  return (
    <div class="flex flex-col gap-2 items-center">
      <div class="py-20 pb-24 flex flex-col gap-20 items-center">
        <Switch>
          <Match when={loginProviders.isPending}>Loading...</Match>
          <Match when={loginProviders.isError}>Error: {loginProviders.error?.message}</Match>
          <Match when={loginProviders.isSuccess && loginProviders.data}>
            {(data) => (
              <For each={data()}>
                {(provider) => (
                  <div class="flex flex-row gap-2 items-center">
                    <A href={provider.url}>
                      <img src={provider.logo} class="h-8 w-8" alt={provider.name} />
                      <span>{provider.name}</span>
                      <Show when={authentication.lastUsedProvider() === provider.name}>
                        <div class="h-1 w-1 bg-green-500 rounded-full animate-pulse"></div>
                      </Show>
                    </A>
                  </div>
                )}
              </For>
            )}
          </Match>
        </Switch>
      </div>
    </div>
  );
}
