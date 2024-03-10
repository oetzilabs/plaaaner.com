import { z } from "zod";
import { CreatePlanFormSchema, PlanType } from "../schemas/plan";

export * as Queries from "./queries";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const DELAY = 0;

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

