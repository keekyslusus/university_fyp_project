import {
  entriesOf,
  evidenceFromEntry,
  hasDirective,
  hasSection,
  sectionEntries,
  sectionValues,
  valuesOf
} from "./parser";
import type { Confidence, Evidence, Finding, ParsedConfig, RuleCategory, Severity, VpnType } from "./types";
import type { Language } from "../i18n/dictionaries";
import { findingCopy, type FindingId } from "../i18n/findingDictionaries";

interface RuleMatch {
  evidence?: Evidence[];
}

interface Rule {
  id: FindingId;
  protocol: Exclude<VpnType, "unknown">;
  severity: Severity;
  category: RuleCategory;
  weight: number;
  confidence: Confidence;
  check: (config: ParsedConfig) => RuleMatch[];
}

function createFinding(
  id: FindingId,
  severity: Severity,
  language: Language,
  category: RuleCategory,
  weight: number,
  confidence: Confidence,
  evidence?: Evidence[]
): Finding {
  const { title, description, recommendation } = findingCopy(id, language);
  return { id, severity, category, weight, confidence, title, description, recommendation, evidence };
}

const weakCiphers = ["bf-cbc", "des-cbc", "3des", "des-ede3-cbc", "rc2", "rc4", "none"];
const weakAuth = ["sha1", "md5", "none"];
const scriptHookDirectives = ["up", "down", "route-up", "learn-address"];

function matched(evidence?: Evidence[]): RuleMatch[] {
  return [{ evidence }];
}

function noMatch(): RuleMatch[] {
  return [];
}

function entriesMatching(config: ParsedConfig, key: string, values: string[]) {
  return entriesOf(config, key)
    .filter((entry) => values.some((value) => entry.value.toLowerCase().includes(value)))
    .map(evidenceFromEntry);
}

function rawLineEvidence(config: ParsedConfig, pattern: RegExp) {
  return config.raw
    .split(/\r?\n/)
    .map((raw, index) => ({ raw, line: index + 1 }))
    .filter(({ raw }) => pattern.test(raw.trim()))
    .map(({ raw, line }) => ({
      line,
      directive: raw.trim().split(/\s+/)[0] ?? "",
      value: raw.trim(),
      raw: raw.trim()
    }));
}

function tlsVersion(value: string) {
  const match = value.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : Number.NaN;
}

function isWireGuardKey(value: string) {
  return /^[A-Za-z0-9+/]{43}=$/.test(value.trim());
}

function isEndpoint(value: string) {
  const match = value.trim().match(/^(\[[^\]]+\]|[^:\s]+):(\d{1,5})$/);
  if (!match) {
    return false;
  }

  const port = Number(match[2]);
  return Number.isInteger(port) && port > 0 && port <= 65535;
}

function isFullTunnel(value: string) {
  return value.includes("0.0.0.0/0") || value.includes("::/0");
}

function runRules(config: ParsedConfig, language: Language, rules: Rule[]) {
  return rules.flatMap((rule) =>
    rule.check(config).map((match) =>
      createFinding(
        rule.id,
        rule.severity,
        language,
        rule.category,
        rule.weight,
        rule.confidence,
        match.evidence
      )
    )
  );
}

