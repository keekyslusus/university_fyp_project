import CircularLoadingIndicator from "./CircularLoadingIndicator";
import { useI18n } from "../i18n/I18nProvider";

export function LoadingPanel() {
  const { t } = useI18n();

  return (
    <section class="loadingPanel">
      <CircularLoadingIndicator active={true} />
      <h2>{t("loadingTitle")}</h2>
      <p>{t("loadingText")}</p>
    </section>
  );
}
