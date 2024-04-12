import { A } from "@solidjs/router";

export const Disclaimers = () => {
  return (
    <div class="w-full h-auto flex flex-col gap-4 p-4 border-t border-neutral-200 dark:border-neutral-800">
      <div class="w-full flex flex-col gap-2">
        <span class="text-xs text-muted-foreground text-center">
          This is a{" "}
          <A href="https://github.com/oetzilabs/plaaaner.com" target="_blank" rel="noreferrer" class="hover:underline">
            beta version
          </A>{" "}
          of Plaaaner. It is not intended for use in production environments, yet.
        </span>
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground text-center">If you have any questions or feedback,</span>
          <span class="text-xs text-muted-foreground text-center">
            please reach out to me on{" "}
            <A href="https://twitter.com/oezguerisbert" target="_blank" rel="noreferrer" class="hover:underline">
              Twitter
            </A>
            .
          </span>
        </div>
      </div>
    </div>
  );
};
