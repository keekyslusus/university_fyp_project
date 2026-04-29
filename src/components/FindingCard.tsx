import type { Finding, Severity } from "../core/types";
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

export function FindingCard(props: FindingCardProps) {
  const { t } = useI18n();
  const severityLabel: Record<Severity, string> = {
    info: t("severityInfo"),
    low: t("severityLow"),
    medium: t("severityMedium"),
    high: t("severityHigh")
  };

  return (
    <article class="finding">
      <div class="findingTop">
        <h3>
          <span class="material-symbols-rounded" aria-hidden="true">{severityIcon(props.finding.severity)}</span>
          {props.finding.title}
        </h3>
        <span class={`badge ${props.finding.severity}`}>{severityLabel[props.finding.severity]}</span>
      </div>
      <p>{props.finding.description}</p>
      <p><strong>{t("recommendation")}:</strong> {props.finding.recommendation}</p>
    </article>
  );
}
