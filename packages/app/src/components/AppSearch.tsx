import {
  CommandDialog,
  CommandHeading,
  CommandInput,
  CommandItem,
  CommandItemLabel,
  CommandList,
} from "@/components/ui/command";
import { getAuthenticatedUser } from "@/lib/auth/util";
import { useColorMode } from "@kobalte/core";
import { createAsync } from "@solidjs/router";
import { User } from "lucia";
import { Search } from "lucide-solid";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { toast } from "solid-sonner";

type Option = {
  label: string;
  value: string;
  onSelect(user: User): Promise<void>;
};

type List = {
  label: string;
  options: Option[];
};

export const AppSearch = () => {
  const [openSearch, setOpenSearch] = createSignal(false);
  const user = createAsync(() => getAuthenticatedUser());
  const { setColorMode, toggleColorMode } = useColorMode();

  const data: List[] = [
    {
      label: "Suggestions",
      options: [
        {
          label: "Calendar",
          value: "Calendar",
          onSelect: async (user) => {
            toast.info("hello", { description: user.username });
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
          onSelect: async () => {},
        },
        {
          label: "Messages",
          value: "Messages",
          onSelect: async () => {},
        },
        {
          label: "Settings",
          value: "Settings",
          onSelect: async () => {},
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
          label: "Toggle Mode",
          value: "Toggle Mode",
          onSelect: async (user) => {
            toggleColorMode();
          },
        },
      ],
    },
  ];

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
      <CommandDialog<Option, List>
        open={openSearch()}
        onOpenChange={setOpenSearch}
        options={data}
        optionValue="value"
        optionTextValue="label"
        optionLabel="label"
        optionGroupChildren="options"
        placeholder="Type a command or search..."
        itemComponent={(props) => (
          <CommandItem item={props.item} class="flex flex-row items-center gap-2">
            <CommandItemLabel>{props.item.rawValue.label}</CommandItemLabel>
          </CommandItem>
        )}
        sectionComponent={(props) => <CommandHeading>{props.section.rawValue.label}</CommandHeading>}
        class="md:rounded-lg md:border md:shadow-md"
        onChange={(e: Option) => {
          const u = user();
          if (!u) {
            return;
          }
          e.onSelect(u);
        }}
      >
        <CommandInput />
        <CommandList />
      </CommandDialog>
    </div>
  );
};
