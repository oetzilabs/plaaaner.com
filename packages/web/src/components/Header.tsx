import { A, createAsync } from "@solidjs/router";
import { LogIn } from "lucide-solid";
import { Match, Show, Switch } from "solid-js";
import { getAuthenticatedSession } from "../lib/auth/util";
import { cn } from "../lib/utils";
import { AppSearch } from "./AppSearch";
// import { AppSearch } from "./AppSearch";
import { useSession } from "./SessionProvider";
import { Button, buttonVariants } from "./ui/button";
import { Logo } from "./ui/custom/logo";
import UserMenu from "./UserMenu";

export function Header() {
  const session = createAsync(() => getAuthenticatedSession());

  return (
    <header class="bg-neutral-50/[0.3] dark:bg-black/[0.3] backdrop-blur-md flex flex-row border-b border-neutral-200 dark:border-neutral-800 w-full py-2 items-center justify-between">
      <div class="flex flex-row w-full items-center justify-between px-4 container">
        <div class="flex flex-row items-center justify-start w-max gap-2">
          <A href="/" class="flex flex-row gap-4 items-center justify-center">
            <Logo small />
          </A>
        </div>
        <div class="w-full flex flex-col items-center justify-center">
          <AppSearch />
        </div>
        <div class="w-max items-center justify-end flex flex-row gap-2">
          <div class="w-max flex text-base">
            <Switch
              fallback={
                <A
                  href="/auth/login"
                  class={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "flex flex-row gap-2 items-center justify-start w-full",
                  )}
                >
                  <LogIn class="size-4" />
                  Login
                </A>
              }
            >
              <Match when={session() && session()!.user !== null && session()!.user}>
                {(user) => <UserMenu user={user()} />}
              </Match>
              <Match when={!session() || session()!.user === null}>
                <Button
                  as={A}
                  href="/auth/login"
                  variant="outline"
                  size="sm"
                  class="flex flex-row gap-2 items-center justify-center w-max"
                >
                  <LogIn class="size-3" />
                  Login
                </Button>
              </Match>
            </Switch>
          </div>
        </div>
      </div>
    </header>
  );
}
