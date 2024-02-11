import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { As } from "@kobalte/core";
import { A } from "@solidjs/router";
import { Plus } from "lucide-solid";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

export const typesOfPlans = {
  event: {
    description: "Any event, from a birthday party to a wedding.",
    attribute: (
      <div class="flex flex-row gap-1 items-center">
        Photo by
        <a
          href="https://unsplash.com/@headwayio?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          class="hover:underline"
        >
          Headway
        </a>
        on
        <a
          href="https://unsplash.com/photos/crowd-of-people-sitting-on-chairs-inside-room-F2KRf_QfCqw?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          class="hover:underline"
        >
          Unsplash
        </a>
      </div>
    ),
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  concert: {
    description: "A concert, from a small gig to a large festival.",
    attribute: (
      <div class="flex flex-row gap-1 items-center">
        Photo by
        <a
          href="https://unsplash.com/@sebastianervi?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          class="hover:underline"
        >
          Sebastian Ervi
        </a>
        on
        <a
          href="https://unsplash.com/photos/silhouette-photography-of-concert-Qq2h76kYRFI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          class="hover:underline"
        >
          Unsplash
        </a>
      </div>
    ),
    imageUrl:
      "https://images.unsplash.com/photo-1546707012-c46675f12716?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  meeting: {
    description: "A meeting, from a one-on-one to a large conference.",
    attribute: (
      <div class="flex flex-row gap-1 items-center">
        Photo by
        <a
          href="https://unsplash.com/@anniespratt?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          class="hover:underline"
        >
          Annie Spratt
        </a>
        on
        <a
          href="https://unsplash.com/photos/group-of-people-using-laptop-computer-QckxruozjRg?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          class="hover:underline"
        >
          Unsplash
        </a>
      </div>
    ),
    imageUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
} as const;

export type PlanTypes = typeof typesOfPlans;

export function EventTypePreview({ type }: { type: keyof PlanTypes }) {
  return (
    <Card class="shadow-none">
      <CardHeader>
        <CardTitle class="capitalize">{type}</CardTitle>
        <CardDescription>
          <p>{typesOfPlans[type].description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <HoverCard>
          <HoverCardTrigger>
            <img
              src={typesOfPlans[type].imageUrl}
              alt={type}
              class="grayscale overflow-clip w-full object-cover h-36 border border-neutral-200 dark:border-neutral-800 rounded-md"
            />
          </HoverCardTrigger>
          <HoverCardContent class="flex w-max flex-row gap-1 -mt-4">{typesOfPlans[type].attribute}</HoverCardContent>
        </HoverCard>
      </CardContent>
      <CardFooter>
        <div class="flex flex-row gap-2 items-center justify-between w-full">
          <div class=""></div>
          <Button class="capitalize gap-2" size="sm" variant="default" asChild>
            <As component={A} href={`/plan/create/${type}/`} class="flex flex-row gap-2 items-center">
              Create {type}
              <Plus class="w-4 h-4" />
            </As>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
