#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

case "${OS:-}" in
  Windows_NT) ;;
  *)
    case "$(uname -s)" in
      MINGW*|MSYS*|CYGWIN*) ;;
      *)
        echo "Windows x64 build must be run on Windows x64, for example from Git Bash."
        exit 1
        ;;
    esac
    ;;
esac

case "$(uname -m)" in
  x86_64|amd64) ;;
  *)
    echo "Windows build must be run on x64/amd64. Current arch: $(uname -m)"
    exit 1
    ;;
esac

npm run build:electrobun
