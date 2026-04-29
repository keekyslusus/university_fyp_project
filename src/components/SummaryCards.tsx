import type { AnalysisResult } from "../core/types";

interface SummaryCardsProps {
  analysis: AnalysisResult;
}

export function SummaryCards(props: SummaryCardsProps) {
  return (
    <section class="summary">
      <div>
        <span class="label">Файл</span>
        <strong>{props.analysis.fileName}</strong>
      </div>
      <div>
        <span class="label">Тип</span>
        <strong>{props.analysis.type}</strong>
      </div>
      <div>
        <span class="label">Оценка</span>
        <strong>{props.analysis.score}/100</strong>
      </div>
      <div>
        <span class="label">Риск</span>
        <strong>{props.analysis.riskLevel}</strong>
      </div>
    </section>
  );
}
