#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

if [ "$(uname -s)" != "Linux" ]; then
  echo "Linux release packaging must be run on Linux x64/amd64."
  echo "On Windows, electron-builder can unpack Linux Electron, but AppImage/deb packaging needs Linux tooling."
  exit 1
fi

case "$(uname -m)" in
  x86_64|amd64) ;;
  *)
    echo "Linux release packaging must be run on x64/amd64. Current arch: $(uname -m)"
    exit 1
    ;;
esac

if [ ! -x "node_modules/.bin/electron-builder" ] && [ ! -x "node_modules/.bin/electron-builder.cmd" ]; then
  echo "electron-builder is not installed. Run: npm install"
  exit 1
fi

npm run release:linux
