// import { PostCreateSchema } from "@oetzilabs-plaaaner-com/core/src/drizzle/sql/schema";
import { Posts } from "@oetzilabs-plaaaner-com/core/src/entities/posts";
import { WebsocketCore } from "@oetzilabs-plaaaner-com/core/src/entities/websocket";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { action, cache, redirect } from "@solidjs/router";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import updateLocale from "dayjs/plugin/updateLocale";
import { getCookie, getEvent } from "vinxi/http";
import { lucia } from "../auth";
import { getContext } from "../auth/context";
import { getLocaleSettings } from "./locale";

dayjs.extend(isoWeek);
dayjs.extend(updateLocale);

export const getPost = cache(async (postId: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const post = await Posts.findById(postId);
  if (!post) {
    throw new Error("This post does not exist");
  }
  return post;
}, "post");

export const getPosts = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const locale = getLocaleSettings(event);
  dayjs.updateLocale(locale.language, {});

  const posts = await Posts.findByOptions({
    user_id: ctx.user.id,
    workspace_id: ctx.session.workspace_id,
    organization_id: ctx.session.organization_id,
  });
  return posts;
}, "posts");

export const createNewPost = action(async (content: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  if (!ctx.session.organization_id) {
    throw redirect("/setup/organization");
  }

  if (!ctx.session.workspace_id) {
    throw redirect("/dashboard/w/new");
  }

  const workspace = await Workspace.findById(ctx.session.workspace_id);

  if (!workspace) {
    throw new Error("This Workspace does not exist");
  }

  const [createdPost] = await Posts.create({ content }, ctx.user.id, workspace.id);
  const post = await Posts.findById(createdPost.id);

  await WebsocketCore.sendMessageToUsersInWorkspace(workspace.id, ctx.user.id, {
    action: "activity:created",
    payload: {
      type: "post",
      value: post!,
    },
  });
});

export const commentOnPost = action(async (data: { postId: string; comment: string }) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  if (!ctx.session.organization_id) {
    throw redirect("/setup/organization");
  }

  if (!ctx.session.workspace_id) {
    throw redirect("/dashboard/w/new");
  }
  const commented = await Posts.addComment(data.postId, ctx.user.id, data.comment);

  return true;
});

export const getPostComments = cache(async (plan_id) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const plan = await Posts.findById(plan_id);
  if (!plan) {
    throw new Error("This plan does not exist");
  }
  return plan.comments;
}, "post-comments");

export const deletePostComment = action(async (comment_id) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const comment = await Posts.findComment(comment_id);

  if (!comment) {
    throw new Error("This Comment does not exist");
  }

  const removed = await Posts.deleteComment(comment.id);

  return removed;
});

export const deletePost = action(async (post_id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const post = await Posts.findById(post_id);

  if (!post) {
    throw new Error("This Post does not exist");
  }

  if (post.deletedAt) {
    throw new Error("This Post has already been deleted");
  }

  if (post.owner.id !== ctx.user.id) {
    throw new Error("You do not have permission to delete this Post");
  }

  const removed = await Posts.update({ id: post.id, deletedAt: new Date() });

  await WebsocketCore.sendMessageToUsersInWorkspace(post.workpaces[0].workspace_id, ctx.user.id, {
    action: "activity:deleted",
    payload: {
      type: "post",
      value: post,
    },
  });
});
