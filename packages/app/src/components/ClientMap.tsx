// @refresh reload
import { Accessor, createEffect } from "solid-js";

export default function ClientMap(props: { query: Accessor<string> }) {
  return (
    <div class="border-muted border rounded-md w-full flex flex-col items-center justify-center bg-muted h-[280px]"></div>
  );
}
