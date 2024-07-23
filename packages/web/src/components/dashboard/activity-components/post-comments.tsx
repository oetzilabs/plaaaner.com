import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Image, ImageFallback, ImageRoot } from "@/components/ui/image";
import { TextArea } from "@/components/ui/textarea";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { getActivities } from "@/lib/api/activity";
import { commentOnPost, deletePostComment, getPostComments, getPosts } from "@/lib/api/posts";
import { UserSession } from "@/lib/auth/util";
import { cn, shortUsername } from "@/lib/utils";
import { revalidate, useAction, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import { CircleAlert, Ellipsis, Loader2, MessageSquareDiff, Trash } from "lucide-solid";
import { createResource, createSignal, For, Match, Show, Switch } from "solid-js";
import { Transition } from "solid-transition-group";

export const PostCommentsSection = (props: {
  postId: string;
  username: string;
  increment: number;
  session: UserSession;
}) => {
  const [comments, actions] = createResource(() => getPostComments(props.postId), {
    name: "getPlanComments",
    initialValue: [],
  });

  const deleteComment = useAction(deletePostComment);
  const isDeletingComment = useSubmission(deletePostComment);

  type Comment = NonNullable<Awaited<ReturnType<typeof comments>>>[number];

  const filteredComments = (options: { last?: number }, comms: Comment[]): Comment[] => {
    const { last } = options;
    if (last && last >= 0) {
      return rev(comms.slice(0, last));
    }
    return rev(comms);
  };

  const rev = (theC: Comment[]): Comment[] => {
    const result: Comment[] = [];
    for (let i = theC.length - 1; i >= 0; i--) {
      result.push(theC[i]);
    }
    return result;
  };

  const [visibleComments, setVisibleComments] = createSignal(props.increment);

  const showMore = () => {
    setVisibleComments((prev) => prev + props.increment);
  };

  const hasMore = () => {
    return visibleComments() < comments().length;
  };

  const showLess = () => {
    setVisibleComments((prev) => prev - props.increment);
  };

  const hasLess = () => {
    return visibleComments() > props.increment;
  };

  const removeComment = async (commentId: string) => {
    const removed = await deleteComment(commentId);

    await revalidate(getPostComments.keyFor(removed.postId));
    await revalidate(getActivities.key);
    await revalidate(getPosts.key);
  };

  return (
    <>
      <Show when={typeof comments !== "undefined" && comments().length > 0 && comments()}>
        {(cs) => (
          <div class="w-full flex flex-col items-center justify-between p-2 gap-2">
            <Show when={hasMore() || hasLess()}>
              <div class="w-full items-center justify-center flex gap-2">
                <Show when={hasMore()}>
                  <Button size="sm" variant="link" class="p-0" onClick={() => showMore()}>
                    Show more
                  </Button>
                </Show>
                <Show when={hasLess()}>
                  <Button size="sm" variant="link" class="p-0" onClick={() => showLess()}>
                    Show less
                  </Button>
                </Show>
              </div>
            </Show>
            <For each={filteredComments({ last: visibleComments() }, cs())}>
              {(comment) => (
                <div class="w-full flex flex-row items-center justify-between gap-4 leading-tight text-sm p-2 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 rounded-md group">
                  <ImageRoot class="self-start size-6 text-[8pt] text-muted-foreground">
                    <Image src={""} alt={`Profile Picture of ${comment.user.name}`} />
                    <ImageFallback>{shortUsername(comment.user.name)}</ImageFallback>
                  </ImageRoot>
                  <div class="flex flex-row items-start justify-between w-full">
                    <div class="flex-1 flex flex-col w-full gap-1">
                      <span class="text-muted-foreground text-xs font-bold">
                        {props.username} {dayjs(comment.createdAt).format("LT")}
                      </span>
                      <span class="text-justify w-full pr-1">{comment.comment}</span>
                    </div>
                    <div class="w-max flex">
                      <DropdownMenu>
                        <DropdownMenuTrigger class="p-2 text-muted-foreground/50 group-hover:text-foreground">
                          <Ellipsis class="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem disabled>
                            <CircleAlert class="size-4" />
                            Report
                          </DropdownMenuItem>
                          <Show when={comment.user.id === props.session?.user?.id}>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              class="cursor-pointer text-rose-500 hover:!text-rose-500 hover:!bg-rose-100"
                              disabled={isDeletingComment.pending}
                              closeOnSelect={false}
                              onSelect={async () => {
                                if (comment.user.id !== props.session?.user?.id) return;
                                await removeComment(comment.id);
                                await actions.refetch();
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
                </div>
              )}
            </For>
          </div>
        )}
      </Show>
      <div class="flex flex-row items-center justify-between p-4 gap-2">
        <ImageRoot class="self-start size-8 text-xs text-muted-foreground">
          <Image src={""} alt={`Profile Picture of ${props.username}`} />
          <ImageFallback>{shortUsername(props.username)}</ImageFallback>
        </ImageRoot>
        <div class="flex-1 flex flex-col">
          <PostComment
            postId={props.postId}
            onPost={() => {
              actions.refetch();
            }}
          />
        </div>
      </div>
    </>
  );
};

const PostComment = (props: { postId: string; onPost: () => void }) => {
  const [comment, setComment] = createSignal("");

  const addComment = useAction(commentOnPost);
  const isCommenting = useSubmission(commentOnPost);
  const [isFocused, setIsFocused] = createSignal(false);

  const postComment = async () => {
    const c = comment();
    if (c.trim().length === 0) return;
    const commented = addComment({ postId: props.postId, comment: c });
    await revalidate(getPostComments.keyFor(props.postId));
    await revalidate(getActivities.key);
    return commented;
  };

  return (
    <div class="w-full h-auto flex flex-col gap-2">
      <TextFieldRoot onChange={setComment} value={comment()}>
        <TextArea
          placeholder="Add a comment..."
          autoResize
          class={cn("shadow-none !ring-0 !outline-none rounded-md px-0 resize-none  p-2 min-h-10 transition-height", {
            "bg-muted": isFocused() || comment().length > 0,
          })}
          style={{
            height: isFocused() || comment().length > 0 ? "auto" : "0",
          }}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            if (comment().length > 0) return;
            setIsFocused(false);
          }}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === "Escape") {
              setComment("");
            }
          }}
        ></TextArea>
      </TextFieldRoot>
      <Transition name="slide-fade-down">
        <Show when={isFocused()}>
          <div class="flex flex-row w-full items-center justify-between gap-2">
            <div class="w-full"></div>
            <div class="w-max flex flex-row gap-1">
              <Button
                size="sm"
                aria-disabled={isCommenting.pending && isCommenting.input[0].postId === props.postId}
                disabled={isCommenting.pending && isCommenting.input[0].postId === props.postId}
                onClick={async () => {
                  await postComment();
                  setComment("");
                  props.onPost();
                }}
                class="flex flex-row gap-2"
              >
                <Switch
                  fallback={
                    <div class="flex flex-row gap-2 items-center justify-center">
                      <MessageSquareDiff class="size-4" />
                      <span>Comment</span>
                    </div>
                  }
                >
                  <Match when={isCommenting.pending && isCommenting.input[0].postId === props.postId}>
                    <Loader2 class="size-4 animate-spin" />
                    <span>Commenting</span>
                  </Match>
                </Switch>
              </Button>
            </div>
          </div>
        </Show>
      </Transition>
    </div>
  );
};
