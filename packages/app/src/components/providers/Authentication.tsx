import { createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import { setCookie, getCookie } from "vinxi/http";
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
  setCookie("session", "", {
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
};

export const session = () => {
  const sessionCookie = getCookie("session");

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
  const provider = getCookie("lastUsedProvider");
  if (!provider) {
    return "";
  }
  return provider;
};
