ALTER TABLE "plaaaner"."users_workspaces" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "plaaaner"."users_workspaces" DROP COLUMN IF EXISTS "updated_at";--> statement-breakpoint
ALTER TABLE "plaaaner"."users_workspaces" DROP COLUMN IF EXISTS "deleted_at";--> statement-breakpoint
ALTER TABLE "plaaaner"."users_workspaces" ADD CONSTRAINT "users_workspaces_workspace_id_user_id_pk" PRIMARY KEY("workspace_id","user_id");
