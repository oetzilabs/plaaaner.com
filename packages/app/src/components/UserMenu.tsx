import { UserSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A, useAction, useSubmission } from "@solidjs/router";
import {
  Cloud,
  CreditCard,
  Github,
  Group,
  Keyboard,
  LifeBuoy,
  Loader2,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Plus,
  Settings,
  Settings2,
  Sun,
  User,
  UserPlus,
} from "lucide-solid";
import { Match, Show, Switch } from "solid-js";
import { logout } from "../utils/api/actions";
import { As, useColorMode } from "@kobalte/core";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserMenu(props: { user: UserSession["user"] }) {
  const isLoggingOut = useSubmission(logout);
  const logoutAction = useAction(logout);

  const { setColorMode, colorMode } = useColorMode();
  return (
    <div class="w-max flex text-base">
      <Switch
        fallback={
          <A
            href="/auth/login"
            class={cn(buttonVariants({ variant: "outline" }), "flex flex-row gap-2 items-center justify-start w-full")}
          >
            <LogIn class="size-4" />
            Login
          </A>
        }
      >
        <Match when={props.user !== null && props.user}>
          {(user) => (
            <DropdownMenu placement="bottom" gutter={8}>
              <DropdownMenuTrigger asChild>
                <As
                  component={Button}
                  variant="default"
                  class="flex flex-row items-center justify-center size-8 p-0 rounded-full"
                >
                  <User class="size-4" />
                </As>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuGroupLabel>My Account</DropdownMenuGroupLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild class="cursor-pointer">
                    <As component={A} href="/profile">
                      <User class="size-4" />
                      <span>Profile</span>
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </As>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild class="cursor-pointer">
                    <As component={A} href="/profile/settings#billing">
                      <CreditCard class="size-4" />
                      <span>Billing</span>
                      <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </As>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild class="cursor-pointer">
                    <As component={A} href="/profile/settings">
                      <Settings class="size-4" />
                      <span>Settings</span>
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </As>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Keyboard class="size-4" />
                    <span>Keyboard shortcuts</span>
                    <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Group class="size-4" />
                    <span>Team</span>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger class="gap-2">
                      <UserPlus class="size-4" />
                      <span>Invite users</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>
                        <i class="i-lucide:mail mr-2" />
                        <span>Email</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <i class="i-lucide:message-square mr-2" />
                        <span>Message</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <i class="ilucide:plus-circle mr-2" />
                        <span>More...</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem>
                    <Plus class="size-4" />
                    <span>New Team</span>
                    <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger class="gap-2 items-center">
                    <Show when={colorMode() === "light"} fallback={<Sun class="size-4" />}>
                      <Moon class="size-4" />
                    </Show>
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onSelect={() => {
                        setColorMode("light");
                      }}
                    >
                      <Sun class="size-4" />
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setColorMode("dark");
                      }}
                    >
                      <Moon class="size-4" />
                      <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => {
                        setColorMode("system");
                      }}
                    >
                      <Monitor class="size-4" />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem>
                  <Github class="size-4" />
                  <span>GitHub</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LifeBuoy class="size-4" />
                  <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Cloud class="size-4" />
                  <span>API</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="cursor-pointer"
                  disabled={isLoggingOut.pending}
                  onSelect={async () => {
                    await logoutAction();
                  }}
                >
                  <LogOut class="size-4" />
                  <span>Log out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </Match>
      </Switch>
    </div>
  );
}
