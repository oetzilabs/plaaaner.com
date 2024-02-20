import { getAuthenticatedUser } from "@/lib/auth/util";
import { As } from "@kobalte/core";
import { A, createAsync } from "@solidjs/router";
import { LayoutDashboard, LogIn, LogOut, Settings2, User } from "lucide-solid";
import { Match, Switch } from "solid-js";
import { logout } from "../utils/api/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function UserMenu() {
  const user = createAsync(() => getAuthenticatedUser());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <User class="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-[100px]">
        <Switch>
          <Match when={user() === undefined}>
            <DropdownMenuItem class="items-center gap-2" asChild>
              <As component={A} href="/auth/login">
                Login
                <LogIn class="h-4 w-4" />
              </As>
            </DropdownMenuItem>
          </Match>
          <Match when={user() !== undefined && user() === null}>
            <DropdownMenuItem class="items-center gap-2" asChild>
              <As component={A} href="/auth/login">
                Login
                <LogIn class="h-4 w-4" />
              </As>
            </DropdownMenuItem>
          </Match>
          <Match when={user() !== undefined && user() !== null}>
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
