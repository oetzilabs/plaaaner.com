import { Badge } from "@/components/ui/badge";
import { getPlan } from "@/lib/api/plans";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RoutePreloadFuncArgs, useParams } from "@solidjs/router";
import { Pencil } from "lucide-solid";
import { Match, Show, Switch } from "solid-js";
import { Button } from "../../../../../../components/ui/button";

export const route = {
  preload: async (props: RoutePreloadFuncArgs) => {
    const session = await getAuthenticatedSession();
    const plan = await getPlan(props.params.id);
    return { plan, session };
  },
};

export default function PlanPage() {
  const params = useParams();
  const session = createAsync(() => getAuthenticatedSession());
  const plan = createAsync(() => getPlan(params.id));

  return (
    <div class="flex flex-col items-start h-full w-full py-10 gap-8 container">
      <div class="flex flex-col gap-1 w-full">
        <Show when={plan()} keyed>
          {(p) => (
            <div class="flex flex-col items-start h-full w-full gap-4">
              <div class="flex flex-row items-center justify-between gap-2 w-full">
                <div class="flex flex-row items-center justify-start gap-2">
                  <div class="flex flex-col gap-1 font-bold text-2xl">{p.name}</div>
                  <div class="">
                    <Badge variant="outline">{p.status}</Badge>
                  </div>
                </div>
                <div class="flex flex-col gap-1">
                  <Show when={session() && session()!.user !== null && session()} keyed>
                    {(s) => (
                      <div class="flex flex-row items-center gap-2">
                        <Button
                          as={A}
                          href={`/dashboard/p/${p.id}/edit/general`}
                          size="sm"
                          class="flex flex-row items-center gap-2"
                        >
                          <Pencil class="size-4" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </Show>
                </div>
              </div>
              <div class="flex flex-col gap-1 font-semibold text-xl">Info</div>
              <div class="flex flex-col gap-2">
                <span class="text-sm font-medium">{p.description}</span>
                <span class="text-sm font-medium">
                  {p.starts_at.toLocaleDateString()} - {p.ends_at.toLocaleDateString()}
                </span>
                <span class="text-sm font-medium">
                  <Switch>
                    <Match when={p.location.location_type === "venue" && p.location.address}>
                      {(lAddress) => <span class="text-sm font-medium">{lAddress()}</span>}
                    </Match>
                    <Match when={p.location.location_type === "online" && p.location.url}>
                      {(lUrl) => <span class="text-sm font-medium">{lUrl()}</span>}
                    </Match>
                    <Match when={p.location.location_type === "festival" && p.location.address}>
                      {(lAddress) => <span class="text-sm font-medium">{lAddress()}</span>}
                    </Match>
                    <Match when={p.location.location_type === "other" && p.location.details}>
                      {(lDetails) => <span class="text-sm font-medium">{lDetails()}</span>}
                    </Match>
                  </Switch>
                </span>
              </div>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}
