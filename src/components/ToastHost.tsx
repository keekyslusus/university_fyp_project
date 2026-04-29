import { Component, For } from 'solid-js';
import { toastStore } from '../stores/toast';
import './Toast.css';

type ToastHostVariant = 'ide' | 'popup-overlay';

interface ToastHostProps {
  variant?: ToastHostVariant;
  class?: string;
}

export const ToastHost: Component<ToastHostProps> = (props) => {
  const variant = props.variant ?? 'ide';
  const hostClass = ['toast-host', `toast-host--${variant}`, props.class || ''].filter(Boolean).join(' ');

  return (
    <div class={hostClass} role="status" aria-live="polite">
      <For each={toastStore.toasts}>
        {(toast) => (
          <div class={`toast toast--${toast.state} toast--${toast.tone}`}>
            {toast.message}
          </div>
        )}
      </For>
    </div>
  );
};
