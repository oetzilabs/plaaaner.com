import { cn } from "../../../lib/utils";

export function Logo(props: { small?: boolean }) {
  return (
    <div
      class={cn("rounded-full bg-indigo-600", {
        "size-5": props.small,
        "size-10": !props.small,
      })}
      style="background: linear-gradient(162.14deg, #9377CE -27.95%, #4F46E4 57.43%)"
    />
  );
}
