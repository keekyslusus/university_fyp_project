import type { ConfigEntry, Evidence, ParsedConfig, VpnType } from "./types";

function stripInlineComment(line: string) {
  const trimmed = line.trim();

  if (trimmed.startsWith("#") || trimmed.startsWith(";")) {
    return "";
  }

  const hashIndex = line.indexOf("#");
  const semicolonIndex = line.indexOf(";");
  const indexes = [hashIndex, semicolonIndex].filter((index) => index >= 0);
  const commentIndex = indexes.length > 0 ? Math.min(...indexes) : -1;

  return (commentIndex >= 0 ? line.slice(0, commentIndex) : line).trim();
}

function detectType(content: string): VpnType {
  const normalized = content.toLowerCase();

  if (/\[(interface|peer)\]/i.test(content) || normalized.includes("privatekey") || normalized.includes("allowedips")) {
    return "wireguard";
  }

  if (/(^|\n)\s*(client|dev|remote|proto|cipher|auth|tls-auth|tls-crypt)\b/i.test(content)) {
    return "openvpn";
  }

  return "unknown";
}

export function parseConfig(content: string): ParsedConfig {
  const type = detectType(content);
  const directives: Record<string, string[]> = {};
  const sections: Record<string, Record<string, string[]>> = {};
  const entries: ConfigEntry[] = [];
  let currentSection = "";

  for (const [index, sourceLine] of content.split(/\r?\n/).entries()) {
    const lineNumber = index + 1;
    const line = stripInlineComment(sourceLine);

    if (!line || line.startsWith("<") || line.startsWith("</")) {
      continue;
    }

    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim().toLowerCase();
      sections[currentSection] ??= {};
      continue;
    }

    if (type === "wireguard" && line.includes("=")) {
      const [rawKey, ...valueParts] = line.split("=");
      const key = rawKey.trim().toLowerCase();
      const value = valueParts.join("=").trim();
      const target = sections[currentSection || "global"] ??= {};
      target[key] ??= [];
      target[key].push(value);
      entries.push({
        key,
        value,
        line: lineNumber,
        raw: sourceLine.trim(),
        section: currentSection || "global"
      });
      continue;
    }

    const [rawKey, ...valueParts] = line.split(/\s+/);
    const key = rawKey.trim().toLowerCase();
    const value = valueParts.join(" ").trim();

    if (!key) {
      continue;
    }

    directives[key] ??= [];
    directives[key].push(value);
    entries.push({
      key,
      value,
      line: lineNumber,
      raw: sourceLine.trim()
    });
  }

  return {
    type,
    raw: content,
    directives,
    sections,
    entries
  };
}

export function hasDirective(config: ParsedConfig, key: string) {
  return key.toLowerCase() in config.directives;
}

export function hasSection(config: ParsedConfig, section: string) {
  return section.toLowerCase() in config.sections;
}

export function valuesOf(config: ParsedConfig, key: string) {
  return config.directives[key.toLowerCase()] ?? [];
}

export function entriesOf(config: ParsedConfig, key: string) {
  const normalizedKey = key.toLowerCase();
  return config.entries.filter((entry) => !entry.section && entry.key === normalizedKey);
}

export function sectionValues(config: ParsedConfig, section: string, key: string) {
  return config.sections[section.toLowerCase()]?.[key.toLowerCase()] ?? [];
}

export function sectionEntries(config: ParsedConfig, section: string, key: string) {
  const normalizedSection = section.toLowerCase();
  const normalizedKey = key.toLowerCase();
  return config.entries.filter((entry) => entry.section === normalizedSection && entry.key === normalizedKey);
}

export function evidenceFromEntry(entry: ConfigEntry): Evidence {
  return {
    line: entry.line,
    directive: entry.key,
    value: entry.value,
    raw: entry.raw,
    section: entry.section
  };
}
