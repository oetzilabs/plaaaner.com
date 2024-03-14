import { UserSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A } from "@solidjs/router";
import { LogIn, LogOut, User } from "lucide-solid";
import { Match, Switch } from "solid-js";
import { logout } from "../utils/api/actions";
import { Button, buttonVariants } from "./ui/button";

export default function UserMenu(props: { user: UserSession["user"] }) {
  return (
    <div class="w-full items-center justify-between flex flex-row gap-2 text-base">
      <Switch
        fallback={
          <A
            href=""
            class={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "gap-2 items-center justify-start flex flex-row w-full"
            )}
          >
            <LogIn class="size-4" />
            Login
          </A>
        }
      >
        <Match when={props.user !== null}>
          <A
            href="/profile"
            class={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
              }),
              "gap-2 items-center w-full justify-start flex flex-row"
            )}
          >
            <User class="size-4" />
            <Switch>
              <Match when={props.user}>{(user) => <span class="text-muted-foreground">{user().name}</span>}</Match>
            </Switch>
          </A>
          <div class="w-max">
            <form method="post" action={logout}>
              <Button variant="outline" size="icon" class="size-10" type="submit">
                <LogOut class="size-4" />
              </Button>
            </form>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
