import { JSXElement } from "solid-js";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout(props: { children: JSXElement }) {
  return (
    <div class="w-full flex flex-row gap-0 grow">
      <Sidebar />
      <div class="w-full flex flex-col grow">{props.children}</div>
    </div>
  );
}
