import { Footer } from "@/components/Footer";
import { JSXElement } from "solid-js";

export default function StaticLayout(props: { children: JSXElement }) {
  return (
    <>
      <div class="container px-4 min-h-screen h-auto">{props.children}</div>
      <Footer />
    </>
  );
}
