import type { Finding, Severity } from "../core/types";

const severityLabel: Record<Severity, string> = {
  info: "Инфо",
  low: "Низкий",
  medium: "Средний",
  high: "Высокий"
};

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
      <p><strong>Рекомендация:</strong> {props.finding.recommendation}</p>
    </article>
  );
}
