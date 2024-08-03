import { Sidebar } from "@/components/Sidebar";
import { JSXElement } from "solid-js";

export default function DashboardLayout(props: { children: JSXElement }) {
  return (
    <div class="w-full flex flex-row gap-0 grow">
      {/* <div class="hidden w-max md:flex flex-col gap-0 grow min-h-0 max-h-screen">
        <Sidebar />
      </div> */}
      <div class="w-full flex flex-col grow">{props.children}</div>
    </div>
  );
}
