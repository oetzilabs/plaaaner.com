import { Notifications } from "@oetzilabs-plaaaner-com/core/src/entities/notifications";
import { cache, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";

export const getNotificationSettings = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.nativeEvent.context.user;
  return {
    type: "everything",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  // const n = await Notifications.findManyByUserId(user.id);
  // return n;
}, "notificationSettings");

export const getNotifications = cache(async () => {
  "use server";
  const event = getRequestEvent()!;

  if (!event.nativeEvent.context.session) {
    throw redirect("/auth/login");
  }

  const session = event.nativeEvent.context.session;

  if(!session.organization_id) {
    throw redirect("/setup/organization")
  }

  if (!event.nativeEvent.context.user) {
    throw redirect("/auth/login");
  }


  const user = event.nativeEvent.context.user;

  const orgNotifications = await Notifications.findByOrganizationId(session.organization_id);

  console.log(orgNotifications);

  return [
    {
      id: "1",
      type: "mention",
      read: false,
      createdAt: new Date(),
      reference_id: "1",
      reference_type: "comment",
      message: `${user.username} mentioned you.`,
      contents: `This is a test message @oezguerisbert`,
      tags: [
        {
          lookup: "@oezguerisbert",
          link: "/user/@oezguerisbert",
        },
      ],
      link: "/plans/1",
    },
    {
      id: "2",
      type: "mention",
      read: false,
      createdAt: new Date(),
      reference_id: "1",
      reference_type: "event",
      message: "You have been mentioned in an event",
      contents: `This is a test message @oezguerisbert`,
      tags: [
        {
          lookup: "@oezguerisbert",
          link: "/user/@oezguerisbert",
        },
      ],
      link: "/plans/1",
    },
    {
      id: "3",
      type: "mention",
      read: false,
      createdAt: new Date(),
      reference_id: "1",
      reference_type: "thread",
      message: "You have been mentioned in a thread",
      tags: [
        {
          lookup: "@oezguerisbert",
          link: "/user/@oezguerisbert",
        },
      ],
      contents: `This is a test message @oezguerisbert`,
      link: "/plans/1",
    },
  ];
  // const n = await Notifications.findManyByUserId(user.id);
  // return n;
}, "notifications");