const openVpnRules: Rule[] = [
  {
    id: "openvpn-weak-cipher",
    protocol: "openvpn",
    severity: "high",
    category: "cryptography",
    weight: 32,
    confidence: "high",
    check: (config) => {
      const evidence = entriesMatching(config, "cipher", weakCiphers);
      return evidence.length > 0 ? matched(evidence) : noMatch();
    }
  },
  {
    id: "openvpn-no-cipher-policy",
    protocol: "openvpn",
    severity: "medium",
    category: "cryptography",
    weight: 18,
    confidence: "medium",
    check: (config) => entriesOf(config, "cipher").length === 0 && !valuesOf(config, "data-ciphers").join(":")
      ? matched()
      : noMatch()
  },
  {
    id: "openvpn-weak-auth",
    protocol: "openvpn",
    severity: "high",
    category: "authentication",
    weight: 32,
    confidence: "high",
    check: (config) => {
      const evidence = entriesMatching(config, "auth", weakAuth);
      return evidence.length > 0 ? matched(evidence) : noMatch();
    }
  },
  {
    id: "openvpn-no-remote-cert-tls",
    protocol: "openvpn",
    severity: "high",
    category: "authentication",
    weight: 32,
    confidence: "medium",
    check: (config) => !hasDirective(config, "remote-cert-tls") ? matched() : noMatch()
  },
  {
    id: "openvpn-no-tls-hardening",
    protocol: "openvpn",
    severity: "medium",
    category: "hardening",
    weight: 18,
    confidence: "medium",
    check: (config) => !hasDirective(config, "tls-auth") && !hasDirective(config, "tls-crypt") ? matched() : noMatch()
  },
  {
    id: "openvpn-compression-enabled",
    protocol: "openvpn",
    severity: "high",
    category: "privacy",
    weight: 32,
    confidence: "high",
    check: (config) => {
      const evidence = [
        ...entriesOf(config, "comp-lzo").map(evidenceFromEntry),
        ...entriesOf(config, "compress").map(evidenceFromEntry)
      ];
      return evidence.length > 0 ? matched(evidence) : noMatch();
    }
  },
  {
    id: "openvpn-tcp-proto",
    protocol: "openvpn",
    severity: "low",
    category: "routing",
    weight: 8,
    confidence: "high",
    check: (config) => {
      const evidence = entriesOf(config, "proto")
        .filter((entry) => entry.value.toLowerCase().includes("tcp"))
        .map(evidenceFromEntry);
      return evidence.length > 0 ? matched(evidence) : noMatch();
    }
  },
  {
    id: "openvpn-no-auth-nocache",
    protocol: "openvpn",
    severity: "medium",
    category: "credential-exposure",
    weight: 18,
    confidence: "medium",
    check: (config) => !hasDirective(config, "auth-nocache") ? matched() : noMatch()
  },
  {
    id: "openvpn-no-tls-version-min",
    protocol: "openvpn",
    severity: "medium",
    category: "cryptography",
    weight: 16,
    confidence: "medium",
    check: (config) => !hasDirective(config, "tls-version-min") ? matched() : noMatch()
  },
  {
    id: "openvpn-weak-tls-version-min",
    protocol: "openvpn",
    severity: "high",
    category: "cryptography",
    weight: 28,
    confidence: "high",
    check: (config) => {
      const evidence = entriesOf(config, "tls-version-min")
        .filter((entry) => tlsVersion(entry.value) < 1.2)
        .map(evidenceFromEntry);
      return evidence.length > 0 ? matched(evidence) : noMatch();
    }
  },
  {
    id: "openvpn-no-verify-x509-name",
    protocol: "openvpn",
    severity: "medium",
    category: "authentication",
    weight: 14,
    confidence: "medium",
    check: (config) => !hasDirective(config, "verify-x509-name") ? matched() : noMatch()
  },
  {
    id: "openvpn-dangerous-script-security",
    protocol: "openvpn",
    severity: "high",
    category: "hardening",
    weight: 30,
    confidence: "high",
    check: (config) => {
      const evidence = entriesOf(config, "script-security")
        .filter((entry) => Number.parseInt(entry.value, 10) >= 2)
        .map(evidenceFromEntry);
      return evidence.length > 0 ? matched(evidence) : noMatch();
    }
  },
  {
    id: "openvpn-script-hook",
    protocol: "openvpn",
    severity: "medium",
    category: "hardening",
    weight: 18,
    confidence: "high",
    check: (config) => {
      const evidence = scriptHookDirectives.flatMap((directive) => entriesOf(config, directive).map(evidenceFromEntry));
      return evidence.length > 0 ? matched(evidence) : noMatch();
    }
  },
  {
    id: "openvpn-inline-private-key",
    protocol: "openvpn",
    severity: "medium",
    category: "credential-exposure",
    weight: 18,
    confidence: "high",
    check: (config) => {
      const evidence = rawLineEvidence(config, /^<key>$/i);
      return evidence.length > 0 ? matched(evidence) : noMatch();
    }
  }
];

