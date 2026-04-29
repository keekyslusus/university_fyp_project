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
  riskLevel: "Низкий" | "Средний" | "Высокий";
  findings: Finding[];
  summary: string;
}
