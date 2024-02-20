import { A } from "@solidjs/router";
import { AppSearch } from "./AppSearch";
import ModeToggle from "./ModeToogle";
import { Logo } from "./ui/custom/logo";
import UserMenu from "./UserMenu";

export function Header() {
  return (
    <header class="sticky z-50 top-0 bg-neutral-50/[0.3] dark:bg-black/[0.3] backdrop-blur-md flex flex-row border-b border-neutral-200 dark:border-neutral-800 w-full px-4 py-2 items-center justify-between">
      <div class="container flex flex-row w-full items-center justify-between px-4">
        <A href="/" class="flex flex-row gap-4 items-center justify-center">
          <Logo small />
        </A>
        <div class="w-max items-center justify-center flex flex-row">
          <AppSearch />
        </div>
        <div class="flex flex-row gap-2 items-center w-max">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
