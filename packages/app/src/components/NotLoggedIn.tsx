import {A} from "@solidjs/router";

export const NotLoggedIn = () => {
  return (
    <div class="flex flex-col gap-2 items-center justify-center p-2 border border-neutral-200 dark:border-neutral-800 rounded-md text-muted-foreground text-sm">
      <span>You are not logged in.</span>
      <span>
        Please <A class="hover:underline hover:underline-offset-2" href="/auth/login">login</A> to continue
      </span>
    </div>
  );
};
