import type { Plans } from "@oetzilabs-plaaaner-com/core/src/entities/plans";
import { getActivities } from "@/lib/api/activity";
import { commentOnPlan, deletePlanComment, getPlanComments } from "@/lib/api/plans";
import type { UserSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A, createAsync, useAction, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { For, Match, Show, Switch, createResource } from "solid-js";
import { Image, ImageFallback, ImageRoot } from "../ui/image";
import { useSession } from "../SessionProvider";
import { createSignal } from "solid-js";
import { TextField } from "../ui/textfield";
import { TextFieldTextArea } from "../ui/textarea";
import { Button } from "../ui/button";
import { CircleAlert, Ellipsis, Loader2, Trash } from "lucide-solid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Transition, TransitionGroup } from "solid-transition-group";
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);

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

const PlanCommentsSection = (props: { planId: string; username: string; increment: number }) => {
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
    return visibleComments() < comments().length ?? false;
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
      <Show when={typeof comments !== "undefined" && comments()}>
        {(cs) => (
          <div class="w-full flex flex-col items-center justify-between p-2 gap-2">
            <Show when={hasMore() || hasLess()}>
              <div class="w-full p-1 items-center justify-center flex gap-2">
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
                            onClick={async () =>{
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

export const Activities = (props: { session: UserSession }) => {
  const [activities, actions] = createResource(() => getActivities({ fromDate: null }));
  const session = useSession();

  const lastPlan = (index: number, plans: Plans.Frontend[]) => index < (plans?.length ?? 0) - 1;

  return (
    <div class="flex flex-col w-full gap-2">
      <div class="w-full h-auto py-4">
        <ol class="w-full pb-20">
          <Show when={typeof session !== "undefined" && session()!}>
            {(sess) => (
              <TransitionGroup name="slide-fade-up">
                <Show when={typeof activities !== "undefined" && activities()}>
                  {(acts) => (
                    <For each={acts().plans}>
                      {(plan, index) => (
                        <Transition name="slide-fade-up">
                          <div class="w-full h-auto relative">
                            <Show when={lastPlan(index(), acts().plans)}>
                              <div class="absolute left-4 -bottom-10 w-px h-10 bg-neutral-200 dark:bg-neutral-800"></div>
                            </Show>
                            <li
                              class={cn(
                                "border relative border-neutral-200 dark:border-neutral-800 rounded-md hover:shadow-sm shadow-none transition-shadow bg-background overflow-clip",
                                {
                                  "mb-10": lastPlan(index(), acts().plans),
                                }
                              )}
                            >
                              <A
                                href={`/dashboard/organizations/${props.session.organization?.id}/workspace/${props.session.workspace?.id}/plans/${plan.id}`}
                                class="rounded-md bg-background"
                              >
                                <div class="w-full h-48 border-b border-neutral-200 dark:border-neutral-800 bg-muted"></div>
                                <div class="flex flex-row items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
                                  <div class="flex flex-col items-start">
                                    <div class="flex flex-row gap-2 items-center">
                                      <h3 class="text-sm font-semibold text-neutral-900 dark:text-white">
                                        {plan.name}
                                      </h3>
                                      <time class="text-xs font-normal leading-none text-neutral-400 dark:text-neutral-500">
                                        {dayjs(plan.createdAt).format("Do MMM, YYYY")}
                                      </time>
                                    </div>
                                    <span class="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                                      {plan.description}
                                    </span>
                                  </div>
                                  <div class="flex flex-col items-center justify-end"></div>
                                </div>
                              </A>
                              <PlanCommentsSection
                                planId={plan.id}
                                username={sess().user?.name ?? "John Doe"}
                                increment={3}
                              />
                            </li>
                          </div>
                        </Transition>
                      )}
                    </For>
                  )}
                </Show>
              </TransitionGroup>
            )}
          </Show>
        </ol>
      </div>
    </div>
  );
};
