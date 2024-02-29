import { cn } from "@/lib/utils";
import { Dialog as DialogPrimitive } from "@kobalte/core";
import { X } from "lucide-solid";
import type { ComponentProps, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogOverlay: ParentComponent<DialogPrimitive.DialogOverlayProps> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Overlay
      class={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0",
        local.class,
      )}
      {...rest}
    />
  );
};

export const DialogContent: ParentComponent<DialogPrimitive.DialogContentProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);

  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <div class="fixed inset-0 z-50 flex justify-center items-center">
        <DialogPrimitive.Content
          class={cn(
            "fixed top-0 left-0 md:left-[50%] md:top-[50%] z-50 grid w-full max-w-lg md:translate-x-[-50%] md:translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 md:data-[expanded]:zoom-in-95 md:data-[closed]:slide-out-to-left-1/2 md:data-[closed]:slide-out-to-top-[48%] md:data-[expanded]:slide-in-from-left-1/2 md:data-[expanded]:slide-in-from-top-[48%] sm:rounded-lg md:w-full",
            local.class,
          )}
          {...rest}
        >
          {local.children}
          <DialogPrimitive.CloseButton class="absolute right-3.5 top-3.5 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X class="w-3.5 h-3.5" />
            <span class="sr-only">Close</span>
          </DialogPrimitive.CloseButton>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  );
};

export const DialogTitle: ParentComponent<DialogPrimitive.DialogTitleProps> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <DialogPrimitive.Title class={cn("text-lg font-semibold text-foreground", local.class)} {...rest} />;
};

export const DialogDescription: ParentComponent<DialogPrimitive.DialogDescriptionProps> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <DialogPrimitive.Description class={cn("text-sm text-muted-foreground", local.class)} {...rest} />;
};

export const DialogHeader: ParentComponent<ComponentProps<"div">> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <div class={cn("flex flex-col space-y-2 text-center sm:text-left", local.class)} {...rest} />;
};

export const DialogFooter: ParentComponent<ComponentProps<"div">> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <div class={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", local.class)} {...rest} />;
};
