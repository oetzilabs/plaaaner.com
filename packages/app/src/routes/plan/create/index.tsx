import { For } from "solid-js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { A } from "@solidjs/router";
import { Button } from "../../../components/ui/button";
import { As } from "@kobalte/core";
import { Separator } from "../../../components/ui/separator";

export default function PlanCreateEventPage() {
  const typesOfEvents = [
    {
      title: "Event",
      description:
        "The basic plan is for those who are just starting out and need a simple way to manage their events.",
      link: "/plan/create/event",
      learnMore: "/plan/info/event",
    },
    {
      title: "Concert",
      description: "The concerts plan is for giant events with multiple stages, artists, and a lot of people.",
      link: "/plan/create/concert",
      learnMore: "/plan/info/concert",
    },
    {
      title: "Tournament",
      description:
        "The festival plan is for those who need to manage multiple events and need a way to keep track of all of them.",
      link: "/plan/create/tournament",
      learnMore: "/plan/info/tournament",
    },
  ];

  return (
    <div class="flex flex-col py-10 gap-8">
      <h1 class="text-3xl font-medium">Create your event</h1>
      <div class="p-4 pb-8 w-full border border-neutral-200 dark:border-neutral-800 rounded-md flex flex-col gap-8">
        <h2 class="text-2xl font-semibold">Choose a plan</h2>
        <p class="text-neutral-500 dark:text-neutral-400">
          Choose the type of event you want to create and get started.
        </p>
        <div class="w-full grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ">
          <For each={typesOfEvents}>
            {(plan) => (
              <div class="flex flex-col shadow-none hover:shadow-lg transition-shadow border border-neutral-200 dark:border-neutral-800 px-4 py-3 rounded-md gap-2">
                <span class="text-lg font-medium">{plan.title}</span>
                <CardDescription class="flex flex-grow">{plan.description}</CardDescription>
                <div class="flex flex-row items-center justify-between gap-2 w-full">
                  <Button size="sm" variant="secondary" asChild>
                    <As component={A} href={plan.learnMore}>
                      Learn more
                    </As>
                  </Button>
                  <Button size="sm" asChild>
                    <As component={A} href={plan.link}>
                      Create {plan.title}
                    </As>
                  </Button>
                </div>
              </div>
            )}
          </For>
        </div>
        <Separator />
        <div class="flex flex-row items-center justify-center gap-4 w-full">
          <div class="">
            <span class="text-neutral-500 dark:text-neutral-400 text-sm">Want to create a custom plan?</span>
          </div>
          <Button size="sm" asChild>
            <As component={A} href="/plan/create/custom-event">
              Create custom plan
            </As>
          </Button>
        </div>
      </div>
    </div>
  );
}
