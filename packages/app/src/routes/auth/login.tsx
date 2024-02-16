import { Skeleton } from "@/components/ui/skeleton";
import { As } from "@kobalte/core";
import { A } from "@solidjs/router";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { setCookie } from "vinxi/http";
import { lastUsedProvider, setAuth, setAuthLoggedin } from "../../components/providers/Authentication";
import { Button } from "../../components/ui/button";
import { Logo } from "../../components/ui/custom/logo";
import { TextField, TextFieldInput, TextFieldLabel } from "../../components/ui/textfield";
import { cn } from "../../lib/utils";
import { Queries } from "../../utils/api/queries";

export default function LoginPage() {
  const navigate = useNavigate();

  const loginProviders = createQuery(() => ({
    queryKey: ["login-providers"],
    queryFn: async () => {
      return Queries.Auth.loginProviders();
    },
    refetchOnWindowFocus: false,
  }));

  const randomTestimonial = createQuery(() => ({
    queryKey: ["randomTestimonial"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 1000));
      return Queries.Testimonials.getRandom();
    },
  }));

  const loginViaEmail = createMutation(() => ({
    mutationKey: ["login-via-email"],
    mutationFn: async (email: string) => {
      return Queries.Auth.loginViaEmail(email);
    },
    async onSuccess(data, variables, context) {
      setCookie("session", data.token, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        expires: new Date(Date.now() + 60 * 60 * 24 * 7),
        path: "/",
      });
      setCookie("lastUsedProvider", "email", {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        expires: new Date(Date.now() + 60 * 60 * 24 * 7),
        path: "/",
      });
      setAuthLoggedin(true);
      setAuth(data.user);

      navigate("/");
    },
  }));

  const [email, setEmail] = createSignal("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const _email = email();
    await loginViaEmail.mutateAsync(_email);
  };

  return (
    <div class="w-full h-screen flex flex-col items-center justify-center">
      <div class="w-full h-[650px] -mt-60 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-clip">
        <div class="w-full relative hidden h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
          <div class="relative hidden h-full flex-col bg-muted p-10 dark:border-r lg:flex">
            <div class="absolute inset-0 bg-[#4F46E4]/5" />
            <div class="relative z-20 flex items-center text-lg font-medium gap-2">
              <Logo />
              Plaaaner
            </div>
            <div class="relative z-20 mt-auto">
              <Switch>
                <Match when={randomTestimonial.isPending}>
                  <Skeleton class="w-full" />
                  <Skeleton class="w-3/4" />
                </Match>
                <Match when={randomTestimonial.isSuccess && randomTestimonial.data}>
                  {(data) => (
                    <blockquote class="space-y-2">
                      <p class="">&ldquo;{data().testimonial}&rdquo;</p>
                      <p class="text-sm">
                        {data().name} - {data().title}
                      </p>
                    </blockquote>
                  )}
                </Match>
              </Switch>
            </div>
          </div>
          <div class="p-8 w-full">
            <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
              <div class="flex flex-col space-y-2 text-center">
                <h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
                <p class="text-sm text-muted-foreground">Enter your email below to create your account</p>
              </div>
              <form class="flex flex-col gap-4 items-center w-full" onSubmit={handleSubmit}>
                <TextField
                  class="w-full"
                  onChange={(v) => {
                    setEmail(v);
                  }}
                  value={email()}
                >
                  <TextFieldLabel class="sr-only">Email</TextFieldLabel>
                  <TextFieldInput
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autocomplete="email"
                    autocorrect="off"
                    class="w-full"
                    disabled={loginViaEmail.isPending}
                  />
                </TextField>
                <Button
                  variant="default"
                  size="lg"
                  type="submit"
                  class={cn("w-full", {
                    "opacity-50 cursor-not-allowed": loginViaEmail.isPending,
                  })}
                  aria-busy={loginViaEmail.isPending}
                  aria-label="Continue with Email"
                  disabled={loginViaEmail.isPending}
                >
                  <span>Continue with Email</span>
                  <Show when={lastUsedProvider() === "email"}>
                    <div class="h-1 w-1 bg-green-500 rounded-full animate-pulse"></div>
                  </Show>
                </Button>
              </form>
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <span class="w-full border-t" />
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                  <span class="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <div class="flex flex-col gap-4 items-center w-full">
                <Switch>
                  <Match when={loginProviders.isLoading}>
                    <For each={[1, 2]}>{(i) => <Skeleton class="w-full h-10" />}</For>
                  </Match>
                  <Match when={loginProviders.isPending}>
                    <For each={[1, 2]}>{(i) => <Skeleton class="w-full h-10" />}</For>
                  </Match>
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
                              <Show when={lastUsedProvider() === provider.name}>
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
              <div class="px-8 text-center text-sm text-muted-foreground">
                <span>By continuing, you agree to our</span>
                <div class="">
                  <A href="/terms-of-service" class="underline underline-offset-4 hover:text-primary">
                    Terms of Service
                  </A>{" "}
                  and{" "}
                  <A href="/privacy" class="underline underline-offset-4 hover:text-primary">
                    Privacy Policy
                  </A>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
