import { cn } from "@/lib/utils";
import { As } from "@kobalte/core";
import { A, useLocation, useResolvedPath } from "@solidjs/router";
import { Bell, Box, Circle, HelpCircle, LayoutDashboard, MessageCircle, Settings2 } from "lucide-solid";
import { JSXElement, Show } from "solid-js";
import ModeToggle from "./ModeToogle";
import { OrganizationWorkspaceSelection } from "./OrganizationWorkspaceSelection";
import { useSession } from "./SessionProvider";
import UserMenu from "./UserMenu";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const SidebarLink = (props: {
  href: string;
  icon?: JSXElement;
  children: string;
  variant?: "default" | "outline";
  class?: string;
}) => {
  const v = props.variant || "default";
  const localClass = props.class || "";
  const l = useLocation();
  const pathname = useResolvedPath(() => l.pathname);
  const isActive = () => pathname()?.startsWith(props.href) ?? false;

  return (
    <A href={props.href}>
      <Tooltip placement="right">
        <TooltipTrigger asChild>
          <As
            component={Button}
            variant={isActive() ? "default" : props.variant ?? "outline"}
            class={cn(
              "size-10 flex flex-col items-center justify-center rounded-full",
              {
                "dark:text-indigo-500 text-white": isActive(),
              },
              localClass
            )}
          >
            <Show
              when={props.icon !== undefined && props.icon}
              fallback={<Circle class="size-4" fill="currentColor" />}
            >
              {(icon) => icon()}
            </Show>
          </As>
        </TooltipTrigger>
        <TooltipContent>{props.children}</TooltipContent>
      </Tooltip>
    </A>
  );
};

export const Sidebar = () => {
  const userSession = useSession();

  return (
    <div class="relative w-max flex flex-col gap-0 border-r border-neutral-200 dark:border-neutral-800 grow min-h-0 max-h-screen">
      <Show
        when={typeof userSession !== "undefined" && userSession().user !== null && userSession()}
        fallback={
          <div class="w-full p-4 flex flex-col gap-2">
            <div class="w-full flex flex-col gap-2">
              <Skeleton class="w-full size-10 rounded-full" />
              <Skeleton class="w-full size-10 rounded-full" />
              <Skeleton class="w-full size-10 rounded-full" />
              <Skeleton class="w-full size-10 rounded-full" />
            </div>
          </div>
        }
      >
        {(s) => (
          <div class="flex flex-col gap-0 w-full grow h-full">
            <div class="w-full flex flex-col gap-2">
              <OrganizationWorkspaceSelection />
              <div class="w-full h-max flex flex-col px-4 gap-2">
                <SidebarLink href="/dashboard" icon={<LayoutDashboard class="size-4" />}>
                  Dashboard
                </SidebarLink>
                <SidebarLink href="/dashboard/notifications" icon={<Bell class="size-4" />}>
                  Inbox
                </SidebarLink>
                <SidebarLink href="/dashboard/activity">Activities</SidebarLink>
              </div>
            </div>
            <div class="w-full grow flex flex-col gap-6"></div>
            <div class="w-full flex items-center flex-col p-4 gap-2">
              <SidebarLink href="/help/faq" icon={<HelpCircle class="size-4" />}>
                FAQ
              </SidebarLink>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
};
