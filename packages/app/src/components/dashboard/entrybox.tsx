import type { UserSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A } from "@solidjs/router";
import { Plus } from "lucide-solid";
import { createSignal } from "solid-js";
import { Button, buttonVariants } from "../ui/button";
import { TextFieldTextArea } from "../ui/textarea";
import { TextField, TextFieldInput } from "../ui/textfield";

export const EntryBox = () => {
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
  };

  const isEmpty = () => title().length + description().length === 0;

  return (
    <div class="flex w-full flex-col sticky top-0 z-10">
      <div class="flex w-full flex-col gap-8 bg-background pt-2">
        <div class="flex flex-col w-full border border-neutral-200 dark:border-neutral-800 rounded-lg p-2 gap-4">
          <div class="flex flex-col w-full px-2">
            <TextField onChange={(v) => setTitle(v)} value={title()}>
              <TextFieldInput
                placeholder="Plan Name"
                class="border-none shadow-none bg-transparent !ring-0 !outline-none text-xl rounded-md font-semibold px-0"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    resetForm();
                  }
                }}
              />
            </TextField>
            <TextField onChange={(v) => setDescription(v)} value={description()}>
              <TextFieldTextArea
                placeholder="Describe your new plan..."
                class="border-none shadow-none !ring-0 !outline-none rounded-md px-0 resize-none"
                autoResize
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    resetForm();
                  }
                }}
              />
            </TextField>
          </div>
          <div class="flex flex-row items-center justify-between">
            <div class="w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetForm();
                }}
              >
                Reset
              </Button>
            </div>
            <div class="w-max flex flex-row gap-2 items-center">
              <Button variant="outline" size="sm">
                Drafts
              </Button>
              <A
                href={`/plan/create${
                  isEmpty() ? "" : `?${new URLSearchParams({ title: title(), description: description() }).toString()}`
                }`}
                class={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "w-max flex items-center justify-center gap-2"
                )}
              >
                <Plus class="size-4" />
                <span class="">Create Plan</span>
              </A>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full bg-gradient-to-b from-background to-transparent h-4" />
    </div>
  );
};
