import { cn } from "@/lib/utils";
import { Queries } from "@/utils/api/queries";
import { As } from "@kobalte/core";
import { A, useNavigate } from "@solidjs/router";
import { createQuery, isServer } from "@tanstack/solid-query";
import { LogIn, LogOut, Settings2, User } from "lucide-solid";
import { Match, Show, Switch } from "solid-js";
import { toast } from "solid-sonner";
import { auth, authLoggedin, logout, session, setAuth, setAuthLoggedin } from "./providers/Authentication";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

export default function UserMenu() {
  const navigate = useNavigate();
  const q = createQuery(() => ({
    queryKey: ["auth"],
    queryFn: async () => {
      const token = session();
      if (!token) {
        setAuthLoggedin(false);
        setAuth(null);
        return false;
      }
      const user = await Queries.Auth.session(token);
      if (!user) {
        setAuthLoggedin(false);
        setAuth(null);
        return false;
      }
      setAuth(user);
      setAuthLoggedin(true);
      return true;
    },
    get enabled() {
      const x = authLoggedin();
      return !isServer && !x;
    },
    refetchInterval: 2000,
  }));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <As
          component={Button}
          variant="ghost"
          size="icon"
          class={cn("w-max flex flex-row gap-3 h-9 p-1  rounded-full", {
            "pr-3": authLoggedin(),
          })}
        >
          <div class="bg-secondary rounded-full p-2">
            <User class="h-4 w-4" />
          </div>
          <Show when={authLoggedin() && auth()} fallback={<span class="sr-only">User menu</span>}>
            {(s) => <span class="">{s().username}</span>}
          </Show>
        </As>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-[100px]">
        <Switch>
          <Match when={q.isPending}>
            <DropdownMenuItem asChild>
              <Skeleton class="w-full h-8" />
            </DropdownMenuItem>
          </Match>
          <Match when={q.isError && q.error}>
            {(e) => (
              <DropdownMenuItem
                onSelect={() => {
                  toast.info("An error occurred. Please try again later.", {
                    description: e()?.message ?? "unknown error",
                  });
                  navigate("/auth/login");
                }}
              >
                Error
              </DropdownMenuItem>
            )}
          </Match>
          <Match when={q.isSuccess && !authLoggedin()}>
            <DropdownMenuItem class="items-center gap-2" asChild>
              <As component={A} href="/auth/login">
                Login
                <LogIn class="h-4 w-4" />
              </As>
            </DropdownMenuItem>
          </Match>
          <Match when={q.isSuccess && authLoggedin()}>
            <DropdownMenuItem class="items-center gap-2" asChild>
              <As component={A} href="/profile">
                <User class="h-4 w-4" />
                Profile
              </As>
            </DropdownMenuItem>
            <DropdownMenuItem asChild class="items-center gap-2">
              <As component={A} href="/settings">
                <Settings2 class="h-4 w-4" />
                Settings
              </As>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 dark:text-red-400 hover:text-white items-center gap-2"
              onSelect={async () => {
                await logout();
              }}
            >
              <LogOut class="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </Match>
        </Switch>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
