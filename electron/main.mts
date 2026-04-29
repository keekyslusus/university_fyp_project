import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Language = "ru" | "en" | "kk";

let mainWindow: BrowserWindow | null = null;
let currentLanguage: Language = "en";

function publicAssetPath(...segments: string[]) {
  return app.isPackaged
    ? path.join(process.resourcesPath, ...segments)
    : path.join(__dirname, "../public", ...segments);
}

function windowIconPath() {
  if (process.platform === "win32") {
    return publicAssetPath("icon", "ico128.ico");
  }

  if (process.platform === "linux") {
    return publicAssetPath("icon", "icon512.png");
  }

  return undefined;
}

const menuText: Record<Language, {
  file: string;
  edit: string;
  view: string;
  window: string;
  language: string;
  languageNames: Record<Language, string>;
}> = {
  ru: {
    file: "Файл",
    edit: "Правка",
    view: "Вид",
    window: "Окно",
    language: "Язык",
    languageNames: {
      ru: "Русский",
      en: "English",
      kk: "Қазақша"
    }
  },
  en: {
    file: "File",
    edit: "Edit",
    view: "View",
    window: "Window",
    language: "Language",
    languageNames: {
      ru: "Русский",
      en: "English",
      kk: "Қазақша"
    }
  },
  kk: {
    file: "Файл",
    edit: "Өңдеу",
    view: "Көрініс",
    window: "Терезе",
    language: "Тіл",
    languageNames: {
      ru: "Русский",
      en: "English",
      kk: "Қазақша"
    }
  }
};

function isLanguage(value: unknown): value is Language {
  return value === "ru" || value === "en" || value === "kk";
}

function setApplicationLanguage(language: Language, notifyRenderer = false) {
  currentLanguage = language;
  createApplicationMenu();

  if (notifyRenderer) {
    mainWindow?.webContents.send("language-changed", language);
  }
}

function createApplicationMenu() {
  const text = menuText[currentLanguage];
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: text.file,
      submenu: [{ role: "quit" }]
    },
    {
      label: text.edit,
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" }
      ]
    },
    {
      label: text.view,
      submenu: [
        {
          label: text.language,
          submenu: [
            { label: text.languageNames.ru, type: "radio", checked: currentLanguage === "ru", click: () => setApplicationLanguage("ru", true) },
            { label: text.languageNames.en, type: "radio", checked: currentLanguage === "en", click: () => setApplicationLanguage("en", true) },
            { label: text.languageNames.kk, type: "radio", checked: currentLanguage === "kk", click: () => setApplicationLanguage("kk", true) }
          ]
        },
        { type: "separator" },
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: text.window,
      submenu: [{ role: "minimize" }, { role: "close" }]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 620,
    title: "Scandium - VPN config analyzer",
    icon: windowIconPath(),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.once("did-finish-load", () => {
      mainWindow?.webContents.openDevTools({ mode: "detach" });
    });
  }
}

app.whenReady().then(() => {
  createApplicationMenu();
  createWindow();

  ipcMain.on("set-language", (_event, language: unknown) => {
    if (isLanguage(language)) {
      setApplicationLanguage(language);
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
