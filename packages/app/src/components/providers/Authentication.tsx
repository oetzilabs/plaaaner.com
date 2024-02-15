import { createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import { createCookie, parseCookie } from "solid-start";
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  image: z.string(),
  email: z.string(),
});

export const [authLoggedin, setAuthLoggedin] = createSignal<boolean>(false);

export const [auth, setAuth] = createSignal<z.infer<typeof UserSchema> | null>(null);

export const logout = async () => {
  setAuthLoggedin(false);
  setAuth(null);
  const sessionCookie = createCookie("session", {
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
  const c = await sessionCookie.serialize("");
  document.cookie = c;
};

export const session = () => {
  const sessionCookie = parseCookie(document.cookie).session;

  if (!sessionCookie) {
    console.log("No session cookie found");
    return null;
  }
  return sessionCookie;
};

export const lastUsedProvider = () => {
  if (isServer) {
    return null;
  }
  const provider = parseCookie(document.cookie).lastUsedProvider;
  if (!provider) {
    return "";
  }
  return provider;
};
