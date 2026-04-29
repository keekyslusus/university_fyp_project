import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("scandium", {
  onLanguageChanged(callback: (language: string) => void) {
    const listener = (_event: Electron.IpcRendererEvent, language: string) => callback(language);
    ipcRenderer.on("language-changed", listener);
    return () => ipcRenderer.removeListener("language-changed", listener);
  }
});
