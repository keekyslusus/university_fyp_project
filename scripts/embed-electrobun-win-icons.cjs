const { execFileSync } = require("node:child_process");
const { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } = require("node:fs");
const { basename, dirname, join } = require("node:path");

if (process.env.ELECTROBUN_OS !== "win") {
  process.exit(0);
}

const projectRoot = process.cwd();
const iconPath = join(projectRoot, "public", "icon", "icon.ico");
const rceditPath = join(projectRoot, "node_modules", "rcedit", "bin", "rcedit-x64.exe");
const phase = process.env.SCANDIUM_ICON_PHASE || "all";

if (!existsSync(iconPath) || !existsSync(rceditPath)) {
  console.warn("[Scandium] icon embedding skipped: missing icon.ico or rcedit");
  process.exit(0);
}

const edited = new Set();

function embedIcon(targetPath) {
  if (!existsSync(targetPath) || edited.has(targetPath)) {
    return;
  }

  try {
    execFileSync(rceditPath, [targetPath, "--set-icon", iconPath], { stdio: "pipe" });
    edited.add(targetPath);
    console.log(`[Scandium] embedded Windows icon: ${targetPath}`);
  } catch (error) {
    console.warn(`[Scandium] failed to embed Windows icon: ${targetPath}`);
    console.warn(error instanceof Error ? error.message : String(error));
  }
}

function walk(dir, visit) {
  if (!existsSync(dir)) {
    return;
  }

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      walk(fullPath, visit);
    } else {
      visit(fullPath);
    }
  }
}

function patchBundle(bundlePath) {
  if (!bundlePath || !existsSync(bundlePath)) {
    return;
  }

  walk(bundlePath, (filePath) => {
    const name = basename(filePath).toLowerCase();

    if (name === "launcher" || name === "launcher.exe" || name === "bun.exe") {
      embedIcon(filePath);
    }
  });

  const resourcesPath = join(bundlePath, "Resources");
  if (existsSync(resourcesPath)) {
    cpSync(iconPath, join(resourcesPath, "app.ico"));
  }
}

function patchInstallerZip(zipPath) {
  if (!existsSync(zipPath)) {
    return;
  }

  const tempDir = join(dirname(zipPath), ".icon-patch");
  rmSync(tempDir, { recursive: true, force: true });
  mkdirSync(tempDir, { recursive: true });

  try {
    execFileSync("powershell.exe", [
      "-NoProfile",
      "-Command",
      `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${tempDir}' -Force`
    ], { stdio: "pipe" });

    walk(tempDir, (filePath) => {
      if (basename(filePath).toLowerCase().endsWith(".exe")) {
        embedIcon(filePath);
      }
    });

    rmSync(zipPath, { force: true });
    execFileSync("powershell.exe", [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Path '${join(tempDir, "*")}' -DestinationPath '${zipPath}' -Force`
    ], { stdio: "pipe" });

    console.log(`[Scandium] repacked installer artifact: ${zipPath}`);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

if (phase === "all" || phase === "bundle") {
  patchBundle(process.env.ELECTROBUN_BUILD_DIR && join(process.env.ELECTROBUN_BUILD_DIR, process.env.ELECTROBUN_APP_NAME || "Scandium"));
  patchBundle(process.env.ELECTROBUN_WRAPPER_BUNDLE_PATH);
}

if ((phase === "all" || phase === "artifact") && process.env.ELECTROBUN_ARTIFACT_DIR) {
  if (process.env.ELECTROBUN_BUILD_DIR) {
    walk(process.env.ELECTROBUN_BUILD_DIR, (filePath) => {
      const name = basename(filePath).toLowerCase();

      if (name.endsWith("-setup.exe")) {
        embedIcon(filePath);
      }
    });
  }

  walk(process.env.ELECTROBUN_ARTIFACT_DIR, (filePath) => {
    const name = basename(filePath).toLowerCase();

    if (name.endsWith(".exe")) {
      embedIcon(filePath);
    }

    if (name.endsWith("-setup.zip")) {
      patchInstallerZip(filePath);
    }
  });
}
