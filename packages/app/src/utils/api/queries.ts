import { z } from "zod";
import { CreateEventFormSchema, EventType } from "../schemas/event";
import { UserSchema } from "../../components/providers/Authentication";
// import { env } from "../../env";

export * as Queries from "./queries";

const API_BASE = process.env.VITE_API_URL ?? "http://localhost:3000";
const AUTH_BASE = process.env.VITE_AUTH_URL ?? "http://localhost:3000";

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

export const Events = {
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
  recommended: z
    .function(
      z.tuple([
        z.object({
          event_type: EventType,
        }),
      ])
    )
    .implement(async () => {
      return [
        {
          id: "r:1",
          name: "recommended-test-1",
          description: "Description 1",
          capacity: { capacity_type: "custom", value: 20 },
          location: {
            location_type: "venue",
            address: "1234 Main St",
          },
          tickets: [
            {
              shape: "default",
              currency: { currency_type: "eur" },
              price: 20,
              quantity: 10,
              name: "VIP",
              ticket_type: "paid:vip",
            },
            {
              shape: "default",
              currency: { currency_type: "eur" },
              price: 10,
              quantity: 5,
              name: "Regular",
              ticket_type: "paid:regular",
            },
            {
              shape: "default",
              currency: { currency_type: "free" },
              price: 0,
              quantity: 5,
              name: "FREE",
              ticket_type: "free",
            },
          ],
        },
        {
          id: "r:2",
          name: "recommended-test-2",
          description: "Description 2",
          capacity: { capacity_type: "recommended", value: "200" },
          location: {
            location_type: "online",
            url: "https://example.com",
          },
          tickets: [
            {
              shape: "default",
              currency: { currency_type: "eur" },
              price: 20,
              quantity: 10,
              name: "VIP",
              ticket_type: "paid:vip",
            },
            {
              shape: "default",
              currency: { currency_type: "eur" },
              price: 10,
              quantity: 50,
              name: "Regular",
              ticket_type: "paid:regular",
            },
            {
              shape: "default",
              currency: { currency_type: "free" },
              price: 0,
              quantity: 140,
              name: "FREE",
              ticket_type: "free",
            },
          ],
        },
      ] as (z.infer<typeof CreateEventFormSchema> & {
        id: string;
      })[];
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
  all: z
    .function(
      z.tuple([
        z.object({
          event_type: EventType,
        }),
      ])
    )
    .implement(async () => {
      return [
        {
          id: "1",
          name: "test-1",
          description: "Description 1",
          capacity: { capacity_type: "custom", value: 20 },
          location: {
            location_type: "venue",
            address: "1234 Main St",
          },
          tickets: [
            {
              shape: "default",
              currency: { currency_type: "eur" },
              price: 20,
              quantity: 10,
              name: "VIP",
              ticket_type: "paid:vip",
            },
            {
              shape: "default",
              currency: { currency_type: "eur" },
              price: 10,
              quantity: 5,
              name: "Regular",
              ticket_type: "paid:regular",
            },
            {
              shape: "default",
              currency: { currency_type: "free" },
              price: 0,
              quantity: 5,
              name: "FREE",
              ticket_type: "free",
            },
          ],
        },
        {
          id: "2",
          name: "test-2",
          description: "Description 2",
          capacity: { capacity_type: "recommended", value: "200" },
          location: {
            location_type: "online",
            url: "https://example.com",
          },
          tickets: [
            {
              shape: "default",
              currency: { currency_type: "eur" },
              price: 20,
              quantity: 10,
              name: "VIP",
              ticket_type: "paid:vip",
            },
            {
              shape: "default",
              currency: { currency_type: "eur" },
              price: 10,
              quantity: 50,
              name: "Regular",
              ticket_type: "paid:regular",
            },
            {
              shape: "default",
              currency: { currency_type: "free" },
              price: 0,
              quantity: 140,
              name: "FREE",
              ticket_type: "free",
            },
          ],
        },
      ] as (z.infer<typeof CreateEventFormSchema> & {
        id: string;
      })[];
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

const generateAuthUrl = (provider: string) =>
  `${AUTH_BASE}/authorize?provider=${provider}&response_type=code&client_id=${provider}&redirect_uri=${window.location.origin
  }/auth${encodeURIComponent(`?redirect=${window.location.pathname}`)}`;

export const Auth = {
  loginProviders: z.function(z.tuple([])).implement(async () => {
    return [
      {
        name: "Google",
        logo: "https://raw.githubusercontent.com/Loopple/loopple-public-assets/main/motion-tailwind/img/logos/logo-google.png",
        url: generateAuthUrl("google"),
      },
    ];
    // return fetch(`${API_BASE}/auth/login-providers`).then((res) => res.json());
  }),
  loginViaEmail: z.function(z.tuple([z.string().email()])).implement(async (email) => {
    return {
      user: {
        email,
        id: "1",
        image: "https://via.placeholder.com/150",
        username: "alice",
      },
      token: "EXAMPLE_TOKEN", // TODO!: Implement token
    } as {
      user: z.infer<typeof UserSchema>;
      token: string;
    };
    // return fetch(`${API_BASE}/auth/login-via-email`, {
    //   method: "POST",
    //   body: JSON.stringify({ email }),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // }).then((res) => res.json());
  }),
  session: z.function(z.tuple([z.string()])).implement(async (token) => {
    return {
      id: "1",
      username: "alice",
      email: "alice@example.com",
      image: "https://via.placeholder.com/150",
    } as z.infer<typeof UserSchema>;
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

export const Testimonials = {
  getRandom: z.function(z.tuple([])).implement(async () => {
    return {
      name: "Özgür Isbert",
      title: "CEO",
      testimonial: "I might be biased, but it works as if I made it myself - It's that good.",
    };
    // return fetch(`${API_BASE}/testimonials/random`).then((res) => res.json());
  }),
};

export const Dashboard = {
  get: z.function(z.tuple([])).implement(async () => {
    return {
      workspace: {
        id: "1",
        name: "My workspace",
        plans: [
          {
            event_type: "concert",
            id: "1",
            name: "test-1",
            description: "Description 1",
            capacity: { capacity_type: "custom", value: 20 },
            location: {
              location_type: "venue",
              address: "1234 Main St",
            },
            tickets: [
              {
                shape: "default",
                currency: { currency_type: "eur" },
                price: 20,
                quantity: 10,
                name: "VIP",
                ticket_type: "paid:vip",
              },
              {
                shape: "default",
                currency: { currency_type: "eur" },
                price: 10,
                quantity: 5,
                name: "Regular",
                ticket_type: "paid:regular",
              },
              {
                shape: "default",
                currency: { currency_type: "free" },
                price: 0,
                quantity: 5,
                name: "FREE",
                ticket_type: "free",
              },
            ],
          },
          {
            event_type: "tournaments",
            id: "1",
            name: "test-1",
            description: "Description 1",
            capacity: { capacity_type: "custom", value: 200 },
            location: {
              location_type: "venue",
              address: "1234 Main St",
            },
            tickets: [
              {
                shape: "default",
                currency: { currency_type: "eur" },
                price: 20,
                quantity: 20,
                name: "VIP",
                ticket_type: "paid:vip",
              },
              {
                shape: "default",
                currency: { currency_type: "eur" },
                price: 10,
                quantity: 80,
                name: "Regular",
                ticket_type: "paid:regular",
              },
              {
                shape: "default",
                currency: { currency_type: "free" },
                price: 0,
                quantity: 100,
                name: "FREE",
                ticket_type: "free",
              },
            ],
          },
        ],
      },
      invites: [],
      messages: [],
    };
    // const session = document.cookie.split(";").find((c) => c.trim().startsWith("session="));
    // if (!session) {
    //  return Promise.reject("No session found");
    //  }
    //  return fetch(`${API_BASE}/dashboard`, {
    //  headers: {
    //  Authorization: `Bearer ${session.split("=")[1]}`,
    //  },
    //  }).then((res) => res.json());
  }),
};

