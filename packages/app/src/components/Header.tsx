import { A } from "@solidjs/router";
import { AppSearch } from "./AppSearch";
import ModeToggle from "./ModeToogle";
import UserMenu from "./UserMenu";
import { Logo } from "./ui/custom/logo";
import { useSession } from "./SessionProvider";
import { Show } from "solid-js";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const userSession = useSession();
  return (
    <header class="bg-neutral-50/[0.3] dark:bg-black/[0.3] backdrop-blur-md flex flex-row border-b border-neutral-200 dark:border-neutral-800 w-full py-2 items-center justify-between">
      <div class="flex flex-row w-full items-center justify-between px-4">
        <div class="flex flex-row items-center justify-start w-max gap-2">
          <A href="/" class="flex flex-row gap-4 items-center justify-center">
            <Logo small />
          </A>
        </div>
        <div class="w-full items-center justify-end flex flex-row gap-2">
          <AppSearch />
          <UserMenu user={userSession?.().user} />
        </div>
      </div>
    </header>
  );
}
