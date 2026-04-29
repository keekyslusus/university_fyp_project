interface AiKeyPanelProps {
  value: string;
  onInput: (value: string) => void;
  onSave: () => void;
}

export function AiKeyPanel(props: AiKeyPanelProps) {
  return (
    <div class="aiKeyPanel">
      <span class="material-symbols-rounded" aria-hidden="true">key</span>
      <div>
        <h3>Gemini API key</h3>
        <p>Добавьте ключ, чтобы Scandium показал краткий анализ от ИИ. Ключ сохраняется только локально в браузере/Electron.</p>
      </div>
      <input
        type="password"
        value={props.value}
        placeholder="AIza..."
        onInput={(event) => props.onInput(event.currentTarget.value)}
      />
      <button type="button" class="secondaryButton ripple-target" onClick={props.onSave}>Сохранить</button>
    </div>
  );
}
