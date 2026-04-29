interface DropZoneProps {
  isDragging: boolean;
  compact?: boolean;
  onBrowse: () => void;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
}

export function DropZone(props: DropZoneProps) {
  if (props.compact) {
    return (
      <section
        class={`uploadPanel ripple-target ${props.isDragging ? "isDragging" : ""}`}
        onDragOver={props.onDragOver}
        onDragLeave={props.onDragLeave}
        onDrop={props.onDrop}
        onClick={props.onBrowse}
        role="button"
        tabIndex={0}
      >
        <span class="material-symbols-rounded" aria-hidden="true">upload_file</span>
        <div>
          <h2>Загрузить другой файл</h2>
          <p class="muted">Перетащите конфигурацию сюда или выберите файл вручную.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      class={`dropHero ripple-target ${props.isDragging ? "isDragging" : ""}`}
      onDragOver={props.onDragOver}
      onDragLeave={props.onDragLeave}
      onDrop={props.onDrop}
      onClick={props.onBrowse}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          props.onBrowse();
        }
      }}
    >
      <span class="material-symbols-rounded dropHeroIcon" aria-hidden="true">shield_lock</span>
      <div>
        <h2>Перетащите VPN-конфигурацию</h2>
        <p>Перетащите файл в это окно, чтобы начать анализ.</p>
        <p class="muted">Поддерживаются OpenVPN .ovpn, WireGuard .conf и текстовые файлы.</p>
      </div>
      <button
        type="button"
        class="secondaryButton ripple-target"
        onClick={(event) => {
          event.stopPropagation();
          props.onBrowse();
        }}
      >
        <span class="material-symbols-rounded" aria-hidden="true">upload_file</span>
        Выбрать файл
      </button>
    </section>
  );
}
