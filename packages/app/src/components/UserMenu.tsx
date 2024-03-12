import { getAuthenticatedUser, UserSession } from "@/lib/auth/util";
import { As } from "@kobalte/core";
import { A, createAsync } from "@solidjs/router";
import { LayoutDashboard, LogIn, LogOut, Settings2, User } from "lucide-solid";
import { Match, Switch } from "solid-js";
import { logout } from "../utils/api/actions";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function UserMenu(props: { user: UserSession["user"] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <As component={Button} size={props.user !== null ? "sm": "icon" }variant="ghost" class="rounded-md gap-2 items-center">
          <User class="size-4" />
          <Switch>
            <Match when={props.user}>{(user) => <span class="text-muted-foreground">{user().name}</span>}</Match>
          </Switch>
        </As>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-[100px]">
        <Switch>
          <Match when={props.user === null}>
            <DropdownMenuItem class="items-center gap-2" asChild>
              <As component={A} href="/auth/login">
                Login
                <LogIn class="h-4 w-4" />
              </As>
            </DropdownMenuItem>
          </Match>
          <Match when={props.user !== null}>
            <DropdownMenuItem class="items-center gap-2" asChild>
              <As component={A} href="/profile">
                <User class="h-4 w-4" />
                Profile
              </As>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form method="post" action={logout}>
              <DropdownMenuItem
                class="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 dark:text-red-400 hover:text-white items-center gap-2"
                asChild
              >
                <As component={"button"} class="w-full cursor-pointer">
                  <LogOut class="h-4 w-4" />
                  Logout
                </As>
              </DropdownMenuItem>
            </form>
          </Match>
        </Switch>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
