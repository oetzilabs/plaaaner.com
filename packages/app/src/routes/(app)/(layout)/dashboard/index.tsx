import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Metrics } from "@/components/dashboard/metrics";
import { Greeting } from "@/components/dashboard/greeting";
import { Calendar } from "@/components/dashboard/calendar";
import { A } from "@solidjs/router";
import { useSession } from "@/components/SessionProvider";
import { Match, Suspense, Switch, createSignal } from "solid-js";
import { Loader2, Plus } from "lucide-solid";
import { NotLoggedIn } from "@/components/NotLoggedIn";
import { PlansList } from "@/components/dashboard/plans-list";
import { buttonVariants, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TextField, TextFieldInput } from "@/components/ui/textfield";
import { TextFieldTextArea } from "@/components/ui/textarea";
dayjs.extend(relativeTime);

export default function DashboardPage() {
  const session = useSession();
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
  };
  return (
    <Suspense
      fallback={
        <div class="flex p-4 w-full h-full items-center justify-center text-muted-foreground">
          <Loader2 class="size-6 animate-spin" />
        </div>
      }
    >
      <Switch
        fallback={
          <div class="flex p-4 w-full h-full items-center justify-center text-muted-foreground">
            <Loader2 class="size-6 animate-spin" />
          </div>
        }
      >
        <Match when={typeof session !== "undefined" && session().user === null}>
          <div class="flex p-4 w-full h-full items-center justify-center">
            <div class="w-max h-max min-w-96">
              <NotLoggedIn />
            </div>
          </div>
        </Match>
        <Match when={!session}>
          <div class="flex p-4 w-full h-full items-center justify-center">
            <div class="w-max h-max min-w-96">
              <Loader2 class="size-4 animate-spin" />
            </div>
          </div>
        </Match>
        <Match when={typeof session !== "undefined" && session().user !== null && session()}>
          {(s) => (
            <div class="flex flex-col gap-8 grow min-h-0 max-h-screen">
              <div class="flex flex-col w-full grow min-h-0 max-h-[calc(100vh-55px)] p-4">
                <div class="flex flex-col gap-4 w-full flex-grow min-h-0 max-h-screen overflow-clip">
                  <div class="container flex flex-col gap-4">
                    <div class=""></div>
                    <div class="flex w-full flex-col gap-2">
                      <span class="font-medium text-3xl">Welcome, {s().user?.name}</span>
                      <span class="text-sm">
                        Here's what's going on at{" "}
                        <A
                          href={
                            (s().workspace?.name ?? "default") === "default"
                              ? `/dashboard/organization/${s().organization?.id}`
                              : `/dashboard/organization/${s().organization?.id}/${s().workspace?.id}`
                          }
                          class="hover:underline text-indigo-500 font-medium"
                        >
                          {(s().workspace?.name ?? "default") === "default"
                            ? s().organization?.name
                            : s().workspace?.name}
                        </A>
                      </span>
                    </div>
                    <div class="w-full h-auto flex flex-row py-2 gap-4">
                      <div class="w-9/12">
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
                                href={`/plan/create?title=${encodeURI(title())}&description=${encodeURI(
                                  description()
                                )}`}
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
                        <Suspense
                          fallback={
                            <div class="p-4 py-10 w-full flex flex-col items-center justify-center">
                              <Loader2 class="size-4 animate-spin" />
                            </div>
                          }
                        >
                          <PlansList session={s()} />
                        </Suspense>
                      </div>
                      <div class="w-3/12 flex flex-col gap-4">
                        <Suspense
                          fallback={
                            <div class="p-4 w-full flex flex-col items-center justify-center">
                              <Loader2 class="size-4 animate-spin" />
                            </div>
                          }
                        >
                          <div class="flex flex-col w-full gap-2">
                            <div class="flex flex-row w-full items-center justify-between">
                              <div class="flex flex-col w-full font-medium">Notifications</div>
                              <div class="flex flex-col w-full"></div>
                            </div>
                            <div class="flex flex-col w-full p-2 border relative border-neutral-200 dark:border-neutral-800 rounded-md min-h-10"></div>
                            <div class="flex flex-col w-full p-2 border relative border-neutral-200 dark:border-neutral-800 rounded-md min-h-10"></div>
                          </div>
                          <div class="flex flex-col w-full gap-2">
                            <div class="flex flex-row w-full items-center justify-between">
                              <div class="flex flex-col w-full font-medium">Nearby Events</div>
                              <div class="flex flex-col w-full min-h-10"></div>
                            </div>
                            <div class="flex flex-col w-full p-2 border relative border-neutral-200 dark:border-neutral-800 rounded-md min-h-10"></div>
                          </div>
                        </Suspense>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Match>
      </Switch>
    </Suspense>
  );
}
