import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { render } from "solid-js/web";
import "material-symbols/rounded.css";
import { analyzeWithGemini } from "./core/aiAnalysis";
import { hasGeminiApiKey, saveGeminiApiKey } from "./core/aiConfig";
import { analyzeConfig, formatReport } from "./core/analyzer";
import type { AiAnalysis, AnalysisResult } from "./core/types";
import { DropZone } from "./components/DropZone";
import { Header } from "./components/Header";
import { LoadingPanel } from "./components/LoadingPanel";
import { MessagePanel } from "./components/MessagePanel";
import { ResultsPanel } from "./components/ResultsPanel";
import { ToastHost } from "./components/ToastHost";
import { I18nProvider, useI18n } from "./i18n/I18nProvider";
import type { Language } from "./i18n/dictionaries";
import { showToast } from "./stores/toast";
import "./components/ripple.js";
import "./styles.css";
import { downloadText } from "./utils/download";

interface AiRequest {
  fileName: string;
  text: string;
  localResult: AnalysisResult;
  language: Language;
}

function App() {
  const { language, t } = useI18n();
  const [result, setResult] = createSignal<AnalysisResult | null>(null);
  const [error, setError] = createSignal("");
  const [isDragging, setIsDragging] = createSignal(false);
  const [isAnalyzing, setIsAnalyzing] = createSignal(false);
  const [isAiLoading, setIsAiLoading] = createSignal(false);
  const [aiAnalysis, setAiAnalysis] = createSignal<AiAnalysis | null>(null);
  const [aiError, setAiError] = createSignal("");
  const [apiKeyInput, setApiKeyInput] = createSignal("");
  const [hasApiKey, setHasApiKey] = createSignal(hasGeminiApiKey());
  const [isAiDialogOpen, setIsAiDialogOpen] = createSignal(false);
  const [lastAiRequest, setLastAiRequest] = createSignal<AiRequest | null>(null);
  let fileInputRef: HTMLInputElement | undefined;

  onMount(() => {
    const handler = (event: PointerEvent) => window.VibeClownRipple?.handleDelegatedRipple(event);
    window.addEventListener("pointerdown", handler, true);

    onCleanup(() => {
      window.removeEventListener("pointerdown", handler, true);
    });
  });

  async function analyzeFile(file: File) {
    resetAnalysisState();

    if (!isSupportedConfigFile(file)) {
      showToast(t("unsupportedFileError"), "error");
      clearFileInput();
      return;
    }

    setIsAnalyzing(true);

    try {
      const [text] = await Promise.all([
        file.text(),
        new Promise((resolve) => window.setTimeout(resolve, 420))
      ]);
      const localResult = analyzeConfig(file.name, text, language());
      const request = { fileName: file.name, text, localResult, language: language() };

      setLastAiRequest(request);
      setResult(localResult);
      void runAiAnalysis(request);
    } catch {
      setError(t("readFileError"));
    } finally {
      setIsAnalyzing(false);
      clearFileInput();
    }
  }

  function isSupportedConfigFile(file: File) {
    const name = file.name.toLowerCase();
    return name.endsWith(".ovpn") || name.endsWith(".conf");
  }

  function resetAnalysisState() {
    setError("");
    setResult(null);
    setAiAnalysis(null);
    setAiError("");
    setIsAiDialogOpen(false);
  }

  function clearFileInput() {
    if (fileInputRef) {
      fileInputRef.value = "";
    }
  }

  async function runAiAnalysis(request: AiRequest) {
    setIsAiLoading(true);
    setAiError("");

    try {
      setAiAnalysis(await analyzeWithGemini(request.fileName, request.text, request.localResult, request.language));
    } catch (caught) {
      setAiError(caught instanceof Error ? caught.message : t("aiGenericError"));
    } finally {
      setIsAiLoading(false);
    }
  }

  function saveApiKeyFromInput() {
    const key = apiKeyInput().trim();
    saveGeminiApiKey(key);
    setHasApiKey(hasGeminiApiKey());
    setApiKeyInput("");

    if (!key) {
      setAiError(t("apiKeyCleared"));
      return;
    }

    const request = lastAiRequest();
    if (request) {
      void runAiAnalysis(request);
    }
  }

  async function handleFileChange(event: Event) {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (file) {
      await analyzeFile(file);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent) {
    if (event.currentTarget === event.target) {
      setIsDragging(false);
    }
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      await analyzeFile(file);
    }
  }

  function browseFiles() {
    fileInputRef?.click();
  }

  function exportReport() {
    const current = result();
    if (current) {
      downloadText(`vpn-analysis-${current.fileName}.txt`, formatReport(current, language()));
    }
  }

  return (
    <main class="app">
      <ToastHost variant="popup-overlay" />
      <Header />

      <input
        ref={fileInputRef}
        class="fileInput"
        type="file"
        accept=".ovpn,.conf"
        onChange={handleFileChange}
      />

      <Show when={!result() && !isAnalyzing()}>
        <DropZone
          isDragging={isDragging()}
          onBrowse={browseFiles}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      </Show>

      <Show when={isAnalyzing()}>
        <LoadingPanel />
      </Show>

      <Show when={error()}>
        <MessagePanel message={error()} />
      </Show>

      <Show when={result()}>
        {(analysis) => (
          <>
            <DropZone
              compact
              isDragging={isDragging()}
              onBrowse={browseFiles}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
            <ResultsPanel
              analysis={analysis()}
              aiAnalysis={aiAnalysis()}
              aiError={aiError()}
              apiKeyInput={apiKeyInput()}
              hasApiKey={hasApiKey()}
              isAiLoading={isAiLoading()}
              isAiDialogOpen={isAiDialogOpen()}
              onApiKeyInput={setApiKeyInput}
              onApiKeySave={saveApiKeyFromInput}
              onAiDetailsOpen={() => setIsAiDialogOpen(true)}
              onAiDetailsClose={() => setIsAiDialogOpen(false)}
              onExport={exportReport}
            />
          </>
        )}
      </Show>
    </main>
  );
}

render(
  () => (
    <I18nProvider>
      <App />
    </I18nProvider>
  ),
  document.getElementById("root")!
);
