import { getAuthenticatedUser } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { As } from "@kobalte/core";
import { A, createAsync, useAction } from "@solidjs/router";
import { LayoutDashboard, LogIn, LogOut, Settings2, User } from "lucide-solid";
import { Match, Show, Switch } from "solid-js";
import { logout } from "../utils/api/actions";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function UserMenu() {
  const user = createAsync(() => getAuthenticatedUser(), { deferStream: true });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <As
          component={Button}
          variant="ghost"
          size="icon"
          class={cn("w-max flex flex-row gap-3 h-9 p-1 rounded-full", {
            "pr-4": user(),
          })}
        >
          <div class="bg-secondary rounded-full p-2">
            <User class="h-4 w-4" />
          </div>
          <Show when={user()} fallback={<span class="sr-only">User menu</span>}>
            {(s) => <span class="">{s().username}</span>}
          </Show>
        </As>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-[100px]">
        <Switch>
          <Match when={!user()}>
            <DropdownMenuItem class="items-center gap-2" asChild>
              <As component={A} href="/auth/login">
                Login
                <LogIn class="h-4 w-4" />
              </As>
            </DropdownMenuItem>
          </Match>
          <Match when={user()}>
            <DropdownMenuItem class="items-center gap-2" asChild>
              <As component={A} href="/dashboard">
                <LayoutDashboard class="h-4 w-4" />
                Dashboard
              </As>
            </DropdownMenuItem>
            <DropdownMenuItem class="items-center gap-2" asChild>
              <As component={A} href="/profile">
                <User class="h-4 w-4" />
                Profile
              </As>
            </DropdownMenuItem>
            <DropdownMenuItem asChild class="items-center gap-2">
              <As component={A} href="/profile/settings">
                <Settings2 class="h-4 w-4" />
                Settings
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
