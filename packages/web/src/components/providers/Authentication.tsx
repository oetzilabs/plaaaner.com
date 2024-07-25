import { createSignal } from "solid-js";
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  image: z.string(),
  email: z.string(),
});

export const [authLoggedin, setAuthLoggedin] = createSignal<boolean>(false);

export const [auth, setAuth] = createSignal<z.infer<typeof UserSchema> | null>(null);

export const session = () => {
  // const sessionCookie = getCookie("session");

  // if (!sessionCookie) {
  //   console.log("No session cookie found");
  //   return null;
  // }
  // return sessionCookie;
  return "";
};
