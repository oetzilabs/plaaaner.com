import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...classLists: ClassValue[]) => twMerge(clsx(classLists));

export const shortUsername = (name: string) => {
  const ns = name.trim().split(" ");
  let n = "";
  for (let x of ns) {
    n += x[0];
  }

  return n;
};
