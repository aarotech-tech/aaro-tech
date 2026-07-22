export const DEAL_STAGES = [
  { id: "discovery", label: "Discovery", order: 1 },
  { id: "proposal-sent", label: "Proposal Sent", order: 2 },
  { id: "negotiation", label: "Negotiation", order: 3 },
  { id: "won", label: "Won", order: 4 },
  { id: "lost", label: "Lost", order: 5 },
] as const;

export type DealStageId = typeof DEAL_STAGES[number]["id"];

export function getStageLabel(stageId: string): string {
  const stage = DEAL_STAGES.find((s) => s.id === stageId);
  return stage ? stage.label : "Unknown Stage";
}
