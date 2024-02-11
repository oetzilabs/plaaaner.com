import { cn } from "../../../lib/utils";

export function Logo(props: { small?: boolean }) {
  return (
    <div
      class={cn("rounded-full bg-indigo-600", {
        "w-5 h-5 ": props.small,
        "w-10 h-10": !props.small,
      })}
      style="background: linear-gradient(162.14deg, #9377CE -27.95%, #4F46E4 57.43%)"
    />
  );
}
