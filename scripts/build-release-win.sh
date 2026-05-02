#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

if [ ! -x "node_modules/.bin/electron-builder" ] && [ ! -x "node_modules/.bin/electron-builder.cmd" ]; then
  echo "electron-builder is not installed. Run: npm install"
  exit 1
fi

npm run release:win
