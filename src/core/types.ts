export type VpnType = "openvpn" | "wireguard" | "unknown";

export type Severity = "info" | "low" | "medium" | "high";

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
}

export interface ParsedConfig {
  type: VpnType;
  raw: string;
  directives: Record<string, string[]>;
  sections: Record<string, Record<string, string[]>>;
}

export interface AnalysisResult {
  fileName: string;
  type: VpnType;
  score: number;
  riskLevel: "low" | "medium" | "high";
  findings: Finding[];
  summary: string;
}

export interface AiAnalysis {
  shortText: string;
  details: string;
  summary: string;
  risks: string[];
  actions: string[];
  conclusion: string;
  cached: boolean;
}
