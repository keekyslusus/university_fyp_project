import { For, Show } from "solid-js";
import type { Confidence, Finding, RuleCategory, Severity } from "../core/types";
import { useI18n } from "../i18n/I18nProvider";

function severityIcon(severity: Severity) {
  switch (severity) {
    case "high":
      return "report";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "check_circle";
  }
}

interface FindingCardProps {
  finding: Finding;
}

function formatToken(value: RuleCategory | Confidence) {
  return value
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function FindingCard(props: FindingCardProps) {
  const { t } = useI18n();
  const severityLabel: Record<Severity, string> = {
    info: t("severityInfo"),
    low: t("severityLow"),
    medium: t("severityMedium"),
    high: t("severityHigh")
  };

  return (
    <article class="finding interactiveCard ripple-target">
      <div class="findingTop">
        <h3>
          <span class="material-symbols-rounded" aria-hidden="true">{severityIcon(props.finding.severity)}</span>
          {props.finding.title}
        </h3>
        <span class={`badge ${props.finding.severity}`}>{severityLabel[props.finding.severity]}</span>
      </div>
      <div class="findingMeta">
        <span>{formatToken(props.finding.category)}</span>
        <span>{t("confidence")}: {formatToken(props.finding.confidence)}</span>
        <span>{t("weight")}: {props.finding.weight}</span>
      </div>
      <p>{props.finding.description}</p>
      <Show when={props.finding.evidence?.length}>
        <div class="evidenceBlock">
          <strong>{t("evidence")}</strong>
          <For each={props.finding.evidence}>
            {(item) => (
              <code>
                line {item.line}: {item.raw}
              </code>
            )}
          </For>
        </div>
      </Show>
      <p><strong>{t("recommendation")}:</strong> {props.finding.recommendation}</p>
    </article>
  );
}
