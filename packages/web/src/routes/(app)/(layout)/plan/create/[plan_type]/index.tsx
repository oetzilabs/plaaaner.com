import { CreatePlan } from "@/components/forms/CreatePlanProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlanType } from "@/utils/schemas/plan";
import { A, useParams } from "@solidjs/router";

export default function PlanCreateEventPage() {
  const params = useParams();
  const v = PlanType.safeParse(params.plan_type);
  if (!v.success) {
    return (
      <div class="flex flex-col py-40 w-max mx-auto">
        <Card>
          <CardHeader class="text-center font-medium">HUH!?</CardHeader>
          <CardContent>
            <div class="flex flex-col gap-4">
              <div class="text-lg">This event type does not exist</div>
              <Button size="sm" as={A} href="/">
                Go back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div class="container flex flex-col py-10">
      <div class="px-4 lg:px-0 w-full">
        <CreatePlan plan_type={v.data} />
      </div>
    </div>
  );
}
