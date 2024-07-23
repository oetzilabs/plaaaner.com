import { redirect, useParams } from "@solidjs/router";
import { JSXElement } from "solid-js";
import { z } from "zod";

export default function PlanCreateEventPage(props: { children: JSXElement }) {
  const params = useParams();
  const v = params.id;
  const isUUID = z.string().uuid().safeParse(v);

  if (!v || !isUUID.success) {
    return redirect("/404", { status: 404 });
  }

  return (
    <div class="container flex flex-col py-10">
      <div class="flex flex-col px-4 lg:px-0 w-full gap-4">
        <h1 class="text-3xl font-semibold w-full capitalize">Create Plan</h1>
        <div class="flex flex-col gap-4 items-start w-full">{props.children}</div>
      </div>
    </div>
  );
}
