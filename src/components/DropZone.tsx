import { useI18n } from "../i18n/I18nProvider";

interface DropZoneProps {
  isDragging: boolean;
  compact?: boolean;
  onBrowse: () => void;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
}

export function DropZone(props: DropZoneProps) {
  const { t } = useI18n();

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
          <h2>{t("uploadAnotherTitle")}</h2>
          <p class="muted">{t("uploadAnotherText")}</p>
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
        <h2>{t("dragTitle")}</h2>
        <p>{t("dragText")}</p>
        <p class="muted">{t("supportedFiles")}</p>
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
        {t("chooseFile")}
      </button>
    </section>
  );
}
