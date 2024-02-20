import { createSignal, createEffect, onCleanup, JSX, JSXElement, ComponentProps } from "solid-js";
import {
  CommandDialog,
  CommandItem,
  CommandItemLabel,
  CommandInput,
  CommandList,
  CommandHeading,
} from "@/components/ui/command";
import { Search  } from "lucide-solid";
import { toast } from "solid-sonner";

type Option = {
  label: string;
  value: string;
  onSelect?: ComponentProps<"li">["onSelect"]
};

type List = {
  label: string;
  options: Option[];
};

export const AppSearch = () => {
  const [openSearch, setOpenSearch] = createSignal(false);

  const data: List[] = [
    {
      label: "Suggestions",
      options: [
        {
          label: "Calendar",
          value: "Calendar",
          onSelect: async () => {
            toast.info("ASDF");
          },
        },
        {
          label: "Events",
          value: "Events",
          onSelect: async (e) => {
            e.preventDefault();
            console.log("lol")
          },
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
        class="flex flex-row items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 px-2.5 py-1.5 gap-2.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted-foreground bg-background"
        onClick={() => setOpenSearch(true)}
      >
        <Search class="w-4 h-4" />
        <div class="min-w-[300px] max-w-full text-sm">Search...</div>
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
          <CommandItem item={props.item} class="flex flex-row items-center gap-2" onSelect={props.item.rawValue.onSelect}>
            <CommandItemLabel>{props.item.rawValue.label}</CommandItemLabel>
          </CommandItem>
        )}
        sectionComponent={(props) => <CommandHeading>{props.section.rawValue.label}</CommandHeading>}
        class="rounded-lg border shadow-md"
      >
        <CommandInput />
        <CommandList />
      </CommandDialog>
    </div>
  );
};
