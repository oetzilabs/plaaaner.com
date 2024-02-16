import CreateEventForm from "@/components/forms/CreateEvent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EventType } from "@/utils/schemas/event";
import { As } from "@kobalte/core";
import { A, useParams } from "@solidjs/router";
import { createSignal } from "solid-js";

export default function PlanCreateEventPage() {
  const params = useParams();
  const v = EventType.safeParse(params.event_type);
  if (!v.success) {
    return (
      <div class="flex flex-col py-40 w-max mx-auto">
        <Card>
          <CardHeader class="text-center font-medium">HUH!?</CardHeader>
          <CardContent>
            <div class="flex flex-col gap-4">
              <div class="text-lg">This event type does not exist</div>
              <Button asChild size="sm">
                <As component={A} href="/">
                  Go back
                </As>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div class="flex flex-col py-10">
      <div class="px-4 lg:px-0 w-full">
        <CreateEventForm event_type={v.data} />
      </div>
    </div>
  );
}
