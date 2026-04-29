import { useI18n } from "../i18n/I18nProvider";

interface AiKeyPanelProps {
  value: string;
  onInput: (value: string) => void;
  onSave: () => void;
}

export function AiKeyPanel(props: AiKeyPanelProps) {
  const { t } = useI18n();

  return (
    <div class="aiKeyPanel">
      <span class="material-symbols-rounded" aria-hidden="true">key</span>
      <div>
        <h3>{t("geminiApiKey")}</h3>
        <p>{t("geminiApiKeyHelp")}</p>
      </div>
      <input
        type="password"
        value={props.value}
        placeholder="AIza..."
        onInput={(event) => props.onInput(event.currentTarget.value)}
      />
      <button type="button" class="secondaryButton ripple-target" onClick={props.onSave}>{t("save")}</button>
    </div>
  );
}
