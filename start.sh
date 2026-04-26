#!/bin/bash

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-}"

if [ -f "$ROOT/server/.env" ]; then
  set -a
  source "$ROOT/server/.env"
  set +a
fi

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
  echo "  ./start.sh --client     Next.js dev server (landing page)"
  echo "  ./start.sh --app        Vite dev server (application)"
  echo "  ./start.sh --all        Everything"
  echo ""
  exit 0
}

start_docker() {
  local redis_url="${REDIS_URL:-}"
  if [[ "$redis_url" == rediss://* ]] || [[ "$redis_url" == redis://*upstash* ]]; then
    ok "Redis → Upstash (skipping Docker)"
    return
  fi

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
  if command -v uv >/dev/null 2>&1; then
    uv run python main.py &
  elif [ -x "$ROOT/server/.venv/bin/python" ]; then
    if ! "$ROOT/server/.venv/bin/python" -c "import uvicorn, celery" >/dev/null 2>&1; then
      die "Python deps missing in server/.venv. Run: cd server && ./.venv/bin/pip install -e ."
    fi
    "$ROOT/server/.venv/bin/python" -m uvicorn main:app --reload --host 0.0.0.0 --port "${PORT:-8000}" &
  elif [ -x "$ROOT/.venv/bin/python" ]; then
    if ! "$ROOT/.venv/bin/python" -c "import uvicorn, celery" >/dev/null 2>&1; then
      die "Python deps missing in .venv. Run: cd \"$ROOT\" && ./.venv/bin/pip install -e ./server"
    fi
    "$ROOT/.venv/bin/python" -m uvicorn main:app --reload --host 0.0.0.0 --port "${PORT:-8000}" &
  else
    if ! python3 -c "import uvicorn, celery" >/dev/null 2>&1; then
      die "Python deps missing. Run: cd server && python3 -m pip install -e ."
    fi
    python3 -m uvicorn main:app --reload --host 0.0.0.0 --port "${PORT:-8000}" &
  fi
  SERVER_PID=$!
  ok "FastAPI running (pid $SERVER_PID) → http://localhost:8000"

  log "Starting Celery worker..."
  if command -v uv >/dev/null 2>&1; then
    uv run celery -A app.workers.celery_app worker --loglevel=info &
  elif [ -x "$ROOT/server/.venv/bin/celery" ]; then
    "$ROOT/server/.venv/bin/celery" -A app.workers.celery_app worker --loglevel=info &
  else
    python3 -m celery -A app.workers.celery_app worker --loglevel=info &
  fi
  CELERY_PID=$!
  ok "Celery running (pid $CELERY_PID)"

  wait $SERVER_PID $CELERY_PID
}

start_client() {
  log "Starting Next.js client (landing page)..."
  cd "$ROOT/client"
  if [ ! -d "node_modules" ]; then
    warn "node_modules not found — running npm install..."
    npm install
  fi
  PORT=3000 npm run dev &
  CLIENT_PID=$!
  ok "Next.js running (pid $CLIENT_PID) → http://localhost:3000"

  wait $CLIENT_PID
}

start_app() {
  log "Starting Vite app (application)..."
  cd "$ROOT/app"
  if [ ! -d "node_modules" ]; then
    warn "node_modules not found — running npm install..."
    npm install
  fi
  npm run dev &
  APP_PID=$!
  ok "Vite running (pid $APP_PID) → http://localhost:5173"

  wait $APP_PID
}

cleanup() {
  echo ""
  warn "Shutting down..."
  pkill -f "uvicorn|celery|next dev|vite" 2>/dev/null || true
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
  --app)
    start_app
    ;;
  --all)
    start_docker
    start_server &
    start_client &
    start_app
    ;;
  --help | -h | "")
    usage
    ;;
  *)
    die "Unknown option: $MODE"
    ;;
esac
