export type VpnType = "openvpn" | "wireguard" | "unknown";

export type Severity = "info" | "low" | "medium" | "high";

export type RuleCategory =
  | "cryptography"
  | "authentication"
  | "privacy"
  | "routing"
  | "dns"
  | "hardening"
  | "credential-exposure"
  | "configuration-validity";

export type Confidence = "low" | "medium" | "high";

export interface Evidence {
  line: number;
  directive: string;
  value: string;
  raw: string;
  section?: string;
}

export interface Finding {
  id: string;
  severity: Severity;
  category: RuleCategory;
  weight: number;
  confidence: Confidence;
  title: string;
  description: string;
  recommendation: string;
  evidence?: Evidence[];
}

export interface ConfigEntry {
  key: string;
  value: string;
  line: number;
  raw: string;
  section?: string;
}

export interface ParsedConfig {
  type: VpnType;
  raw: string;
  directives: Record<string, string[]>;
  sections: Record<string, Record<string, string[]>>;
  entries: ConfigEntry[];
}

export interface AnalysisResult {
  fileName: string;
  type: VpnType;
  score: number;
  riskLevel: "low" | "medium" | "high";
  findings: Finding[];
  scoreBreakdown: Partial<Record<RuleCategory, number>>;
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
