import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync } from "@solidjs/router";
import { Match, Switch } from "solid-js";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    return { session };
  },
};

export default function IndexPage() {
  const session = createAsync(() => getAuthenticatedSession());
  return (
    <>
      <div class="container px-4 relative flex flex-col gap-2 items-center w-full">
        <div class="absolute w-full -top-16 h-32 bg-[#4F46E4] -z-[10] rounded-3xl blur-[150px]"></div>
        <div class="absolute w-full -bottom-36 h-32 bg-[#4F46E4] -z-[10] rounded-3xl blur-[300px]"></div>
        <div class="py-20 pb-24 flex flex-col gap-4 items-center w-full">
          <div class="flex flex-col gap-6 items-center pt-10">
            <h1 class="text-4xl font-bold capitalize text-center">The AAA event planning platform</h1>
            <h2 class="text-2xl font-semibold text-center">Events, Concerts and Meetings.</h2>
          </div>
          <div class="flex flex-col items-center overflow-x-clip px-10"></div>
          <div class="flex flex-col gap-8 items-center text-xl w-full pb-10 md:pb-40">
            <div class="flex flex-col gap-2 items-center">
              <p class="text-center">Ditch the spreadsheet struggle and elevate your experience.</p>
            </div>
            <div class="flex flex-col gap-4 md:gap-8 items-center text-xs md:text-lg bg-[#4F46E4] text-white dark:bg-[#4F46E4] shadow-none shadow-indigo-500 md:shadow-2xl rounded-none md:rounded-md w-full md:w-max py-6 px-10 md:border border-indigo-200 dark:border-[#4F46E4]">
              <div class="w-max flex flex-col items-center justify-center gap-4">
                <p class="text-center">From concerts and conferences to tournaments and workshops,</p>
                <p class="text-center">manage everything in one centralized hub.</p>
              </div>
              <div class="flex flex-row gap-2 items-center">
                <Switch>
                  <Match when={session() && session()?.user !== null}>
                    <Button size="lg" as={A} href={`/dashboard`}>
                      Dashboard
                    </Button>
                  </Match>
                  <Match when={session() && session()?.user === null}>
                    <Button size="lg" as={A} href="/auth/login">
                      Login
                    </Button>
                  </Match>
                </Switch>
                <Button variant="secondary" size="lg" as={A} href="/learn-more">
                  Learn more
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex grow w-full" />
      <Footer />
    </>
  );
}
