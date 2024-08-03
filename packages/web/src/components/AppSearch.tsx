import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getAuthenticatedSession, type UserSession } from "@/lib/auth/util";
import { useColorMode } from "@kobalte/core";
import { createAsync, useNavigate } from "@solidjs/router";
import { Search } from "lucide-solid";
import { createEffect, createSignal, For, onCleanup } from "solid-js";
import { toast } from "solid-sonner";

type Option = {
  label: string;
  value: string;
  onSelect(user: UserSession): Promise<void>;
};

type List = {
  label: string;
  options: Option[];
};

export const AppSearch = () => {
  const [openSearch, setOpenSearch] = createSignal(false);
  const session = createAsync(() => getAuthenticatedSession());
  const { setColorMode, toggleColorMode, colorMode } = useColorMode();
  const navigate = useNavigate();

  const DEFAULT_DATA: List[] = [
    {
      label: "Suggestions",
      options: [
        {
          label: "Dashboard",
          value: "Dashboard",
          onSelect: async (user) => {
            navigate("/dashboard");
            setOpenSearch(false);
          },
        },
        {
          label: "Calendar",
          value: "Calendar",
          onSelect: async (user) => {
            toast.info("hello", { description: user.user?.name });
          },
        },
        {
          label: "Events",
          value: "Events",
          onSelect: async (e) => {},
        },
      ],
    },
    {
      label: "User",
      options: [
        {
          label: "Profile",
          value: "Profile",
          onSelect: async () => {
            navigate("/profile");
            setOpenSearch(false);
          },
        },
        {
          label: "Messages",
          value: "Messages",
          onSelect: async () => {
            navigate("/messages");
            setOpenSearch(false);
          },
        },
        {
          label: "Settings",
          value: "Settings",
          onSelect: async () => {
            navigate("/profile/settings");
            setOpenSearch(false);
          },
        },
      ],
    },
    {
      label: "Theme",
      options: [
        {
          label: "Dark Mode",
          value: "Dark Mode",
          onSelect: async (user) => {
            setColorMode("dark");
          },
        },
        {
          label: "Light Mode",
          value: "Light Mode",
          onSelect: async (user) => {
            setColorMode("light");
          },
        },
        {
          label: "System Mode",
          value: "System Mode",
          onSelect: async (user) => {
            setColorMode("system");
          },
        },
      ],
    },
  ];

  const [data, setData] = createSignal<List[]>(DEFAULT_DATA);

  createEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenSearch((o) => !o);
      }
    };

    document.addEventListener("keydown", down);

    onCleanup(() => {
      document.removeEventListener("keydown", down);
    });
  });

  return (
    <div class="flex flex-row items-center">
      <div
        class="flex flex-row items-center justify-between rounded-lg border-transparent border md:border-neutral-200 dark:md:border-neutral-800 px-2.5 h-8 gap-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted-foreground bg-background w-max"
        onClick={() => setOpenSearch(true)}
      >
        <Search class="w-4 h-4" />
        <div class="sr-only md:min-w-[300px] md:not-sr-only max-w-full text-sm">Search plans...</div>
      </div>
      <CommandDialog open={openSearch()} onOpenChange={setOpenSearch}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <For each={data()}>
            {(list) => (
              <CommandGroup heading={list.label}>
                <For each={list.options}>
                  {(option) => (
                    <CommandItem
                      class="flex flex-row items-center gap-2"
                      onSelect={() => {
                        const sess = session();
                        if (!sess) return;
                        if (!sess.user) return;
                        option.onSelect(sess);
                      }}
                    >
                      {option.label}
                    </CommandItem>
                  )}
                </For>
              </CommandGroup>
            )}
          </For>
        </CommandList>
      </CommandDialog>
    </div>
  );
};
