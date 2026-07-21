export const TASK_STATUSES = [
  { id: "todo", label: "To Do", order: 1 },
  { id: "in_progress", label: "In Progress", order: 2 },
  { id: "done", label: "Done", order: 3 },
] as const;

export type TaskStatusId = typeof TASK_STATUSES[number]["id"];

export const DELIVERABLE_STATUSES = [
  { id: "draft", label: "Draft", order: 1 },
  { id: "internal_review", label: "Internal Review", order: 2 },
  { id: "client_review", label: "Client Review", order: 3 },
  { id: "changes_requested", label: "Changes Requested", order: 4 },
  { id: "approved", label: "Approved", order: 5 },
  { id: "delivered", label: "Delivered", order: 6 },
  { id: "archived", label: "Archived", order: 7 },
] as const;

export type DeliverableStatusId = typeof DELIVERABLE_STATUSES[number]["id"];
