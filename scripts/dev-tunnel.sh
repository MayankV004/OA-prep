#!/usr/bin/env bash

set -Eeuo pipefail

PORT="${PORT:-3000}"
NGROK_LOG="/tmp/opencode/bigo-ngrok.log"
APP_PID=""
NGROK_PID=""

cleanup() {
  [[ -n "$APP_PID" ]] && kill "$APP_PID" 2>/dev/null || true
  [[ -n "$NGROK_PID" ]] && kill "$NGROK_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

if ! command -v ngrok >/dev/null 2>&1; then
  echo "ngrok is required. Install it from https://ngrok.com/download" >&2
  exit 1
fi

mkdir -p "$(dirname "$NGROK_LOG")"
rm -f "$NGROK_LOG"

ngrok http "$PORT" >"$NGROK_LOG" 2>&1 &
NGROK_PID=$!

PUBLIC_URL=""
for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:4040/api/tunnels >/tmp/opencode/bigo-ngrok-tunnels.json 2>/dev/null; then
    PUBLIC_URL="$(node -e 'const fs=require("fs"); const d=JSON.parse(fs.readFileSync(0,"utf8")); const t=(d.tunnels||[]).find(x=>x.public_url?.startsWith("https://")); process.stdout.write(t?.public_url||"")' < /tmp/opencode/bigo-ngrok-tunnels.json)"
    [[ -n "$PUBLIC_URL" ]] && break
  fi
  sleep 1
done

if [[ -z "$PUBLIC_URL" ]]; then
  echo "ngrok did not expose an HTTPS tunnel." >&2
  cat "$NGROK_LOG" >&2 || true
  exit 1
fi

export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-$PUBLIC_URL}"
export BETTER_AUTH_URL="${BETTER_AUTH_URL:-$PUBLIC_URL}"

echo "BigO public URL: $PUBLIC_URL"
echo "Cashfree webhook URL: $PUBLIC_URL/api/webhooks/cashfree"
echo "Cashfree return URL base: $PUBLIC_URL/dashboard"
echo ""

npm run dev -- --port "$PORT" &
APP_PID=$!

wait "$APP_PID"
