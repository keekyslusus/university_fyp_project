import { Show } from "solid-js";
import type { AiAnalysis } from "../core/types";
import CircularLoadingIndicator from "./CircularLoadingIndicator";

interface AiFindingCardProps {
  analysis: AiAnalysis | null;
  error: string;
  isLoading: boolean;
  onOpenDetails: () => void;
}

export function AiFindingCard(props: AiFindingCardProps) {
  return (
    <article class="finding aiFinding">
      <div class="findingTop">
        <h3>
          <span class="material-symbols-rounded" aria-hidden="true">auto_awesome</span>
          Анализ от ИИ
        </h3>
        <Show when={props.analysis?.cached}>
          <span class="badge info">Кэш</span>
        </Show>
      </div>

      <Show when={props.isLoading}>
        <div class="aiLoadingRow">
          <CircularLoadingIndicator active={true} />
          <p>Gemini анализирует конфигурацию...</p>
        </div>
      </Show>

      <Show when={!props.isLoading && props.analysis}>
        {(analysis) => (
                      <>
                        <p>{analysis().shortText}</p>
                        <Show when={analysis().risks.length > 0}>
                          <div class="aiInlineList">
                            {analysis().risks.slice(0, 2).map((risk) => (
                              <span>
                                <span class="material-symbols-rounded" aria-hidden="true">priority_high</span>
                                {risk}
                              </span>
                            ))}
                          </div>
                        </Show>
                        <button type="button" class="textButton ripple-target" onClick={props.onOpenDetails}>
              <span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>
              Подробнее
            </button>
          </>
        )}
      </Show>

      <Show when={!props.isLoading && props.error}>
        <p class="aiError">{props.error}</p>
      </Show>
    </article>
  );
}
