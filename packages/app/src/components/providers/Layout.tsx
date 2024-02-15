import { JSX, Show, createContext, createSignal, useContext } from "solid-js";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { z } from "zod";
import { Transition } from "solid-transition-group";
import { cn } from "../../lib/utils";

const LayoutSchema = z.object({
  header: z.boolean(),
  footer: z.boolean(),
});

const LayoutCtx = createContext<
  z.infer<typeof LayoutSchema> & {
    fullScreen: () => void;
    reset: () => void;
  }
>({
  header: true,
  footer: true,
  fullScreen: () => {
    throw new Error("Not implemented");
  },
  reset: () => {
    throw new Error("Not implemented");
  },
});

export const Layout = (props: { children: JSX.Element }) => {
  const [headerShown, setHeaderShown] = createSignal(true);
  const [footerShown, setFooterShown] = createSignal(true);

  const fullScreen = () => {
    setHeaderShown(false);
    setFooterShown(false);
  };

  const reset = () => {
    setHeaderShown(true);
    setFooterShown(true);
  };

  return (
    <LayoutCtx.Provider
      value={{
        header: headerShown(),
        footer: footerShown(),
        fullScreen,
        reset,
      }}
    >
      <Header />
      <div
        class={cn("w-full flex flex-col", {
          "container px-4": headerShown() && footerShown(),
        })}
        style={{
          "flex-grow": "1",
        }}
      >
        {props.children}
      </div>
      <Footer />
    </LayoutCtx.Provider>
  );
};

export const useLayout = () => {
  const ctx = useContext(LayoutCtx);
  if (!ctx) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return ctx;
};
