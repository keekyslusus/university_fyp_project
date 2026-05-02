import { For, Show } from "solid-js";
import type { AnalysisResult } from "../core/types";
import { useI18n } from "../i18n/I18nProvider";

interface SummaryCardsProps {
  analysis: AnalysisResult;
}

export function SummaryCards(props: SummaryCardsProps) {
  const { t } = useI18n();
  const breakdown = () => Object.entries(props.analysis.scoreBreakdown)
    .filter(([, value]) => value > 0)
    .sort(([, left], [, right]) => right - left);
  const riskLabel = () => {
    switch (props.analysis.riskLevel) {
      case "low":
        return t("severityLow");
      case "medium":
        return t("severityMedium");
      case "high":
        return t("severityHigh");
    }
  };

  return (
    <>
      <section class="summary">
        <div class="summaryCard interactiveCard ripple-target">
          <span class="label">{t("file")}</span>
          <strong>{props.analysis.fileName}</strong>
        </div>
        <div class="summaryCard interactiveCard ripple-target">
          <span class="label">{t("type")}</span>
          <strong>{props.analysis.type}</strong>
        </div>
        <div class="summaryCard interactiveCard ripple-target">
          <span class="label">{t("score")}</span>
          <strong>{props.analysis.score}/100</strong>
        </div>
        <div class="summaryCard interactiveCard ripple-target">
          <span class="label">{t("risk")}</span>
          <strong>{riskLabel()}</strong>
        </div>
      </section>

      <Show when={breakdown().length > 0}>
        <section class="scoreBreakdown">
          <span class="label">{t("scoreBreakdown")}</span>
          <div>
            <For each={breakdown()}>
              {([category, weight]) => (
                <span>
                  {category}
                  <strong>-{weight}</strong>
                </span>
              )}
            </For>
          </div>
        </section>
      </Show>
    </>
  );
}
