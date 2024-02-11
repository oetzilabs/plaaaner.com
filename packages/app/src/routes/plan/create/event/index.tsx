import CreateEventForm from "@/components/forms/CreateEvent";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";

export default function PlanCreateEventPage() {
  return (
    <div class="flex flex-col py-10">
      <div class="px-4 lg:px-0 w-full">
        <CreateEventForm />
      </div>
    </div>
  );
}
