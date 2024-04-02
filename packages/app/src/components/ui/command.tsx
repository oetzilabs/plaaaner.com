import { cn } from "@/lib/utils";
import type { Dialog as DialogPrimitive } from "@kobalte/core";
import { Combobox as ComboboxPrimitive } from "@kobalte/core";
import { Search } from "lucide-solid";
import type { ComponentProps, ParentProps, VoidComponent, VoidProps } from "solid-js";
import { splitProps, type ParentComponent } from "solid-js";
import { Dialog, DialogContent } from "./dialog";

export const CommandItemLabel = ComboboxPrimitive.ItemLabel;

export const Command = <Option, OptGroup>(
  props: Omit<
    ParentProps<ComboboxPrimitive.ComboboxRootProps<Option, OptGroup>>,
    | "open"
    | "defaultOpen"
    | "multiple"
    | "value"
    | "defaultValue"
    | "removeOnBackspace"
    | "readOnly"
    | "allowsEmptyCollection"
  >
) => {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <ComboboxPrimitive.Root
      // force render list
      open
      // @ts-ignore -- prevent select
      value=""
      allowsEmptyCollection
      class={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        local.class
      )}
      {...rest}
    />
  );
};

export const CommandList = <Option, OptGroup>(
  props: VoidProps<ComboboxPrimitive.ComboboxListboxProps<Option, OptGroup>>
) => {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <ComboboxPrimitive.Listbox
      cmdk-list=""
      class={cn("max-h-full md:max-h-[300px] overflow-y-auto overflow-x-hidden p-1", local.class)}
      {...rest}
    />
  );
};

export const CommandInput: VoidComponent<ComboboxPrimitive.ComboboxInputProps> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <ComboboxPrimitive.Control class="flex items-center border-b px-3 gap-2" cmdk-input-wrapper="">
      <Search class="w-3.5 h-3.5" />
      <ComboboxPrimitive.Input
        cmdk-input=""
        class={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          local.class
        )}
        {...rest}
      />
    </ComboboxPrimitive.Control>
  );
};

export const CommandItem: ParentComponent<ComboboxPrimitive.ComboboxItemProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "item", "onSelect"]);

  return (
    <ComboboxPrimitive.Item
      item={local.item}
      cmdk-item=""
      class={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm p-2 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50",
        local.class
      )}
      onSelect={local.onSelect}
      {...rest}
    />
  );
};

export const CommandShortcut: ParentComponent<ComponentProps<"span">> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);

  return <span class={cn("ml-auto text-xs tracking-widest text-muted-foreground", local.class)} {...rest} />;
};

export const CommandHeading: ParentComponent<ComboboxPrimitive.ComboboxSectionProps> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <ComboboxPrimitive.Section
      cmdk-heading=""
      class={cn("px-3 py-2 text-xs font-medium text-muted-foreground [&:not(&:first-of-type)]:mt-2", local.class)}
      {...rest}
    />
  );
};

export const CommandDialog = <Option, OptGroup>(
  props: DialogPrimitive.DialogRootProps &
    Omit<
      ParentProps<ComboboxPrimitive.ComboboxRootProps<Option, OptGroup>>,
      | "open"
      | "defaultOpen"
      | "multiple"
      | "value"
      | "defaultValue"
      | "removeOnBackspace"
      | "readOnly"
      | "allowsEmptyCollection"
    >
) => {
  const [local, rest] = splitProps(props, ["children"]);

  return (
    <Dialog {...rest}>
      <DialogContent class="overflow-hidden p-0 border-none">
        <Command
          class="[&_[cmdk-heading]]:px-2 [&_[cmdk-heading]]:font-medium [&_[cmdk-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 [&_[cmdk-list]:not([hidden])_~[cmdk-list]]:pt-0 [&_[cmdk-list]]:px-2"
          {...rest}
        >
          {local.children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};
