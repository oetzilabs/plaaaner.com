import { Button } from "@/components/ui/button";
import { As } from "@kobalte/core";
import { A } from "@solidjs/router";

export default function IndexPage() {
  return (
    <div class="relative flex flex-col gap-2 items-center">
      <div class="absolute w-full -top-16 h-32 bg-[#4F46E4] -z-[10] rounded-3xl blur-[150px]"></div>
      <div class="absolute w-full -bottom-36 h-32 bg-[#4F46E4] -z-[10] rounded-3xl blur-[300px]"></div>
      <div class="py-20 pb-24 flex flex-col gap-8 items-center">
        <div class="flex flex-col gap-6 items-center pt-10 pb-4">
          <h1 class="text-4xl font-bold capitalize text-center">The AAA event planning platform</h1>
          <h2 class="text-2xl font-semibold text-center">Events, Concerts and Meetings.</h2>
        </div>
        <div class="flex flex-col items-center overflow-x-clip px-10 "></div>
        <div class="flex flex-col gap-8 items-center text-xl">
          <div class="flex flex-col gap-2 items-center text-xl">
            <p>If you are interested in learning more about our plans,</p>
            <p>you can get started or learn more.</p>
          </div>
          <div class="flex flex-row gap-2 items-center">
            <Button variant="default" size="lg" asChild>
              <As component={A} href="/plan/create">
                Get started
              </As>
            </Button>
            <Button variant="secondary" size="lg">
              Learn more
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
