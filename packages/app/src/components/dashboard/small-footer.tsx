import { A } from "@solidjs/router";
import { footer_links } from "../../lib/utils";
import { For } from "solid-js";

export const SmallFooter = () => {
  return (
    <div class="w-full h-auto flex py-2 items-center justify-center">
      <div class="w-10/12 flex flex-wrap gap-2 items-center justify-center">
        <For each={[...footer_links.Legal, ...footer_links.Community, ...footer_links.Project]}>
          {(link) => (
            <A href={link.href} rel="external" class="text-xs hover:underline">
              {link.name}
            </A>
          )}
        </For>
      </div>
    </div>
  );
};
