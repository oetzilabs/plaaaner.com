import { Context } from "sst/context/context2.js";
import { z } from "zod";
import { prefixed_cuid2 } from "./custom_cuid2";

export const PublicActor = z.object({
  type: z.literal("public"),
  properties: z.object({}),
});
export type PublicActor = z.infer<typeof PublicActor>;

export const AccountActor = z.object({
  type: z.literal("account"),
  properties: z.object({
    accountID: prefixed_cuid2,
    email: z.string().nonempty(),
  }),
});
export type AccountActor = z.infer<typeof AccountActor>;

export const UserActor = z.object({
  type: z.literal("user"),
  properties: z.object({
    userID: prefixed_cuid2,
    workspaceID: prefixed_cuid2,
  }),
});
export type UserActor = z.infer<typeof UserActor>;

export const SystemActor = z.object({
  type: z.literal("system"),
  properties: z.object({
    workspaceID: prefixed_cuid2,
  }),
});
export type SystemActor = z.infer<typeof SystemActor>;

export const Actor = z.discriminatedUnion("type", [UserActor, AccountActor, PublicActor, SystemActor]);
export type Actor = z.infer<typeof Actor>;

const ActorContext = Context.create<Actor>("actor");

export const useActor = ActorContext.use;
export const withActor = ActorContext.with;

export function assertActor<T extends Actor["type"]>(type: T) {
  const actor = useActor();
  if (actor.type !== type) {
    throw new Error(`Expected actor type ${type}, got ${actor.type}`);
  }

  return actor as Extract<Actor, { type: T }>;
}

export function useWorkspace() {
  const actor = useActor();
  if ("workspaceID" in actor.properties) return actor.properties.workspaceID;
  throw new Error(`Expected actor to have workspaceID`);
}
