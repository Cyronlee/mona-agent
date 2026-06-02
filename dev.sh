#!/usr/bin/env bash
# Start backend (port 5679) and frontend (port 5678) concurrently.

ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  echo ""
  echo "[dev] Stopping services..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  echo "[dev] Done."
}
trap cleanup EXIT INT TERM

echo "[dev] Starting backend on :5679 ..."
cd "$ROOT/backend"
PORT=5679 bun --watch src/index.ts &
BACKEND_PID=$!

echo "[dev] Starting frontend on :5678 ..."
cd "$ROOT/ui"
bun run dev &
FRONTEND_PID=$!

echo "[dev] Backend PID=$BACKEND_PID  Frontend PID=$FRONTEND_PID"
echo "[dev] Press Ctrl+C to stop."

wait "$BACKEND_PID" "$FRONTEND_PID"
