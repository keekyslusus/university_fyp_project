import { useI18n } from "../i18n/I18nProvider";

export function Header() {
  const { t } = useI18n();

  return (
    <header class="header">
      <div>
        <h1>Scandium</h1>
        <p>{t("appSubtitle")}</p>
      </div>
    </header>
  );
}
