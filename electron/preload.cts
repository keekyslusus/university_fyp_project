import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("scandium", {
  setLanguage(language: string) {
    ipcRenderer.send("set-language", language);
  },
  onLanguageChanged(callback: (language: string) => void) {
    const listener = (_event: Electron.IpcRendererEvent, language: string) => callback(language);
    ipcRenderer.on("language-changed", listener);
    return () => ipcRenderer.removeListener("language-changed", listener);
  }
});
