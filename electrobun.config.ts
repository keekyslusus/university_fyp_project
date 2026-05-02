import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "Scandium",
    identifier: "kz.edu.scandium",
    version: "0.1.0"
  },
  scripts: {
    postBuild: "./scripts/embed-electrobun-win-bundle-icons.cjs",
    postWrap: "./scripts/embed-electrobun-win-bundle-icons.cjs",
    postPackage: "./scripts/embed-electrobun-win-artifact-icons.cjs"
  },
  build: {
    copy: {
      "dist/index.html": "views/mainview/index.html",
      "dist/assets": "views/mainview/assets",
      "public/icon": "views/icon"
    },
    watchIgnore: ["dist/**"],
    mac: {
      bundleCEF: false
    },
    linux: {
      bundleCEF: false,
      icon: "public/icon/icon512.png"
    },
    win: {
      bundleCEF: false
    }
  }
} satisfies ElectrobunConfig;
