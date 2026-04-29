import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import type { AiAnalysis } from "../core/types";
import { useI18n } from "../i18n/I18nProvider";

interface AiDialogProps {
  analysis: AiAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AiDialog(props: AiDialogProps) {
  const { t } = useI18n();
  const [isMounted, setIsMounted] = createSignal(false);
  const [isVisible, setIsVisible] = createSignal(false);
  let hideTimer: number | undefined;

  createEffect(() => {
    if (!props.isOpen) {
      setIsVisible(false);
      if (hideTimer !== undefined) {
        window.clearTimeout(hideTimer);
      }
      hideTimer = window.setTimeout(() => {
        setIsMounted(false);
      }, 180);
      return;
    }

    if (hideTimer !== undefined) {
      window.clearTimeout(hideTimer);
      hideTimer = undefined;
    }

    setIsMounted(true);
    requestAnimationFrame(() => setIsVisible(true));

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    onCleanup(() => {
      document.body.style.overflow = previousOverflow;
    });
  });

  onCleanup(() => {
    if (hideTimer !== undefined) {
      window.clearTimeout(hideTimer);
    }
  });

  return (
    <Show when={isMounted() && props.analysis}>
      {(analysis) => (
        <div
          class={`dialogBackdrop ${isVisible() ? "isVisible" : "isHidden"}`}
          role="presentation"
          onClick={props.onClose}
        >
          <section
            class={`aiDialog ${isVisible() ? "isVisible" : "isHidden"}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div class="dialogHeader">
              <h2 id="ai-dialog-title">{t("aiDialogTitle")}</h2>
              <button type="button" class="iconButton ripple-target" aria-label={t("close")} onClick={props.onClose}>
                <span class="material-symbols-rounded" aria-hidden="true">close</span>
              </button>
            </div>

            <div class="aiDialogContent">
              <section>
                <h3>{t("summary")}</h3>
                <p>{analysis().summary}</p>
              </section>

              <section>
                <h3>{t("keyRisks")}</h3>
                <ul>
                  {analysis().risks.map((risk) => <li>{risk}</li>)}
                </ul>
              </section>

              <section>
                <h3>{t("actions")}</h3>
                <ul>
                  {analysis().actions.map((action) => <li>{action}</li>)}
                </ul>
              </section>

              <section>
                <h3>{t("conclusion")}</h3>
                <p>{analysis().conclusion}</p>
              </section>
            </div>
          </section>
        </div>
      )}
    </Show>
  );
}
