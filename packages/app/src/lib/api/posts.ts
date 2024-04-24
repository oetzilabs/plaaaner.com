// import { PostCreateSchema } from "@oetzilabs-plaaaner-com/core/src/drizzle/sql/schema";
import { Posts } from "@oetzilabs-plaaaner-com/core/src/entities/posts";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { action, cache, redirect, reload, revalidate } from "@solidjs/router";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import updateLocale from "dayjs/plugin/updateLocale";
import { getCookie, getEvent } from "vinxi/http";
import { lucia } from "../auth";
import { getActivities } from "./activity";
import { getLocaleSettings } from "./locale";
import { getUpcomingThreePlans } from "./plans";
import { WebsocketCore } from "@oetzilabs-plaaaner-com/core/src/entities/websocket";

dayjs.extend(isoWeek);
dayjs.extend(updateLocale);

export const getPost = cache(async (postId: string) => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.context.user;
  const post = await Posts.findById(postId);
  if (!post) {
    throw new Error("This post does not exist");
  }
  return post;
}, "post");

export const getPosts = cache(async () => {
  "use server";
  const event = getEvent()!;
  const locale = getLocaleSettings(event);
  dayjs.updateLocale(locale.language, {});

  const user = event.context.user;
  if (!user) {
    throw redirect("/auth/login");
  }

  const session = event.context.session;
  if (!session) {
    throw redirect("/auth/login");
  }

  const posts = await Posts.findByOptions({
    user_id: user.id,
    workspace_id: session.workspace_id,
    organization_id: session.organization_id,
  });
  return posts;
}, "posts");

export const createNewPost = action(async (content: string) => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    throw redirect("/auth/login");
  }

  if (!session.organization_id) {
    throw redirect("/setup/organization");
  }
  const workspaceId = session.workspace_id;

  if (!workspaceId) {
    throw redirect("/dashboard/w/new");
  }
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new Error("This Workspace does not exist");
  }

  const [createdPost] = await Posts.create({ content }, user.id, workspace.id);
  console.log(`revalidating ${getActivities.key}`);

  const post = await Posts.findById(createdPost.id);

  const sendToUsersViaWebsocket = await WebsocketCore.sendMessageToUsersInWorkspace(workspace.id, user.id, {
    type: "activity",
    value: [
      {
        change: "add",
        activity: { type: "post", value: post },
      },
    ],
  });

  // console.log("sent to users", sendToUsersViaWebsocket);

  await revalidate(getActivities.key, true);
  await revalidate(getPosts.key, true);

  return post;
  // reload({ revalidate: [getActivities.key, getPosts.key], status: 200 });
});

export const commentOnPost = action(async (data: { postId: string; comment: string }) => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    throw redirect("/auth/login");
  }
  if (!user) {
    throw redirect("/auth/login");
  }
  const commented = await Posts.addComment(data.postId, user.id, data.comment);
  await revalidate(getPostComments.keyFor(commented.postId), true);
  await revalidate(getActivities.key, true);
  return true;
});

export const getPostComments = cache(async (plan_id) => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    throw redirect("/auth/login");
  }
  if (!user) {
    throw redirect("/auth/login");
  }
  const plan = await Posts.findById(plan_id);
  if (!plan) {
    throw new Error("This plan does not exist");
  }
  return plan.comments;
}, "post-comments");

export const deletePostComment = action(async (comment_id) => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    throw redirect("/auth/login");
  }

  if (!user) {
    throw redirect("/auth/login");
  }
  const comment = await Posts.findComment(comment_id);

  if (!comment) {
    throw new Error("This Comment does not exist");
  }

  const removed = await Posts.deleteComment(comment.id);
  await revalidate(getPostComments.keyFor(removed.postId), true);
  await revalidate(getActivities.key, true);
  await revalidate(getPosts.key, true);

  return removed;
});

export const deletePost = action(async (post_id: string) => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    throw redirect("/auth/login");
  }

  if (!user) {
    throw redirect("/auth/login");
  }
  const post = await Posts.findById(post_id);

  if (!post) {
    throw new Error("This Post does not exist");
  }

  if (post.deletedAt) {
    throw new Error("This Post has already been deleted");
  }

  if (post.owner.id !== user.id) {
    throw new Error("You do not have permission to delete this Post");
  }

  const removed = await Posts.update({ id: post.id, deletedAt: new Date() });

  const removedPost = await Posts.findById(removed.id);
  await revalidate(getActivities.key, true);
  await revalidate(getPosts.key, true);
  return removedPost;
});
