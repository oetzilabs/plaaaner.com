import { cache, redirect } from "@solidjs/router";
import { getEvent } from "vinxi/http";

export const getMetrics = cache(async () => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.context.user;
  const metrics = [
    {
      duration: "month",
      type: "events",
      trend: "up",
      value: {
        v: 1,
        unit: "event",
      },
      change: 100,
    },
    {
      duration: "month",
      type: "concerts",
      trend: "down",
      value: {
        v: 1,
        unit: "concert",
      },
      change: 100,
    },
    {
      duration: "month",
      type: "movies",
      trend: "neutral",
      value: {
        v: 20,
        unit: "movies",
      },
      change: 100,
    },
  ] as {
    trend: "up" | "down" | "neutral";
    value: {
      v: any;
      unit: string;
    };
    type: string;
    duration: "month" | "day" | "week";
    change: number;
  }[];
  return metrics;
  // const n = await Notifications.findManyByUserId(user.id);
  // return n;
}, "metrics");
