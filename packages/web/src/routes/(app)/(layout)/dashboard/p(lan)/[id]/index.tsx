import { Badge } from "@/components/ui/badge";
import { getPlan } from "@/lib/api/plans";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { createAsync, RoutePreloadFuncArgs, useParams } from "@solidjs/router";
import { Show } from "solid-js";

export const route = {
  preload: async (props: RoutePreloadFuncArgs) => {
    const session = await getAuthenticatedSession();
    const plan = await getPlan(props.params.id);
    return { plan, session };
  },
};

export default function PlanPage() {
  const params = useParams();
  const plan = createAsync(() => getPlan(params.id));

  return (
    <div class="flex flex-col items-start h-full w-full py-10 gap-8 container">
      <div class="flex flex-col gap-1 w-full">
        <Show when={plan()} keyed>
          {(p) => (
            <div class="flex flex-col items-start h-full w-full gap-4">
              <div class="flex flex-row items-center justify-start gap-2">
                <div class="flex flex-col gap-1 font-bold text-xl">{p.name}</div>
                <div class="">
                  <Badge variant="outline">{p.status}</Badge>
                </div>
              </div>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}
