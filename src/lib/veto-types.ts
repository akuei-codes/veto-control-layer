export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ActionStatus =
  | "intercepted"
  | "pending"
  | "approved"
  | "denied"
  | "executed"
  | "blocked"
  | "escalated";

export interface AgentAction {
  id: string;
  ts: number;
  agent: string;
  agentIcon: string;
  tool: string;
  summary: string;
  reasoning: string;
  rawCall: string;
  resources: string[];
  blastRadius: string;
  confidence: number;
  riskScore: number;
  riskLevel: RiskLevel;
  status: ActionStatus;
  policyViolations: string[];
  recommendation: string;
}

export interface Policy {
  id: string;
  text: string;
  enabled: boolean;
  triggered: number;
}
