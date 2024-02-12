import { A } from "@solidjs/router";
import { For } from "solid-js";
import { Logo } from "./ui/custom/logo";

const footer = {
  "Open Source": [
    {
      name: "GitHub",
      href: "https://github.com/oetzilabs/plaaaner.com",
    },
    {
      name: "Issues",
      href: "https://github.com/oetzilabs/plaaaner.com/issues",
    },
  ],
  Community: [
    {
      name: "Blog",
      href: "#",
    },
    {
      name: "Discord",
      href: "#",
    },
    {
      name: "Twitter",
      href: "#",
    },
  ],
  Legal: [
    {
      name: "Privacy",
      href: "#",
    },
    {
      name: "Terms",
      href: "#",
    },
  ],
  Project: [
    {
      name: "Roadmap",
      href: "#",
    },
    {
      name: "Team",
      href: "#",
    },
    {
      name: "Vision",
      href: "#",
    },
    {
      name: "Brand",
      href: "#",
    },
  ],
};

export function Footer() {
  return (
    <footer class="bg-neutral-50 dark:bg-black flex flex-col border-t border-neutral-200 dark:border-neutral-800 w-full px-4 py-10 items-center">
      <div class="container flex flex-row w-full items-center justify-between px-4 ">
        <div class="flex flex-row justify-between w-full gap-10">
          <div class="w-max">
            <A href="/" class="flex flex-row gap-4 items-center justify-center">
              <Logo />
              <span class="font-semibold leading-none text-lg -mt-1">plaaaner.com</span>
            </A>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-20 w-full md:w-max">
            <For each={Object.entries(footer)}>
              {([title, links]) => (
                <div class="flex flex-col gap-4">
                  <h4 class="text-base font-semibold text-indigo-400 dark:text-indigo-800">{title}</h4>
                  <div class="flex flex-col gap-1">
                    <For each={links}>
                      {(link) => (
                        <A href={link.href} rel="external" class="text-sm hover:underline">
                          {link.name}
                        </A>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </footer>
  );
}