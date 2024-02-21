import { cache, redirect } from "@solidjs/router";
import dayjs from "dayjs";
import { getRequestEvent } from "solid-js/web";

export const getPlans = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.nativeEvent.context.user;
  return [
    {
      name: "test event",
      type: "event",
      createdAt: dayjs().add(2, "days").toDate(),
      link: "/plans/event/1",
      progress: 60,
    },
    {
      name: "test event 2",
      type: "event",
      createdAt: dayjs().add(8, "days").toDate(),
      link: "/plans/event/2",
      progress: 22,
    },
  ];
  // const n = await Notifications.findManyByUserId(user.id);
  // return n;
}, "plans")
