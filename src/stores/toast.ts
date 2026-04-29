import { createStore } from "solid-js/store";

type ToastTone = "error" | "success";
type ToastState = "show" | "hide";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  state: ToastState;
}

const HIDE_AFTER_MS = 2800;
const REMOVE_AFTER_MS = 3200;
let nextToastId = 1;

const [toastStore, setToastStore] = createStore<{ toasts: Toast[] }>({
  toasts: []
});

function showToast(message: string, tone: ToastTone = "error") {
  const id = nextToastId;
  nextToastId += 1;

  setToastStore("toasts", (toasts) => [...toasts, { id, message, tone, state: "show" }]);

  window.setTimeout(() => {
    setToastStore("toasts", (toast) => toast.id === id, "state", "hide");
  }, HIDE_AFTER_MS);

  window.setTimeout(() => {
    setToastStore("toasts", (toasts) => toasts.filter((toast) => toast.id !== id));
  }, REMOVE_AFTER_MS);
}

export { showToast, toastStore };
