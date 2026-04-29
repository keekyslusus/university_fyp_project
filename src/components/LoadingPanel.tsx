import CircularLoadingIndicator from "./CircularLoadingIndicator";

export function LoadingPanel() {
  return (
    <section class="loadingPanel">
      <CircularLoadingIndicator active={true} />
      <h2>Анализ конфигурации</h2>
      <p>Scandium проверяет параметры безопасности и формирует рекомендации.</p>
    </section>
  );
}
