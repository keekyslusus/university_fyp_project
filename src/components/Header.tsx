import { For, Show, createSignal, onCleanup, onMount } from "solid-js";
import { useI18n } from "../i18n/I18nProvider";
import { languages, type Language } from "../i18n/dictionaries";

const languageCodes: Record<Language, string> = {
  ru: "RU",
  en: "EN",
  kk: "KK"
};

export function Header() {
  const { language, setLanguage, t } = useI18n();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = createSignal(false);
  let languageSelectorRef: HTMLDivElement | undefined;

  onMount(() => {
    function handleDocumentPointerDown(event: PointerEvent) {
      if (languageSelectorRef && !languageSelectorRef.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    }

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLanguageMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    onCleanup(() => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    });
  });

  function chooseLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    setIsLanguageMenuOpen(false);
  }

  return (
    <header class="header">
      <div class="headerText">
        <h1>Scandium</h1>
        <p>{t("appSubtitle")}</p>
      </div>
      <div class="languageSelector" ref={languageSelectorRef}>
        <button
          type="button"
          class="languageButton ripple-target"
          aria-label="Language"
          aria-haspopup="menu"
          aria-expanded={isLanguageMenuOpen()}
          onClick={() => setIsLanguageMenuOpen((open) => !open)}
        >
          <span class="material-symbols-rounded" aria-hidden="true">language</span>
          <span>{languageCodes[language()]}</span>
        </button>
        <Show when={isLanguageMenuOpen()}>
          <div class="languageMenu" role="menu">
            <For each={languages}>
              {(item) => (
                <button
                  type="button"
                  class={`languageOption ripple-target ${item.code === language() ? "isSelected" : ""}`}
                  role="menuitemradio"
                  aria-checked={item.code === language()}
                  onClick={() => chooseLanguage(item.code)}
                >
                  <span class="languageOptionCode">{languageCodes[item.code]}</span>
                  <span>{item.label}</span>
                </button>
              )}
            </For>
          </div>
        </Show>
      </div>
    </header>
  );
}