const wireGuardRules: Rule[] = [
  {
    id: "wireguard-no-interface-section",
    protocol: "wireguard",
    severity: "high",
    category: "configuration-validity",
    weight: 30,
    confidence: "high",
    check: (config) => !hasSection(config, "interface") ? matched() : noMatch()
  },
  {
    id: "wireguard-no-peer-section",
    protocol: "wireguard",
    severity: "high",
    category: "configuration-validity",
    weight: 30,
    confidence: "high",
    check: (config) => !hasSection(config, "peer") ? matched() : noMatch()
  },
  {
    id: "wireguard-private-key-present",
    protocol: "wireguard",
    severity: "medium",
    category: "credential-exposure",
    weight: 18,
    confidence: "high",
    check: (config) => {
      const evidence = sectionEntries(config, "interface", "privatekey").map(evidenceFromEntry);
      return evidence.length > 0 ? matched(evidence) : noMatch();
    }
  },
  {
    id: "wireguard-no-peer-key",
    protocol: "wireguard",
    severity: "high",
    category: "configuration-validity",
    weight: 32,
    confidence: "high",
    check: (config) => hasSection(config, "peer") && sectionValues(config, "peer", "publickey").length === 0
      ? matched()
      : noMatch()
  },
  {
    id: "wireguard-no-endpoint",
    protocol: "wireguard",
    severity: "medium",
    category: "configuration-validity",
    weight: 18,
    confidence: "medium",
    check: (config) => hasSection(config, "peer") && sectionValues(config, "peer", "endpoint").length === 0
      ? matched()
      : noMatch()
  },
  {
    id: "wireguard-no-allowed-ips",
    protocol: "wireguard",
    severity: "high",
    category: "routing",
    weight: 32,
    confidence: "high",
    check: (config) => hasSection(config, "peer") && sectionValues(config, "peer", "allowedips").length === 0
      ? matched()
      : noMatch()
  },
  {
    id: "wireguard-full-tunnel",
    protocol: "wireguard",
    severity: "low",
    category: "routing",
    weight: 8,
    confidence: "high",
    check: (config) => {
      const evidence = sectionEntries(config, "peer", "allowedips")
        .filter((entry) => isFullTunnel(entry.value))
        .map(evidenceFromEntry);
      return evidence.length > 0 ? matched(evidence) : noMatch();
    }
  },
  {
    id: "wireguard-no-dns",
    protocol: "wireguard",
    severity: "medium",
    category: "dns",
    weight: 18,
    confidence: "medium",
    check: (config) => {
      const hasDns = sectionValues(config, "interface", "dns").length > 0;
      const hasFullTunnel = sectionEntries(config, "peer", "allowedips").some((entry) => isFullTunnel(entry.value));
      return !hasDns && !hasFullTunnel ? matched() : noMatch();
    }
  },
  {
    id: "wireguard-no-keepalive",
    protocol: "wireguard",
    severity: "low",
    category: "hardening",
    weight: 8,
    confidence: "medium",
    check: (config) => hasSection(config, "peer") && sectionValues(config, "peer", "persistentkeepalive").length === 0
      ? matched()
      : noMatch()
  },
  {
    id: "wireguard-no-address",
    protocol: "wireguard",
    severity: "high",
    category: "configuration-validity",
    weight: 32,
    confidence: "high",
    check: (config) => hasSection(config, "interface") && sectionValues(config, "interface", "address").length === 0
      ? matched()
      : noMatch()
  },
  {
    id: "wireguard-malformed-key",
    protocol: "wireguard",
    severity: "high",
    category: "configuration-validity",
    weight: 26,
    confidence: "high",
    check: (config) => {
      const evidence = [
        ...sectionEntries(config, "interface", "privatekey"),
        ...sectionEntries(config, "peer", "publickey")
      ]
        .filter((entry) => !isWireGuardKey(entry.value))
        .map(evidenceFromEntry);
      return evidence.length > 0 ? matched(evidence) : noMatch();
    }
  },
  {
    id: "wireguard-malformed-endpoint",
    protocol: "wireguard",
    severity: "medium",
    category: "configuration-validity",
    weight: 16,
    confidence: "high",
    check: (config) => {
      const evidence = sectionEntries(config, "peer", "endpoint")
        .filter((entry) => !isEndpoint(entry.value))
        .map(evidenceFromEntry);
      return evidence.length > 0 ? matched(evidence) : noMatch();
    }
  },
  {
    id: "wireguard-full-tunnel-no-dns",
    protocol: "wireguard",
    severity: "high",
    category: "dns",
    weight: 28,
    confidence: "high",
    check: (config) => {
      const hasDns = sectionValues(config, "interface", "dns").length > 0;
      const evidence = sectionEntries(config, "peer", "allowedips")
        .filter((entry) => isFullTunnel(entry.value));
      return !hasDns && evidence.length > 0 ? matched(evidence.map(evidenceFromEntry)) : noMatch();
    }
  }
];

export function analyzeOpenVpn(config: ParsedConfig, language: Language): Finding[] {
  const findings = runRules(config, language, openVpnRules);

  if (findings.length === 0) {
    findings.push(createFinding(
      "openvpn-no-critical-issues",
      "info",
      language,
      "configuration-validity",
      0,
      "high"
    ));
  }

  return findings;
}

export function analyzeWireGuard(config: ParsedConfig, language: Language): Finding[] {
  const findings = runRules(config, language, wireGuardRules);

  if (findings.length === 0) {
    findings.push(createFinding(
      "wireguard-no-critical-issues",
      "info",
      language,
      "configuration-validity",
      0,
      "high"
    ));
  }

  return findings;
}

export function analyzeUnknown(language: Language): Finding[] {
  return [
    createFinding(
      "unknown-format",
      "high",
      language,
      "configuration-validity",
      32,
      "high"
    )
  ];
}
