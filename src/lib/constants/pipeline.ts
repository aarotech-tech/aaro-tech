export const DEAL_STAGES = [
  { id: "new-lead", label: "New Lead", order: 1 },
  { id: "qualified", label: "Qualified", order: 2 },
  { id: "discovery", label: "Discovery", order: 3 },
  { id: "proposal-sent", label: "Proposal Sent", order: 4 },
  { id: "negotiation", label: "Negotiation", order: 5 },
  { id: "won", label: "Won", order: 6 },
  { id: "lost", label: "Lost", order: 7 },
] as const;

export type DealStageId = typeof DEAL_STAGES[number]["id"];

export function getStageLabel(stageId: string): string {
  const stage = DEAL_STAGES.find((s) => s.id === stageId);
  return stage ? stage.label : "Unknown Stage";
}
