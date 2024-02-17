import { z } from "zod";
import { CreateEventFormSchema } from "../schemas/event";
import { WorkspaceUpdateSchema } from "@oetzilabs-plaaaner-com/core/src/drizzle/sql/schema";

export * as Mutations from "./mutations";

const API_BASE = import.meta.env.VITE_API_URL;
const DELAY = 1000;

export const Events = {
  create: z.function(z.tuple([CreateEventFormSchema])).implement(async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      id: "1",
      ...data,
    };

    //const session = document.cookie.split(";").find((c) => c.startsWith("session="));
    //if (!session) {
    //  return Promise.reject("No session found");
    //}
    //return fetch(`${API_BASE}/events`, {
    //  method: "POST",
    //  headers: {
    //    "Content-Type": "application/json",
    //    Authorization: `Bearer ${session.split("=")[1]}`,
    //  },
    //  body: JSON.stringify(data),
    //}).then((res) => res.json());
  }),
  update: z
    .function(
      z.tuple([
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          description: z.string(),
          date: z.string(),
          location: z.string(),
        }),
      ])
    )
    .implement(async (data) => {
      const session = document.cookie.split(";").find((c) => c.startsWith("session="));
      if (!session) {
        return Promise.reject("No session found");
      }
      return fetch(`${API_BASE}/events/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.split("=")[1]}`,
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());
    }),
  delete: z.function(z.tuple([z.string().uuid()])).implement(async (id) => {
    const session = document.cookie.split(";").find((c) => c.startsWith("session="));
    if (!session) {
      return Promise.reject("No session found");
    }
    return fetch(`${API_BASE}/events/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.split("=")[1]}`,
      },
    }).then((res) => res.json());
  }),
};

export const Concerts = {
  create: z.function(z.tuple([CreateEventFormSchema])).implement(async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // return Promise.reject(
    //   new Error("Mutations.Concerts.create has not been implemented yet", {
    //     cause: {
    //       target: "Mutations.Concerts.create",
    //       errorId: "1234",
    //     },
    //   })
    // );

    return {
      id: "1",
      ...data,
    };
  }),
  update: z
    .function(
      z.tuple([
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          description: z.string(),
          date: z.string(),
          location: z.string(),
        }),
      ])
    )
    .implement(async (data) => {
      const session = document.cookie.split(";").find((c) => c.startsWith("session="));
      if (!session) {
        return Promise.reject("No session found");
      }
      return fetch(`${API_BASE}/concerts/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.split("=")[1]}`,
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());
    }),
  delete: z.function(z.tuple([z.string().uuid()])).implement(async (id) => {
    const session = document.cookie.split(";").find((c) => c.startsWith("session="));
    if (!session) {
      return Promise.reject("No session found");
    }
    return fetch(`${API_BASE}/concerts/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.split("=")[1]}`,
      },
    }).then((res) => res.json());
  }),
};
