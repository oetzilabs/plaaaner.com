import { As } from "@kobalte/core";
import { A, useNavigate } from "@solidjs/router";
import { For, JSX, createSignal } from "solid-js";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/custom/logo";
import { TextField, TextFieldInput, TextFieldLabel } from "@/components/ui/textfield";
import { cn } from "@/lib/utils";
import { SVGAttributes } from "lucide-solid/dist/types/types";
import { toast } from "solid-sonner";
import { loginViaEmail } from "@/lib/api/user";
import { useSubmission, useAction } from "@solidjs/router"

const generateAuthUrl = (provider: string) => {
  const url = new URL("/authorize", import.meta.env.VITE_AUTH_URL);
  url.searchParams.set("provider", provider);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", provider);
  url.searchParams.set(
    "redirect_uri",
    (import.meta.env.NODE_ENV === "production" ? "https://plaaaner.com" : "http://localhost:3000") +
      "/api/auth/callback",
  );
  return url.toString();
};

const logins = {
  google: generateAuthUrl("google"),
} as const;
export type Logins = keyof typeof logins;
const logos: Record<Logins, (props: SVGAttributes) => JSX.Element> = {
  google: (props: SVGAttributes) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 13.9V10.18H21.36C21.5 10.81 21.61 11.4 21.61 12.23C21.61 17.94 17.78 22 12.01 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C14.7 2 16.96 2.99 18.69 4.61L15.85 7.37C15.13 6.69 13.88 5.88 12 5.88C8.69 5.88 5.99 8.63 5.99 12C5.99 15.37 8.69 18.12 12 18.12C15.83 18.12 17.24 15.47 17.5 13.9H12Z"
        fill="currentColor"
      ></path>
    </svg>
  ),
};

const randomPersonTesimonial = {
  name: "Özgür Isbert",
  title: "CEO",
  testimonial: "I might be biased, but it works as if I made it myself - It's that good.",
};

export default function LoginPage() {

  const loginWithEmail = useAction(loginViaEmail);
  const isLogginInViaEmail = useSubmission(loginViaEmail);


  const navigate = useNavigate();


  const [email, setEmail] = createSignal("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const _email = email();
    toast.info("Login via Email is not implemented yet");
    const result = await loginWithEmail(_email);
  };


  return (
    <div class="container h-screen flex flex-col items-center justify-center px-10">
      <div class="w-full h-[650px] -mt-60 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-clip">
        <div class="w-full relative hidden h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
          <div class="relative hidden h-full flex-col bg-muted p-10 dark:border-r lg:flex">
            <div class="absolute inset-0 bg-[#4F46E4]/5" />
            <div class="relative z-20 flex items-center text-lg font-medium gap-2">
              <Logo />
              Plaaaner
            </div>
            <div class="relative z-20 mt-auto">
              <blockquote class="space-y-2">
                <p class="">&ldquo;{randomPersonTesimonial.testimonial}&rdquo;</p>
                <p class="text-sm">
                  {randomPersonTesimonial.name} - {randomPersonTesimonial.title}
                </p>
              </blockquote>
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
                    disabled={isLogginInViaEmail.pending}
                  />
                </TextField>
                <Button
                  variant="default"
                  size="lg"
                  type="submit"
                  class={cn("w-full", {
                    "opacity-50 cursor-not-allowed": isLogginInViaEmail.pending,
                  })}
                  aria-busy={isLogginInViaEmail.pending}
                  aria-label="Continue with Email"
                  disabled={isLogginInViaEmail.pending}
                >
                  <span>Continue with Email</span>
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
                <For each={Object.entries(logins) as [Logins, string][]}>
                  {([provider, url]) => {
                    const L = logos[provider];
                    return (
                      <Button asChild variant="default" size="lg" class="!w-full">
                        <As
                          component={A}
                          href={url}
                          class="flex items-center justify-center w-max text-sm font-medium gap-4 capitalize"
                        >
                          <L class="h-5 w-5" />
                          <span>{provider}</span>
                        </As>
                      </Button>
                    );
                  }}
                </For>
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
