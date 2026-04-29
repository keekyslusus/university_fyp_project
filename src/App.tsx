import { createSignal, For, Show } from "solid-js";
import { render } from "solid-js/web";
import { analyzeConfig, formatReport } from "./core/analyzer";
import type { AnalysisResult, Severity } from "./core/types";
import "./styles.css";

const severityLabel: Record<Severity, string> = {
  info: "Инфо",
  low: "Низкий",
  medium: "Средний",
  high: "Высокий"
};

function downloadText(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function App() {
  const [result, setResult] = createSignal<AnalysisResult | null>(null);
  const [error, setError] = createSignal("");

  async function handleFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    setError("");
    setResult(null);

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      setResult(analyzeConfig(file.name, text));
    } catch {
      setError("Не удалось прочитать файл конфигурации.");
    }
  }

  function exportReport() {
    const current = result();
    if (!current) {
      return;
    }

    downloadText(`vpn-analysis-${current.fileName}.txt`, formatReport(current));
  }

  return (
    <main class="app">
      <header class="header">
        <div>
          <h1>VPN Config Analyzer</h1>
          <p>Анализатор безопасности конфигураций OpenVPN и WireGuard</p>
        </div>
      </header>

      <section class="panel">
        <h2>Загрузка конфигурации</h2>
        <p class="muted">Поддерживаются файлы OpenVPN .ovpn и WireGuard .conf.</p>
        <input type="file" accept=".ovpn,.conf,.txt" onChange={handleFileChange} />
        <Show when={error()}>
          <p class="error">{error()}</p>
        </Show>
      </section>

      <Show when={result()} fallback={
        <section class="empty">
          <h2>Результат появится после загрузки файла</h2>
          <p>Программа определит тип конфигурации, найдёт потенциально небезопасные параметры и сформирует рекомендации.</p>
        </section>
      }>
        {(analysis) => (
          <>
            <section class="summary">
              <div>
                <span class="label">Файл</span>
                <strong>{analysis().fileName}</strong>
              </div>
              <div>
                <span class="label">Тип</span>
                <strong>{analysis().type}</strong>
              </div>
              <div>
                <span class="label">Оценка</span>
                <strong>{analysis().score}/100</strong>
              </div>
              <div>
                <span class="label">Риск</span>
                <strong>{analysis().riskLevel}</strong>
              </div>
            </section>

            <section class="panel">
              <div class="sectionHeader">
                <h2>Замечания и рекомендации</h2>
                <button type="button" onClick={exportReport}>Экспорт отчёта</button>
              </div>

              <div class="findings">
                <For each={analysis().findings}>
                  {(finding) => (
                    <article class="finding">
                      <div class="findingTop">
                        <h3>{finding.title}</h3>
                        <span class={`badge ${finding.severity}`}>{severityLabel[finding.severity]}</span>
                      </div>
                      <p>{finding.description}</p>
                      <p><strong>Рекомендация:</strong> {finding.recommendation}</p>
                    </article>
                  )}
                </For>
              </div>
            </section>
          </>
        )}
      </Show>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);
