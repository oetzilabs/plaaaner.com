import { For } from "solid-js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { A } from "solid-start";
import { Button } from "../../../components/ui/button";
import { As } from "@kobalte/core";

export default function PlanCreateEventPage() {
  const typesOfEvents = [
    {
      title: "Event",
      description:
        "The basic plan is for those who are just starting out and need a simple way to manage their events.",
      link: "/plan/create/event",
      learnMore: "/plan/info/event",
    },
  ];

  return (
    <div class="flex flex-col py-10">
      <div class="px-4 lg:px-0 w-full">
        <For each={typesOfEvents}>
          {(plan) => (
            <Card>
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
              </CardHeader>
              <CardContent class="flex flex-col gap-4">
                <CardDescription>{plan.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <div class="flex flex-row items-center justify-between gap-2 w-full">
                  <Button size="sm" variant="secondary" asChild>
                    <As component={A} href={plan.learnMore}>
                      Learn more
                    </As>
                  </Button>
                  <Button size="sm" asChild>
                    <As component={A} href={plan.link}>
                      Get started
                    </As>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </For>
      </div>
    </div>
  );
}
