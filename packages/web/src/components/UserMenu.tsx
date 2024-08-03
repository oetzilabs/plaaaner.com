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
import { UserSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { useColorMode } from "@kobalte/core";
import { A, useAction, useSubmission } from "@solidjs/router";
import {
  Cloud,
  CreditCard,
  Github,
  Group,
  Keyboard,
  LifeBuoy,
  LogIn,
  LogOut,
  Mail,
  MessageSquare,
  Monitor,
  Moon,
  Plus,
  Settings,
  Sun,
  User,
  UserPlus,
} from "lucide-solid";
import { Match, Show, Switch } from "solid-js";
import { logout } from "../utils/api/actions";

export default function UserMenu(props: { user: UserSession["user"] }) {
  const isLoggingOut = useSubmission(logout);
  const logoutAction = useAction(logout);

  const { setColorMode, colorMode } = useColorMode();

  return (
    <DropdownMenu placement="bottom" gutter={8}>
      <DropdownMenuTrigger
        as={Button}
        variant="default"
        class="flex flex-row items-center justify-center size-8 p-0 rounded-full"
      >
        <User class="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56">
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel>My Account</DropdownMenuGroupLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem as={A} class="cursor-pointer" href="/profile">
            <User class="size-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem as={A} class="cursor-pointer" href="/profile/settings#billing">
            <CreditCard class="size-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem as={A} class="cursor-pointer" href="/profile/settings">
            <Settings class="size-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Keyboard class="size-4" />
            <span>Keyboard shortcuts</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Group class="size-4" />
            <span>Workspace</span>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger class="gap-2">
              <UserPlus class="size-4" />
              <span>Invite users</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>
                <Mail class="size-4" />
                <span>Email</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare class="size-4" />
                <span>Message</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Plus class="size-4" />
                <span>More...</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <Plus class="size-4" />
            <span>New Workpace</span>
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
          class="cursor-pointer text-rose-500 hover:!text-rose-500 hover:!bg-rose-50"
          disabled={isLoggingOut.pending}
          onSelect={async () => {
            await logoutAction();
          }}
        >
          <LogOut class="size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
