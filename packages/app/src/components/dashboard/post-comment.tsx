import { useAction, useSubmission } from "@solidjs/router";
import { CircleAlert, Ellipsis, Loader2, Trash } from "lucide-solid";
import { createSignal, Switch, Match, For, Show } from "solid-js";
import { commentOnPlan } from "@/lib/api/plans";
import { TextFieldTextArea } from "../ui/textarea";
import { TextField } from "../ui/textfield";
import { Button } from "../ui/button";
import { deletePlanComment, getPlanComments } from "@/lib/api/plans";
import { createResource } from "solid-js";
import dayjs from "dayjs";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenu,
} from "../ui/dropdown-menu";
import { ImageRoot, ImageFallback, Image } from "../ui/image";

export const PlanCommentsSection = (props: { planId: string; username: string; increment: number }) => {
  const [comments, actions] = createResource(() => getPlanComments(props.planId), {
    name: "getPlanComments",
    initialValue: [],
  });

  const deleteComment = useAction(deletePlanComment);
  const isDeletingComment = useSubmission(deletePlanComment);

  const shortUsername = (name: string) => {
    const ns = name.trim().split(" ");
    let n = "";
    for (let x of ns) {
      n += x[0];
    }

    return n;
  };

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
    await deleteComment(commentId);
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
                <div class="w-full flex flex-row items-center justify-between gap-2 leading-tight text-sm p-2 hover:bg-muted rounded-md group">
                  <ImageRoot class="self-start size-8 text-xs text-muted-foreground">
                    <Image src={""} alt={`Profile Picture of ${comment.user.name}`} />
                    <ImageFallback>{shortUsername(comment.user.name)}</ImageFallback>
                  </ImageRoot>
                  <div class="flex flex-row items-start justify-between w-full">
                    <div class="flex-1 flex flex-col w-full gap-1">
                      <span class="text-justify w-full pr-1">{comment.comment}</span>
                      <span class="text-muted-foreground text-xs font-bold">
                        {props.username} {dayjs(comment.createdAt).format("LT")}
                      </span>
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            class="cursor-pointer text-rose-500 hover:!text-rose-500 hover:!bg-rose-100"
                            disabled={isDeletingComment.pending}
                            onClick={async () => {
                              await removeComment(comment.id);
                              await actions.refetch();
                            }}
                          >
                            <Trash class="size-4" />
                            Delete
                          </DropdownMenuItem>
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
      <div class="flex flex-row items-center justify-between px-3 py-2 gap-2">
        <ImageRoot class="self-start size-8 text-xs text-muted-foreground">
          <Image src={""} alt={`Profile Picture of ${props.username}`} />
          <ImageFallback>{shortUsername(props.username)}</ImageFallback>
        </ImageRoot>
        <div class="flex-1 flex flex-col">
          <PostComment
            postId={props.planId}
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

  const addComment = useAction(commentOnPlan);
  const isCommenting = useSubmission(commentOnPlan);

  const postComment = async () => {
    const c = comment();
    if (c.trim().length === 0) return;
    const a = addComment({ planId: props.postId, comment: c });
    return a;
  };

  return (
    <div class="w-full h-auto flex flex-col gap-2">
      <TextField
        onChange={(v) => {
          if (!v) return;
          setComment(v);
        }}
        value={comment()}
      >
        <TextFieldTextArea
          placeholder="Add a comment..."
          autoResize
          class="border-none shadow-none !ring-0 !outline-none rounded-md px-0 resize-none bg-muted p-2"
        ></TextFieldTextArea>
      </TextField>
      <div class="flex flex-row w-full items-center justify-between gap-2">
        <div class="w-full"></div>
        <div class="w-max flex flex-row gap-1">
          <Button
            size="sm"
            aria-disabled={isCommenting.pending && isCommenting.input[0].planId === props.postId}
            disabled={isCommenting.pending && isCommenting.input[0].planId === props.postId}
            onClick={async () => {
              await postComment();
              setComment("");
              props.onPost();
            }}
            class="flex flex-row gap-2"
          >
            <Switch fallback={<span>Comment</span>}>
              <Match when={isCommenting.pending && isCommenting.input[0].planId === props.postId}>
                <Loader2 class="size-4 animate-spin" />
                <span>Commenting</span>
              </Match>
            </Switch>
          </Button>
        </div>
      </div>
    </div>
  );
};
