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
      id: "1",
      name: "test event",
      type: "event",
      createdAt: dayjs().add(2, "days").toDate(),
      link: "/plans/event/1",
      progress: 60,
      todos: [
        {
          id: "",
          title: "test",
          content: "",
          status: "in-progress" as const,
          participants: [],
          link: "/plans/event/1/todo/1",
        },
      ],
    },
    {
      id: "2",
      name: "test event 2",
      type: "event",
      createdAt: dayjs().add(8, "days").toDate(),
      link: "/plans/event/2",
      progress: 22,
      todos: [
        {
          id: "1",
          title: "test",
          content: "test",
          status: "urgent" as const,
          participants: [],
          link: "/plans/event/2/todo/1",
        },
        {
          id: "2",
          title: "test2",
          content: "test2",
          status: "stale" as const,
          participants: [],
          link: "/plans/event/2/todo/2",
        },
        {
          id: "3",
          title: "test3",
          content: "test3",
          status: "urgent" as const,
          participants: [],
          link: "/plans/event/2/todo/3",
        },
      ],
    },
  ];
  // const n = await Notifications.findManyByUserId(user.id);
  // return n;
}, "plans");
