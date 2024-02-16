import { Queries } from "@/utils/api/queries";
import { createQuery } from "@tanstack/solid-query";
import { Accessor, createEffect, Match, Switch } from "solid-js";

export default function URLPreview(props: { query: Accessor<string> }) {
  const metadata = createQuery(() => ({
    queryKey: ["metadata", props.query()],
    queryFn: async () => {
      const q = props.query();
      if (!q) return null;
      return Queries.URLPreviews.get(q);
    },
    retry: 0,
    get enabled() {
      const q = props.query();
      return !!q;
    },
  }));
  createEffect(() => {
    const q = props.query();
    if (!q) return;
    metadata.refetch();
  });
  return (
    <div class="p-4 border-muted border rounded-md w-full flex flex-col items-center justify-center bg-muted">
      <Switch fallback={<div class="text-neutral-500 select-none font-medium">Loading...</div>}>
        <Match when={props.query().length === 0}>
          <div class="text-neutral-500 select-none font-medium">No URL</div>
        </Match>
        <Match when={metadata.isSuccess && metadata.data}>
          {(data) => (
            <div class="flex items-center w-full">
              <img class="w-12 h-12 rounded-md mr-4" src={data().image} alt="" />
              <div class="flex flex-col">
                <div class="text-lg font-semibold">{data().title}</div>
                <div class="text-muted text-sm">{data().description}</div>
              </div>
            </div>
          )}
        </Match>
        <Match when={metadata.error}>
          <div>Error: {metadata.error?.message}</div>
        </Match>
      </Switch>
    </div>
  );
}
