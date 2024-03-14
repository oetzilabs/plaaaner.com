import { UserSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A } from "@solidjs/router";
import { LogIn, LogOut, User } from "lucide-solid";
import { Match, Switch } from "solid-js";
import { logout } from "../utils/api/actions";
import { Button, buttonVariants } from "./ui/button";

export default function UserMenu(props: { user: UserSession["user"] }) {
  return (
    <div class="w-full items-center justify-between flex flex-row text-base">
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
          <>
          <A
            href="/profile"
            class={cn(
              buttonVariants({
                variant: "ghost",
                size: "lg",
              }),
              "flex flex-row gap-2 items-center w-full justify-start rounded-none px-4"
            )}
          >
            <User class="size-4" />
            <span class="">{user().name}</span>
          </A>
          <div class="w-max">
            <form method="post" action={logout}>
              <Button variant="ghost" size="icon" class="size-10 rounded-none" type="submit">
                <LogOut class="size-4" />
              </Button>
            </form>
          </div>
          </>
        )}
        </Match>
      </Switch>
    </div>
  );
}
