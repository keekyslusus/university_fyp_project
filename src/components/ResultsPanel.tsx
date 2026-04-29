import { For, Show } from "solid-js";
import type { AiAnalysis, AnalysisResult } from "../core/types";
import { AiDialog } from "./AiDialog";
import { AiFindingCard } from "./AiFindingCard";
import { AiKeyPanel } from "./AiKeyPanel";
import { FindingCard } from "./FindingCard";
import { SummaryCards } from "./SummaryCards";

interface ResultsPanelProps {
  analysis: AnalysisResult;
  aiAnalysis: AiAnalysis | null;
  aiError: string;
  apiKeyInput: string;
  hasApiKey: boolean;
  isAiLoading: boolean;
  isAiDialogOpen: boolean;
  onApiKeyInput: (value: string) => void;
  onAiDetailsOpen: () => void;
  onAiDetailsClose: () => void;
  onApiKeySave: () => void;
  onExport: () => void;
}

export function ResultsPanel(props: ResultsPanelProps) {
  return (
    <>
      <SummaryCards analysis={props.analysis} />

      <section class="panel">
        <div class="sectionHeader">
          <h2>Замечания и рекомендации</h2>
          <button type="button" class="ripple-target" onClick={props.onExport}>
            <span class="material-symbols-rounded" aria-hidden="true">download</span>
            Экспорт отчёта
          </button>
        </div>

        <Show when={!props.hasApiKey}>
          <AiKeyPanel
            value={props.apiKeyInput}
            onInput={props.onApiKeyInput}
            onSave={props.onApiKeySave}
          />
        </Show>

        <div class="findings">
          <AiFindingCard
            analysis={props.aiAnalysis}
            error={props.aiError}
            isLoading={props.isAiLoading}
            onOpenDetails={props.onAiDetailsOpen}
          />

          <For each={props.analysis.findings}>
            {(finding) => <FindingCard finding={finding} />}
          </For>
        </div>
      </section>

      <AiDialog
        analysis={props.aiAnalysis}
        isOpen={props.isAiDialogOpen}
        onClose={props.onAiDetailsClose}
      />
    </>
  );
}
