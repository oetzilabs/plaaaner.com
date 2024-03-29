import { createAsync, A } from "@solidjs/router";
import { getPlans } from "@/lib/api/plans";
import { For, Show, createSignal } from "solid-js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import type { UserSession } from "@/lib/auth/util";
import { Button, buttonVariants } from "../ui/button";
import { ChevronRight, Plus } from "lucide-solid";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TextField, TextFieldInput } from "../ui/textfield";
import { TextFieldTextArea } from "../ui/textarea";
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

export const PlansList = (props: { session: UserSession }) => {
  const plans = createAsync(() => getPlans());

  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
  };

  return (
    <div class="flex flex-col w-full gap-2">
      <div class="flex flex-col w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 gap-4">
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
              class="border-none shadow-none !ring-0 !outline-none rounded-md px-0"
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
              variant="ghost"
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
              href={`/plan/create?title=${encodeURI(title())}&description=${encodeURI(description())}`}
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
      <div class="w-full h-auto py-4">
        <ol class="relative w-full">
          <For each={plans()}>
            {(plan, index) => (
              <A
                href={`/dashboard/organizations/${props.session.organization?.id}/workspace/${props.session.workspace?.id}/plans/${plan.id}`}
              >
                <li
                  class={cn(
                    "border relative border-neutral-200 dark:border-neutral-800 rounded-md hover:shadow-sm shadow-none transition-shadow",
                    {
                      "mb-10": index() < (plans()?.length ?? 0) - 1,
                    }
                  )}
                >
                  <Show when={index() < (plans()?.length ?? 0) - 1}>
                    <div class="absolute left-4 -bottom-10 w-px h-10 bg-neutral-200 dark:bg-neutral-800"></div>
                  </Show>
                  <div class="w-full h-36 border-b border-neutral-200 dark:border-neutral-800"></div>
                  <div class="flex flex-row items-center justify-between px-3 py-2">
                    <div class="flex flex-col items-start">
                      <div class="flex flex-row gap-2 items-center">
                        <h3 class="text-sm font-semibold text-neutral-900 dark:text-white">{plan.name}</h3>
                        <time class="text-xs font-normal leading-none text-neutral-400 dark:text-neutral-500">
                          {dayjs(plan.createdAt).format("Do MMM, YYYY")}
                        </time>
                      </div>
                      <span class="text-xs font-normal text-neutral-500 dark:text-neutral-400">{plan.description}</span>
                    </div>
                    <div class="flex flex-col items-center justify-end"></div>
                  </div>
                </li>
              </A>
            )}
          </For>
        </ol>
      </div>
    </div>
  );
};
