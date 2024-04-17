import { ActivityChange, cn, refreshActivities, setFreshActivities } from "@/lib/utils";
import { A, useAction, useNavigate, useSubmission } from "@solidjs/router";
import { CalendarFold, CircleAlert, Newspaper, Pencil, Plus } from "lucide-solid";
import { Switch, createSignal } from "solid-js";
import { Button, buttonVariants } from "../ui/button";
import { TextFieldTextArea } from "../ui/textarea";
import { TextField, TextFieldInput } from "../ui/textfield";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createNewPost } from "@/lib/api/posts";
import { createPlanCreationForm } from "@/lib/api/plans";
import { ToggleButton } from "../ui/toggle";
import { Match } from "solid-js";

export const EntryBox = () => {
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [postContent, setPostContent] = createSignal("");
  const [isPublished, setIsPublished] = createSignal(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPostContent("");
    setIsPublished(false);
  };

  const isEmpty = () => title().length + description().length === 0;
  const isPostEmpty = () => postContent().length === 0;

  const createPost = useAction(createNewPost);
  const isCreatingPost = useSubmission(createNewPost);

  const createPlan = useAction(createPlanCreationForm);
  const isCreatingPlan = useSubmission(createPlanCreationForm);

  const navigate = useNavigate();

  return (
    <div class="flex w-full flex-col bg-background pb-4">
      <div class="flex w-full flex-col gap-8 pt-4">
        <div class="flex flex-col w-full border border-neutral-200 dark:border-neutral-800 rounded-lg gap-4 bg-background shadow-md">
          <Tabs defaultValue="plan" class="w-full">
            <TabsList>
              <TabsTrigger value="plan" class="py-2 flex flex-row items-center gap-2">
                <CalendarFold class="size-4" />
                Plan
              </TabsTrigger>
              <TabsTrigger value="post" class="py-2 flex flex-row items-center gap-2">
                <Newspaper class="size-4" />
                Post
              </TabsTrigger>
            </TabsList>
            <TabsContent value="plan" class="pt-0 gap-4 flex flex-col">
              <div class="flex flex-col w-full px-4 gap-2">
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
                    class="border-none shadow-none !ring-0 !outline-none rounded-md px-2 resize-none bg-muted"
                    autoResize
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        resetForm();
                      }
                    }}
                  />
                </TextField>
              </div>
              <div class="flex flex-row items-center justify-between px-4">
                <div class="w-full">
                  <ToggleButton
                    disabled
                    variant="outline"
                    class="w-max flex items-center justify-center gap-2"
                    onChange={setIsPublished}
                    size="sm"
                  >
                    <Switch>
                      <Match when={isPublished()}>
                        <Pencil class="size-4" />
                        As Draft
                      </Match>
                      <Match when={!isPublished()}>
                        <Newspaper class="size-4" />
                        Public
                      </Match>
                    </Switch>
                  </ToggleButton>
                </div>
                <div class="w-max flex flex-row gap-2 items-center">
                  <Button
                    disabled={isEmpty() || isCreatingPlan.pending}
                    variant="default"
                    size="sm"
                    class="w-max flex items-center justify-center gap-2"
                    onClick={async () => {
                      const t = title();
                      const d = description();
                      if (t.length === 0 || d.length === 0) {
                        return;
                      }
                      const plan = await createPlan({
                        title: t,
                        description: d,
                      });
                      if (plan) {
                        navigate(`/plan/create/${plan.id}/general`);
                      }
                    }}
                  >
                    <span class="">Create Plan</span>
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="post" class="pt-0 gap-4 flex flex-col">
              <div class="flex flex-col w-full px-4">
                <TextField onChange={(v) => setPostContent(v)} value={postContent()}>
                  <TextFieldTextArea
                    placeholder="What's up?"
                    class="border-none shadow-none !ring-0 !outline-none rounded-md px-2 resize-none min-h-[6.5rem] bg-muted"
                    autoResize
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        resetForm();
                      }
                    }}
                  />
                </TextField>
              </div>
              <div class="flex flex-row items-center justify-between px-4">
                <div class="w-full"></div>
                <div class="w-max flex flex-row gap-2 items-center">
                  <Button variant="outline" size="sm">
                    Drafts
                  </Button>
                  <Button
                    disabled={isPostEmpty() || isCreatingPost.pending}
                    variant="default"
                    size="sm"
                    class="w-max flex items-center justify-center gap-2"
                    onClick={async () => {
                      const content = postContent();
                      if (content.length === 0) {
                        return;
                      }
                      const post = await createPost(content);
                      if (post) {
                        setPostContent("");
                        const changed: ActivityChange[] = [{ change: "add", activity: { type: "post", value: post } }];
                        setFreshActivities(changed);
                      }
                    }}
                  >
                    <Plus class="size-4" />
                    <span class="">Create Post</span>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
