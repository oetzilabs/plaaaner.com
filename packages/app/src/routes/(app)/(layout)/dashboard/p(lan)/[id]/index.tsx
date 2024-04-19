import { createAsync, useParams } from "@solidjs/router";
import { getPlan } from "@/lib/api/plans";
import { Show } from "solid-js";

export default function PlanPage() {
  const { id } = useParams();
  const plan = createAsync(() => getPlan(id));
  return (
    <div class="flex flex-col items-start h-full w-full py-10 gap-8 container">
      <div class="flex flex-col gap-1 w-full">
        <Show when={typeof plan !== "undefined" && plan()}>
          {(p) => (
            <div class="flex flex-col items-start h-full w-full gap-4">
              <div class="flex flex-col gap-1">{p().name}</div>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}
