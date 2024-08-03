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
import { A, revalidate, useAction, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { CircleAlert, Ellipsis, Eye, EyeOff, Trash } from "lucide-solid";
import { For, Match, Show, Switch } from "solid-js";
import { toast } from "solid-sonner";
import { getActivities } from "../../../lib/api/activity";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
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
            <div class="flex flex-row gap-4 items-center justify-between w-full">
              <div class="flex flex-row gap-4 items-center justify-center w-max">
                <ImageRoot
                  class="self-start size-8 text-xs text-muted-foreground"
                  as={A}
                  href={`/u/${props.post.owner.id}`}
                >
                  <Image src={""} alt={`Profile Picture of ${props.post.owner.name}`} />
                  <ImageFallback>{shortUsername(props.post.owner.name)}</ImageFallback>
                </ImageRoot>
                <div class="flex flex-col gap-0.5">
                  <A
                    href={`/u/${props.post.owner.id}`}
                    class="text-sm font-semibold w-max hover:underline underline-offset-2"
                  >
                    {props.post.owner.name}
                  </A>
                  <div class="flex flex-row gap-1 items-center">
                    <Tooltip>
                      <TooltipTrigger class="!p-0 text-xs font-normal leading-none text-muted-foreground w-max">
                        {dayjs(props.post.createdAt).fromNow()}
                      </TooltipTrigger>
                      <TooltipContent>{dayjs(props.post.createdAt).format("LLL")}</TooltipContent>
                    </Tooltip>
                    <Show when={props.post.location}>
                      {(loc) => (
                        <span class="text-xs font-normal leading-none text-muted-foreground w-max">
                          {loc().zipCode} - {loc().city}
                        </span>
                      )}
                    </Show>
                  </div>
                </div>
              </div>
              <div class="w-max flex">
                <DropdownMenu>
                  <DropdownMenuTrigger as={Button} variant="ghost" size="sm" class="!p-1 !size-7">
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
                        class="cursor-pointer text-rose-500 hover:!text-rose-500 hover:!bg-rose-50"
                        disabled={isDeletingPost.pending || props.post.owner_id !== props.session?.user?.id}
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
              <For each={props.post.content.split("\n")}>
                {(line) => <span class="w-full pr-1 text-justify text-wrap">{line}</span>}
              </For>
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
