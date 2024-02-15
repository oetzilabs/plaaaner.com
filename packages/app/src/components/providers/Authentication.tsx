import { Accessor, JSX, createContext, createSignal, useContext } from "solid-js";
import { isServer } from "solid-js/web";
import { z } from "zod";

const AuthenticationSchema = z.discriminatedUnion("isAuthenticated", [
  z.object({
    isAuthenticated: z.literal(true),
    user: z.object({
      id: z.string(),
      username: z.string(),
      image: z.string(),
      email: z.string(),
    }),
  }),
  z.object({
    isAuthenticated: z.literal(false),
  }),
]);

type AuthenticationCtx = z.infer<typeof AuthenticationSchema>;

const AuthenticationContext = createContext<
  AuthenticationCtx & {
    loggin: (user: Exclude<AuthenticationCtx, { isAuthenticated: false }>["user"], provider: string) => void;
    loggout: () => void;
    session: Accessor<string | null>;
    lastUsedProvider: Accessor<string | null>;
  }
>({
  isAuthenticated: false,
  loggin: () => {
    throw new Error("Not implemented");
  },
  loggout: () => {
    throw new Error("Not implemented");
  },
  session: () => {
    throw new Error("Not implemented");
  },
  lastUsedProvider: () => {
    throw new Error("Not implemented");
  },
});

export const useAuthentication = () => {
  const ctx = useContext(AuthenticationContext);
  if (!ctx) {
    throw new Error("useAuthentication must be used within a AuthenticationProvider");
  }
  return ctx;
};

export const Authentication = (props: { children: JSX.Element }) => {
  const [state, setState] = createSignal<AuthenticationCtx>({
    isAuthenticated: false,
  });

  const loggin = (user: Exclude<AuthenticationCtx, { isAuthenticated: false }>["user"], provider: string) => {
    if (isServer) {
      return;
    }
    setState({ isAuthenticated: true, user });
    // set cookie for `lastUsedProvider`
    document.cookie = `lastUsedProvider=${provider} ;path=/ ;max-age=31536000 ;samesite=strict`;
  };

  const loggout = () => {
    if (isServer) {
      return;
    }
    setState({ isAuthenticated: false });
  };

  const session = () => {
    if (isServer) {
      return null;
    }
    const cookies = document.cookie.split(";");
    const session = cookies.find((cookie) => cookie.startsWith("session="));
    if (!session) {
      return null;
    }
    return session.split("=")[1];
  };

  const lastUsedProvider = () => {
    if (isServer) {
      return null;
    }
    const cookies = document.cookie.split(";");
    const provider = cookies.find((cookie) => cookie.startsWith("lastUsedProvider="));
    if (!provider) {
      return null;
    }
    return provider.split("=")[1];
  };

  return (
    <AuthenticationContext.Provider
      value={{
        ...state(),
        loggin,
        loggout,
        session,
        lastUsedProvider,
      }}
    >
      {props.children}
    </AuthenticationContext.Provider>
  );
};
