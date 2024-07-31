import { Sidebar } from "@/components/Sidebar";
import { JSXElement } from "solid-js";

export default function DashboardLayout(props: { children: JSXElement }) {
  return (
    <div class="w-full flex flex-row gap-0 grow">
      <Sidebar />
      <div class="w-full flex flex-col grow">{props.children}</div>
    </div>
  );
}
