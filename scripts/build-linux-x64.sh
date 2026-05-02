#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

if [ "$(uname -s)" != "Linux" ]; then
  echo "Linux x64 build must be run on Linux x64."
  exit 1
fi

case "$(uname -m)" in
  x86_64|amd64) ;;
  *)
    echo "Linux build must be run on x64/amd64. Current arch: $(uname -m)"
    exit 1
    ;;
esac

npm run build:electrobun
