import { A } from "@solidjs/router";

export const UserMenu = () => {
  return (
    <div class="flex w-full flex-row items-center justify-center">
      <div class="flex items-center gap-4">
        <A href="/" class="hover:underline">
          Home
        </A>
      </div>
    </div>
  );
};
