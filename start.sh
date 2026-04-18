#!/bin/bash

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()  { echo -e "${CYAN}[arxio]${NC} $1"; }
ok()   { echo -e "${GREEN}[arxio]${NC} $1"; }
warn() { echo -e "${YELLOW}[arxio]${NC} $1"; }
die()  { echo -e "${RED}[arxio]${NC} $1"; exit 1; }

usage() {
  echo ""
  echo -e "${BOLD}Usage:${NC}"
  echo "  ./start.sh --server     FastAPI + Celery worker"
  echo "  ./start.sh --client     Next.js dev server"
  echo "  ./start.sh --all        Everything"
  echo ""
  exit 0
}

start_docker() {
  log "Checking Docker..."
  if ! docker info > /dev/null 2>&1; then
    die "Docker is not running. Start Docker Desktop and try again."
  fi

  log "Starting Redis (docker-compose.dev.yml)..."
  docker compose -f "$ROOT/docker-compose.dev.yml" up -d

  log "Waiting for Redis..."
  for i in $(seq 1 10); do
    if docker exec arxio-redis redis-cli ping > /dev/null 2>&1; then
      ok "Redis ready on port 6380"
      return
    fi
    sleep 1
  done
  die "Redis failed to start"
}

start_server() {
  log "Starting FastAPI server..."
  cd "$ROOT/server"
  uv run python main.py &
  SERVER_PID=$!
  ok "FastAPI running (pid $SERVER_PID) → http://localhost:8000"

  log "Starting Celery worker..."
  uv run celery -A app.workers.celery_app worker --loglevel=info &
  CELERY_PID=$!
  ok "Celery running (pid $CELERY_PID)"

  wait $SERVER_PID $CELERY_PID
}

start_client() {
  log "Starting Next.js client..."
  cd "$ROOT/client"
  if [ ! -d "node_modules" ]; then
    warn "node_modules not found — running npm install..."
    npm install
  fi
  npm run dev &
  CLIENT_PID=$!
  ok "Next.js running (pid $CLIENT_PID) → http://localhost:3000"

  wait $CLIENT_PID
}

cleanup() {
  echo ""
  warn "Shutting down..."
  pkill -f "uvicorn|celery|next dev" 2>/dev/null || true
  docker compose -f "$ROOT/docker-compose.dev.yml" stop 2>/dev/null || true
  ok "All stopped."
}

trap cleanup SIGINT SIGTERM

case "$MODE" in
  --server)
    start_docker
    start_server
    ;;
  --client)
    start_client
    ;;
  --all)
    start_docker
    start_server &
    start_client
    ;;
  --help | -h | "")
    usage
    ;;
  *)
    die "Unknown option: $MODE"
    ;;
esac
