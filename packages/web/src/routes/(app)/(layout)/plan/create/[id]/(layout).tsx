import { redirect, useParams } from "@solidjs/router";
import { JSXElement } from "solid-js";
import { z } from "zod";

export default function PlanCreateEventPage(props: { children: JSXElement }) {
  return (
    <div class="container flex flex-col py-10">
      <div class="flex flex-col px-4 lg:px-0 w-full gap-4">
        <h1 class="text-3xl font-semibold w-full capitalize">Create Plan</h1>
        <div class="flex flex-col gap-4 items-start w-full">{props.children}</div>
      </div>
    </div>
  );
}
