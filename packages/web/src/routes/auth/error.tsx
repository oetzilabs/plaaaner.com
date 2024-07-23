import { A, useSearchParams } from "@solidjs/router";
import { Button } from "../../components/ui/button";

export default function LoginErrorPage() {
  const [sp] = useSearchParams();
  const error = sp.error || "unknown";

  return (
    <div class="w-full h-screen flex flex-col items-center justify-center">
      <div class="w-full h-[650px] -mt-60 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-clip">
        <div class="w-full relative h-full flex-col items-center justify-center flex lg:max-w-none ">
          <div class="p-8">
            <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
              <div class="flex flex-col space-y-2 text-center">
                <h1 class="text-2xl font-semibold tracking-tight">Upps some error occured</h1>
                <p class="text-sm text-muted-foreground">
                  {error === "invalid_code" && "The code is invalid"}
                  {error === "missing_access_token" && "The access token is missing"}
                  {error === "missing_user" && "The user is missing"}
                  {error === "missing_workspace" && "The workspace is missing"}
                  {error === "unknown" && "An unknown error occured"}
                </p>
              </div>
              <Button
                variant="default"
                size="lg"
                type="submit"
                aria-label="Go to the login page"
                as={A}
                href="/auth/login"
              >
                <span>Login again</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
