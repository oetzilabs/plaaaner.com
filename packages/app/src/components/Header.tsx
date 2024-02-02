import { A } from "@solidjs/router";
import ModeToggle from "./ModeToogle";

export const Header = () => {
  return (
    <header class="bg-white dark:bg-black flex flex-row border-b border-neutral-300 dark:border-neutral-800 fixed z-50 w-full px-4 py-2 items-center justify-between">
      <A href="/" class="text-sm">
        plaaaner.com
      </A>
      <div>
        <ModeToggle />
      </div>
    </header>
  );
}
