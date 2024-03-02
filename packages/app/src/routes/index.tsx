import { Button, buttonVariants } from "@/components/ui/button";
import { As } from "@kobalte/core";
import { A } from "@solidjs/router";
import { cn } from "../lib/utils";

export default function IndexPage() {
  return (
    <div class="relative flex flex-col gap-2 items-center w-full">
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
          <div class="relative flex flex-col items-center justify-center w-full rounded-lg overflow-clip md:overflow-visible">
            <div class="flex flex-col items-center justify-center w-full">
              <div class="w-full h-[400px] md:h-[700px] bg-transparent border border-indigo-200 dark:border-[#4F46E4]/50 rounded-lg relative p-[2px]">
                <div class="w-full h-full bg-background border border-indigo-200 dark:border-[#4F46E4] outline-none rounded-md relative overflow-clip shadow-none shadow-indigo-500 md:shadow-lg">
                  <div class="z-10 absolute w-full h-full md:h-[50%] bg-gradient-to-t bottom-0 from-indigo-50 dark:from-black" />
                </div>
              </div>
            </div>
            <div class="z-20 flex flex-col gap-4 md:gap-8 items-center text-xs md:text-lg bg-[#4F46E4] text-white dark:bg-[#4F46E4] shadow-none shadow-indigo-500 md:shadow-2xl rounded-none md:rounded-md absolute w-full md:w-max left-0 md:left-[50%] translate-x-0 md:translate-x-[-50%] bottom-0 md:-bottom-8 py-6 px-10 md:border border-indigo-200 dark:border-[#4F46E4]">
              <div class="w-max flex flex-col items-center justify-center gap-2">
                <p class="text-center">From concerts and conferences to tournaments and workshops,</p>
                <p class="text-center">manage everything in one centralized hub.</p>
              </div>
              <div class="flex flex-row gap-2 items-center">
                <Button size="lg" asChild>
                  <As component={A} href="/dashboard">
                    Dashboard
                  </As>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <As component={A} href="/learn-more">
                    Learn more
                  </As>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
