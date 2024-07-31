import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Image, ImageFallback, ImageRoot } from "@/components/ui/image";
import { deletePost, getPosts } from "@/lib/api/posts";
import { UserSession } from "@/lib/auth/util";
import { setFreshActivities, shortUsername } from "@/lib/utils";
import { Posts } from "@oetzilabs-plaaaner-com/core/src/entities/posts";
import { revalidate, useAction, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { CircleAlert, Ellipsis, Eye, EyeOff, Trash } from "lucide-solid";
import { For, Match, Show, Switch } from "solid-js";
import { toast } from "solid-sonner";
import { getActivities } from "../../../lib/api/activity";
import { Button } from "../../ui/button";
import { PostCommentsSection } from "./post-comments";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);

export const PostActivity = (props: { session: UserSession; post: Posts.Frontend }) => {
  const removePost = useAction(deletePost);
  const isDeletingPost = useSubmission(deletePost);

  return (
    <>
      <div class="rounded-md bg-background">
        <div class="flex flex-col p-4 border-b border-neutral-200 dark:border-neutral-800 w-full">
          <div class="flex flex-col items-start w-full gap-4">
            <div class="flex flex-row gap-2 items-center justify-between w-full">
              <div class="flex flex-row gap-2 items-center justify-center w-max">
                <ImageRoot class="self-start size-8 text-xs text-muted-foreground">
                  <Image src={""} alt={`Profile Picture of ${props.post.owner.name}`} />
                  <ImageFallback>{shortUsername(props.post.owner.name)}</ImageFallback>
                </ImageRoot>
                <div class="flex flex-col gap-0.5">
                  <h3 class="text-sm font-semibold w-max">{props.post.owner.name}</h3>
                  <time class="text-xs font-normal leading-none text-muted-foreground w-max">
                    {dayjs(props.post.createdAt).format("Do MMM, YYYY")}
                  </time>
                </div>
              </div>
              <div class="w-max flex">
                <DropdownMenu>
                  <DropdownMenuTrigger as={Button} variant="outline" size="sm" class="!p-2">
                    <Ellipsis class="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem disabled>
                      <CircleAlert class="size-4" />
                      Report
                    </DropdownMenuItem>
                    <Show when={props.post.owner.id === props.session?.user?.id}>
                      <Switch>
                        <Match when={props.post.status === "published"}>
                          <DropdownMenuItem>
                            <EyeOff class="size-4" />
                            Hide
                          </DropdownMenuItem>
                        </Match>
                        <Match when={props.post.status === "hidden" || props.post.status === "draft"}>
                          <DropdownMenuItem>
                            <Eye class="size-4" />
                            {props.post.updatedAt ? "Republish" : "Publish"}
                          </DropdownMenuItem>
                        </Match>
                      </Switch>
                    </Show>
                    <Show when={props.post.owner.id === props.session?.user?.id}>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        class="cursor-pointer text-rose-500 hover:!text-rose-500 hover:!bg-rose-100"
                        disabled={isDeletingPost.pending}
                        closeOnSelect={false}
                        onSelect={async () => {
                          if (props.post.owner.id !== props.session?.user?.id) return;
                          await removePost(props.post.id);
                        }}
                      >
                        <Trash class="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </Show>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div class="text-base font-normal text-justify flex flex-col gap-2">
              <For each={props.post.content.split("\n")}>{(line) => <span class="w-full pr-1">{line}</span>}</For>
            </div>
          </div>
        </div>
      </div>
      <PostCommentsSection
        postId={props.post.id}
        username={props.session.user?.name ?? "John Doe"}
        increment={3}
        session={props.session}
      />
    </>
  );
};
