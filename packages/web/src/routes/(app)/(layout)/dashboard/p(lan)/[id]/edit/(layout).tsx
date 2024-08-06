import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPlan } from "@/lib/api/plans";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RoutePreloadFuncArgs, useLocation, useParams } from "@solidjs/router";
import { ArrowLeft } from "lucide-solid";
import { JSXElement, Show } from "solid-js";

export const route = {
  preload: async (props: RoutePreloadFuncArgs) => {
    const session = await getAuthenticatedSession();
    const plan = await getPlan(props.params.id);
    return { plan, session };
  },
};

export default function PlanPage(props: { children: JSXElement }) {
  const params = useParams();
  const plan = createAsync(() => getPlan(params.id));
  const location = useLocation();
  const isGeneral = () => location.pathname.endsWith("/general");
  const editTitle = () => location.pathname.split("/").pop();

  return (
    <div class="flex flex-col items-start h-full w-full py-10 gap-8 container">
      <div class="flex flex-col gap-4 w-full grow">
        <Show when={plan()} keyed>
          {(p) => (
            <div class="flex flex-col items-start h-min w-full gap-4">
              <div class="flex flex-col items-start h-min w-full gap-4">
                <Button
                  as={A}
                  href={`/dashboard/p/${p.id}`}
                  size="sm"
                  class="flex flex-row items-center gap-2"
                  variant="outline"
                >
                  <ArrowLeft class="size-4" />
                  Back
                </Button>
                <div class="flex flex-row gap-2 items-center justify-between w-full">
                  <div class="flex flex-col gap-1 font-semibold text-xl capitalize">{editTitle()}</div>
                  <Badge variant="outline">{p.status}</Badge>
                </div>
              </div>
              <Show when={!isGeneral()}>
                <div class="w-full flex flex-col gap-2 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                  <span class="font-medium leading-none">{p.name}</span>
                  <span class="text-sm leading-none text-muted-foreground">{p.description}</span>
                </div>
              </Show>
            </div>
          )}
        </Show>
        <div class="w-full flex flex-col gap-4 grow">{props.children}</div>
      </div>
    </div>
  );
}
