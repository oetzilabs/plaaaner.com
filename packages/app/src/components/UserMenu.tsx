import { UserSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A } from "@solidjs/router";
import { LogIn, LogOut, User } from "lucide-solid";
import { Match, Switch } from "solid-js";
import { logout } from "../utils/api/actions";
import { Button, buttonVariants } from "./ui/button";

export default function UserMenu(props: { user: UserSession["user"] }) {
  return (
    <div class="w-full flex text-base">
      <Switch
        fallback={
          <A
            href="/auth/login"
            class={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "flex flex-row gap-2 items-center justify-start w-full rounded-none"
            )}
          >
            <LogIn class="size-4" />
            Login
          </A>
        }
      >
        <Match when={props.user !== null && props.user}>
          {(user) => (
            <div class="rounded-md border border-transparent hover:border-neutral-300 dark:border-neutral-800 flex flex-row items-center justify-between w-full gap-0 overflow-clip">
              <A
                href="/profile"
                class={cn(
                  buttonVariants({
                    variant: "ghost",
                    size: "lg",
                  }),
                  "flex flex-row gap-4 items-center w-full !justify-start rounded-none px-4"
                )}
              >
                <User class="size-5" />
                <span class="w-full">{user().name}</span>
              </A>
              <div class="w-max flex ">
                <form method="post" action={logout}>
                  <Button variant="ghost" size="icon" class="size-10 rounded-none" type="submit">
                    <LogOut class="size-4" />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </Match>
      </Switch>
    </div>
  );
}
