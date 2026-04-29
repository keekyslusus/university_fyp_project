import { hasDirective, sectionValues, valuesOf } from "./parser";
import type { Finding, ParsedConfig, Severity } from "./types";
import type { Language } from "../i18n/dictionaries";
import { findingCopy, type FindingId } from "../i18n/findingDictionaries";

function finding(
  id: FindingId,
  severity: Severity,
  language: Language
): Finding {
  const { title, description, recommendation } = findingCopy(id, language);
  return { id, severity, title, description, recommendation };
}

const weakCiphers = ["bf-cbc", "des-cbc", "3des", "des-ede3-cbc", "rc2", "rc4", "none"];
const weakAuth = ["sha1", "md5", "none"];

export function analyzeOpenVpn(config: ParsedConfig, language: Language): Finding[] {
  const findings: Finding[] = [];
  const ciphers = valuesOf(config, "cipher").map((value) => value.toLowerCase());
  const dataCiphers = valuesOf(config, "data-ciphers").join(":").toLowerCase();
  const authValues = valuesOf(config, "auth").map((value) => value.toLowerCase());

  if (ciphers.some((cipher) => weakCiphers.some((weak) => cipher.includes(weak)))) {
    findings.push(finding(
      "openvpn-weak-cipher",
      "high",
      language
    ));
  }

  if (ciphers.length === 0 && !dataCiphers) {
    findings.push(finding(
      "openvpn-no-cipher-policy",
      "medium",
      language
    ));
  }

  if (authValues.some((auth) => weakAuth.some((weak) => auth.includes(weak)))) {
    findings.push(finding(
      "openvpn-weak-auth",
      "high",
      language
    ));
  }

  if (!hasDirective(config, "remote-cert-tls")) {
    findings.push(finding(
      "openvpn-no-remote-cert-tls",
      "high",
      language
    ));
  }

  if (!hasDirective(config, "tls-auth") && !hasDirective(config, "tls-crypt")) {
    findings.push(finding(
      "openvpn-no-tls-hardening",
      "medium",
      language
    ));
  }

  if (hasDirective(config, "comp-lzo") || hasDirective(config, "compress")) {
    findings.push(finding(
      "openvpn-compression-enabled",
      "high",
      language
    ));
  }

  if (valuesOf(config, "proto").some((value) => value.toLowerCase().includes("tcp"))) {
    findings.push(finding(
      "openvpn-tcp-proto",
      "low",
      language
    ));
  }

  if (!hasDirective(config, "auth-nocache")) {
    findings.push(finding(
      "openvpn-no-auth-nocache",
      "medium",
      language
    ));
  }

  if (findings.length === 0) {
    findings.push(finding(
      "openvpn-no-critical-issues",
      "info",
      language
    ));
  }

  return findings;
}

export function analyzeWireGuard(config: ParsedConfig, language: Language): Finding[] {
  const findings: Finding[] = [];
  const interfaceAddresses = sectionValues(config, "interface", "address");
  const dnsValues = sectionValues(config, "interface", "dns");
  const privateKeys = sectionValues(config, "interface", "privatekey");
  const peerPublicKeys = sectionValues(config, "peer", "publickey");
  const endpoints = sectionValues(config, "peer", "endpoint");
  const allowedIps = sectionValues(config, "peer", "allowedips");
  const persistentKeepalive = sectionValues(config, "peer", "persistentkeepalive");

  if (privateKeys.length > 0) {
    findings.push(finding(
      "wireguard-private-key-present",
      "medium",
      language
    ));
  }

  if (peerPublicKeys.length === 0) {
    findings.push(finding(
      "wireguard-no-peer-key",
      "high",
      language
    ));
  }

  if (endpoints.length === 0) {
    findings.push(finding(
      "wireguard-no-endpoint",
      "medium",
      language
    ));
  }

  if (allowedIps.length === 0) {
    findings.push(finding(
      "wireguard-no-allowed-ips",
      "high",
      language
    ));
  }

  if (allowedIps.some((value) => value.includes("0.0.0.0/0") || value.includes("::/0"))) {
    findings.push(finding(
      "wireguard-full-tunnel",
      "low",
      language
    ));
  }

  if (dnsValues.length === 0) {
    findings.push(finding(
      "wireguard-no-dns",
      "medium",
      language
    ));
  }

  if (persistentKeepalive.length === 0) {
    findings.push(finding(
      "wireguard-no-keepalive",
      "low",
      language
    ));
  }

  if (interfaceAddresses.length === 0) {
    findings.push(finding(
      "wireguard-no-address",
      "high",
      language
    ));
  }

  if (findings.length === 0) {
    findings.push(finding(
      "wireguard-no-critical-issues",
      "info",
      language
    ));
  }

  return findings;
}

export function analyzeUnknown(language: Language): Finding[] {
  return [
    finding(
      "unknown-format",
      "high",
      language
    )
  ];
}
