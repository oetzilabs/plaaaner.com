import { cn } from "@/lib/utils";
import { A, createAsync, useLocation, useResolvedPath } from "@solidjs/router";
import { Activity, Bell, Circle, HelpCircle, LayoutDashboard } from "lucide-solid";
import { For, JSXElement, Show } from "solid-js";
import { getAuthenticatedSession } from "../lib/auth/util";
import { OrganizationWorkspaceSelection } from "./OrganizationWorkspaceSelection";
import { useSession } from "./SessionProvider";
import { Button } from "./ui/button";
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
    <A href={props.href} class="rounded-full">
      <Tooltip placement="right">
        <TooltipTrigger
          as={Button}
          variant={isActive() ? "default" : (props.variant ?? "outline")}
          class={cn(
            "size-10 flex flex-col items-center justify-center rounded-full",
            {
              "dark:text-indigo-500 text-white": isActive(),
            },
            localClass,
          )}
        >
          <Show when={props.icon !== undefined && props.icon} fallback={<Circle class="size-4" fill="currentColor" />}>
            {(icon) => icon()}
          </Show>
        </TooltipTrigger>
        <TooltipContent>{props.children}</TooltipContent>
      </Tooltip>
    </A>
  );
};

export const Sidebar = () => {
  const session = createAsync(() => getAuthenticatedSession());

  const links = [
    { href: "/dashboard", icon: <LayoutDashboard class="size-4" />, label: "Dashboard" },
    { href: "/dashboard/notifications", icon: <Bell class="size-4" />, label: "Inbox" },
    { href: "/dashboard/activity", icon: <Activity class="size-4" />, label: "Activities" },
  ];

  return (
    <div class="relative w-max flex flex-col gap-0 border-r border-neutral-200 dark:border-neutral-800 grow min-h-0 max-h-screen">
      <Show
        when={session() && session()!.user !== null && session()}
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
              <OrganizationWorkspaceSelection session={s()} />
              <div class="w-full h-max flex flex-col px-4 gap-2">
                <For each={links}>
                  {(link) => (
                    <SidebarLink href={link.href} icon={link.icon}>
                      {link.label}
                    </SidebarLink>
                  )}
                </For>
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
