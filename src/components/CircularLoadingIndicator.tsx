import { Component, Show, createEffect, createSignal, onCleanup } from 'solid-js';
import './circular-loading.css';

type CircularLoadingIndicatorProps = {
  active: boolean;
  class?: string;
};

export const CircularLoadingIndicator: Component<CircularLoadingIndicatorProps> = (props) => {
  const MIN_VISIBLE_MS = 280;
  const HIDE_DURATION_MS = 200;
  const [rendered, setRendered] = createSignal(Boolean(props.active));
  const [visible, setVisible] = createSignal(Boolean(props.active));

  let shownAt = props.active ? Date.now() : 0;
  let hideTimer: number | undefined;
  let unmountTimer: number | undefined;

  const clearTimers = () => {
    if (hideTimer !== undefined) {
      window.clearTimeout(hideTimer);
      hideTimer = undefined;
    }
    if (unmountTimer !== undefined) {
      window.clearTimeout(unmountTimer);
      unmountTimer = undefined;
    }
  };

  createEffect(() => {
    const isActive = props.active;
    const minVisibleMs = MIN_VISIBLE_MS;
    const hideDurationMs = HIDE_DURATION_MS;

    if (isActive) {
      clearTimers();
      if (!rendered()) {
        setRendered(true);
      }
      requestAnimationFrame(() => {
        shownAt = Date.now();
        setVisible(true);
      });
      return;
    }

    if (!rendered()) return;

    clearTimers();
    const elapsed = Date.now() - shownAt;
    const waitBeforeHide = Math.max(0, minVisibleMs - elapsed);

    hideTimer = window.setTimeout(() => {
      setVisible(false);
      unmountTimer = window.setTimeout(() => {
        setRendered(false);
      }, hideDurationMs);
    }, waitBeforeHide);
  });

  onCleanup(() => {
    clearTimers();
  });

  return (
    <Show when={rendered()}>
      <div
        class={`shared-circular-loader ${visible() ? 'is-visible' : 'is-hidden'} ${props.class ?? ''}`.trim()}
        role="status"
        aria-live="polite"
        aria-busy={props.active}
      >
        <svg class="shared-circular-loader__svg" viewBox="25 25 50 50" aria-hidden="true">
          <circle cx="50" cy="50" r="20" />
        </svg>
      </div>
    </Show>
  );
};

export default CircularLoadingIndicator;
