import { cache, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";

export const getStatistics = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.nativeEvent.context.user;
  const statistics = [
    {
      trend: "up",
      value: 1,
      unit: "",
      label: "Events",
      description: "Total events",
      change: 100,
    },
    {
      trend: "down",
      value: 1,
      unit: "",
      label: "Concerts",
      description: "Total concerts",
      change: 100,
    },
    {
      trend: "up",
      value: 20,
      unit: "",
      label: "Movies",
      description: "Total movies",
      change: 100,
    },
  ] as {
    trend: "up" | "down";
    value: number;
    unit: string;
    label: string;
    description: string;
    change: number;
  }[];
  return statistics;
  // const n = await Notifications.findManyByUserId(user.id);
  // return n;
}, "statistics");

