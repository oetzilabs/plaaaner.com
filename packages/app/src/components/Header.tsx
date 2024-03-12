import { A } from "@solidjs/router";
import { AppSearch } from "./AppSearch";
import ModeToggle from "./ModeToogle";
import UserMenu from "./UserMenu";
import { Logo } from "./ui/custom/logo";

export function Header() {
  return (
    <header class="bg-neutral-50/[0.3] dark:bg-black/[0.3] backdrop-blur-md flex flex-row border-b border-neutral-200 dark:border-neutral-800 w-full py-2 items-center justify-between">
      <div class="flex flex-row w-full items-center justify-between px-4">
        <A href="/" class="flex flex-row gap-4 items-center justify-center">
          <Logo small />
        </A>
        <div class="w-full items-center md:justify-center justify-end flex flex-row">
          <AppSearch />
        </div>
      </div>
    </header>
  );
}
