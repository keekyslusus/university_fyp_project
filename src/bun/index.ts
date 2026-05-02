import { ApplicationMenu, BrowserWindow, Updater, type ApplicationMenuItemConfig } from "electrobun/bun";

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

async function getMainViewUrl() {
  const channel = await Updater.localInfo.channel();

  if (channel === "dev") {
    try {
      await fetch(DEV_SERVER_URL, { method: "HEAD" });
      console.log(`[Scandium] using Vite dev server at ${DEV_SERVER_URL}`);
      return DEV_SERVER_URL;
    } catch {
      console.log("[Scandium] Vite dev server not available, using bundled view");
    }
  }

  return "views://mainview/index.html";
}

function createApplicationMenu() {
  const menu: ApplicationMenuItemConfig[] = [
    {
      label: "File",
      submenu: [{ role: "quit" }]
    },
    {
      label: "Edit",
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
      label: "View",
      submenu: [
        { role: "enterFullScreen" },
        { role: "exitFullScreen" },
        { role: "toggleFullScreen" }
      ]
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "close" }
      ]
    }
  ];

  ApplicationMenu.setApplicationMenu(menu);
}

createApplicationMenu();

const mainWindow = new BrowserWindow({
  title: "Scandium - VPN config analyzer",
  url: await getMainViewUrl(),
  frame: {
    width: 1100,
    height: 760,
    x: 160,
    y: 120
  }
});

console.log("[Scandium] Electrobun app started", { windowId: mainWindow.id });
