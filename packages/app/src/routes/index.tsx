import { EventTypePreview, PlanTypes, typesOfPlans } from "@/components/EventTypePreview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { As } from "@kobalte/core";
import { A } from "@solidjs/router";
import { For } from "solid-js";

export default function IndexPage() {

  return (<div class="flex flex-col gap-2 items-center">
    <div class="py-20 flex flex-col gap-20 items-center">
      <div class="flex flex-col gap-6 items-center">
        <h1 class="text-4xl font-bold capitalize">
          The tripple A event planning platform
        </h1>
        <h2 class="text-2xl font-semibold">
          Plan your Events, Tasks and Meetings with ease.
        </h2>
      </div>
      <Card>
        <CardHeader class="flex flex-col">
          <CardTitle>Create a plan</CardTitle>
          <CardDescription>
            <p>Start by creating a plan for your event, task or meeting.</p>
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-8 flex flex-col">
          <div>
            <p>
              Create a event, task or meeting plan to get started.
            </p>
          </div>
          <div class="lg:flex lg:flex-row grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            <For each={Object.keys(typesOfPlans)}>
              {(t) => (
                <EventTypePreview type={t as keyof PlanTypes} />
              )}
            </For>
          </div>
          <Separator />
          <div class="flex flex-row gap-6 items-center justify-between">
            <p>If these plans don't fit your needs, you can create a custom plan.</p>
            <Button variant="secondary" asChild class="w-max">
              <As component={A} href="/event/create/custom/">Create Custom Plan</As>
            </Button>
          </div>
        </CardContent>
        <CardFooter />
      </Card>
      <div class="flex flex-col gap-8 items-center text-xl">
        <div class="flex flex-col gap-2 items-center text-xl">
          <p>If you are interested in learning more about our plans,</p>
          <p>you can get started or learn more.</p>
        </div>
        <div class="flex flex-row gap-2 items-center">
          <Button variant="default">Get started</Button>
          <Button variant="secondary">Learn more</Button>
        </div>
      </div>
    </div>
  </div>);
}

