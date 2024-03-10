export * from "./schemas/users";

export * from "./schemas/organization";
export * from "./schemas/organizations_joins";
export * from "./schemas/organizations_ticket_types";
export * from "./schemas/user_organizations";

export * from "./schemas/workspaces";
export * from "./schemas/workspaces_organizations";
export * from "./schemas/workspaces_plans";
export * from "./schemas/users_workspaces";


export * from "./schemas/plans";
export * from "./schemas/plans_tickets";
export * from "./schemas/plan_types";
export * from "./schemas/plan_comments";
export * from "./schemas/plan_comments_mentions";
export * from "./schemas/plan_times";
export * from "./schemas/plan_participants";

export * from "./schemas/tickets";
export * from "./schemas/ticket_types";

export * from "./schemas/websocket";

export * from "./schemas/notifications/user_dismissed";
export * from "./schemas/notifications/system";
export * from "./schemas/notifications/organization";
export * from "./schemas/notifications/workspace";
export * from "./schemas/notifications/plan/comment_user_mention";

export { schema } from "./schemas/utils";


// Organizations have Workspaces, Workspaces have Plans, Plans have Tickets.
//
// [ Organization ] n <-- --> m [ Workspaces ]
// [ Workspaces ] n <-- --> m [ Plans ]
// [ Plans ] n <-- --> m [ Tickets ]
// [ Tickets ] n <-- --> 1 [ TicketType ]
