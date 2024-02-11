import { z } from "zod";

export * as Queries from "./queries";

const API_BASE = import.meta.env.VITE_API_URL;

export const Attendees = {
  all: z.function(z.tuple([])).implement(async () => {
    return [
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
      { id: "3", name: "Charlie" },
    ];
    // const session = document.cookie.split(";").find((c) => c.trim().startsWith("session="));
    // if (!session) {
    //   return Promise.reject("No session found");
    // }
    // return fetch(`${API_BASE}/attendees`, {
    //   headers: {
    //     Authorization: `Bearer ${session.split("=")[1]}`,
    //   },
    // }).then((res) => res.json() as Promise<{ id: string; name: string }[]>);
  }),
  byId: z.function(z.tuple([z.string()])).implement(async (id) => {
    const session = document.cookie.split(";").find((c) => c.trim().startsWith("session="));
    if (!session) {
      return Promise.reject("No session found");
    }
    return fetch(`${API_BASE}/attendees/${id}`, {
      headers: {
        Authorization: `Bearer ${session.split("=")[1]}`,
      },
    }).then((res) => res.json());
  }),
};

export const URLPreviews = {
  get: z.function(z.tuple([z.string()])).implement(async (url) => {
    return {
      title: "Title",
      description: "Description",
      image: "https://via.placeholder.com/150",
    };

    // const session = document.cookie.split(";").find((c) => c.trim().startsWith("session="));
    // if (!session) {
    //  return Promise.reject("No session found");
    // }
    // return fetch(`${API_BASE}/url-previews?url=${url}`, {
    //   headers: {
    //     Authorization: `Bearer ${session.split("=")[1]}`,
    //   },
    // }).then((res) => res.json());
  }),
};

export const Sessions = {
  get: z.function(z.tuple([])).implement(async () => {
    return {
      id: "1",
      username: "alice",
      email: "alice@localhost",
    };
    // const session = document.cookie.split(";").find((c) => c.trim().startsWith("session="));
    // if (!session) {
    //   return Promise.reject("No session found");
    // }
    // return fetch(`${API_BASE}/session`, {
    //   headers: {
    //     Authorization: `Bearer ${session.split("=")[1]}`,
    //   },
    // }).then((res) => res.json());
  }),
};

export const Concerts = {
  suggestName: z.function(z.tuple([z.string()])).implement(async (name) => {
    if (name === "asdf") {
      return ["asdf-2", "hjkl"];
    }
    return [] as string[];
    // const session = document.cookie.split(";").find((c) => c.trim().startsWith("session="));
    // if (!session) {
    //   return Promise.reject("No session found");
    // }
    // return fetch(`${API_BASE}/concerts/suggest-name?name=${name}`, {
    //   headers: {
    //     Authorization: `Bearer ${session.split("=")[1]}`,
    //   },
    // }).then((res) => res.json() as Promise<string[]>);
  }),
  all: z.function(z.tuple([])).implement(async () => {
    return [
      { id: "1", name: "asdf" },
      { id: "2", name: "asdff" },
      { id: "3", name: "hjkl" },
    ];
    // const session = document.cookie.split(";").find((c) => c.trim().startsWith("session="));
    // if (!session) {
    //   return Promise.reject("No session found");
    // }
    // return fetch(`${API_BASE}/concerts`, {
    //   headers: {
    //     Authorization: `Bearer ${session.split("=")[1]}`,
    //   },
    // }).then((res) => res.json() as Promise<{ id: string; name: string }[]>);
  }),
};

export const Events = {
  all: z.function(z.tuple([])).implement(async () => {
    return [
      { id: "1", name: "Event 1" },
      { id: "2", name: "Event 2" },
      { id: "3", name: "Event 3" },
    ];
    // const session = document.cookie.split(";").find((c) => c.trim().startsWith("session="));
    // if (!session) {
    //   return Promise.reject("No session found");
    // }
    // return fetch(`${API_BASE}/events`, {
    //   headers: {
    //     Authorization: `Bearer ${session.split("=")[1]}`,
    //   },
    // }).then((res) => res.json() as Promise<{ id: string; name: string }[]>);
  }),
  byId: z.function(z.tuple([z.string()])).implement(async (id) => {
    const session = document.cookie.split(";").find((c) => c.trim().startsWith("session="));
    if (!session) {
      return Promise.reject("No session found");
    }
    return fetch(`${API_BASE}/events/${id}`, {
      headers: {
        Authorization: `Bearer ${session.split("=")[1]}`,
      },
    }).then((res) => res.json());
  }),
};
