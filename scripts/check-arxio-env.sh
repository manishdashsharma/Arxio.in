#!/usr/bin/env bash
# Validates server env via Pydantic Settings (same as the API). Run from repo root:
#   ./scripts/check-arxio-env.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/server/.env"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

die() { echo -e "${RED}[env]${NC} $1"; exit 1; }
ok()  { echo -e "${GREEN}[env]${NC} $1"; }
warn(){ echo -e "${YELLOW}[env]${NC} $1"; }
info(){ echo -e "${CYAN}[env]${NC} $1"; }

[[ -f "$ENV_FILE" ]] || die "Missing $ENV_FILE — create it (required keys match server/app/core/config.py)."

cd "$ROOT/server"
if [[ -x ./.venv/bin/python ]]; then
  PY=./.venv/bin/python
elif [[ -x "$ROOT/.venv/bin/python" ]]; then
  PY="$ROOT/.venv/bin/python"
elif command -v uv >/dev/null 2>&1; then
  PY="uv run python"
elif command -v python3 >/dev/null 2>&1; then
  PY="python3"
else
  die "No Python found — create server/.venv: cd server && python3 -m venv .venv && ./.venv/bin/pip install -e ."
fi

info "Loading Settings from server/.env (cwd: server/) …"
$PY - <<'PY'
import sys
from pathlib import Path
from pydantic import ValidationError

env_path = Path(".env")
if not env_path.is_file():
    print("ERROR: server/.env not found", file=sys.stderr)
    sys.exit(1)

try:
    from app.core.config import Settings
    s = Settings()
except ValidationError as e:
    print("Validation failed — fix server/.env:\n", file=sys.stderr)
    for err in e.errors():
        loc = ".".join(str(x) for x in err.get("loc", ()))
        print(f"  • {loc}: {err.get('msg')}", file=sys.stderr)
    sys.exit(1)

print("Settings OK.")
if not (s.openai_api_key or "").strip():
    print("WARN: OPENAI_API_KEY empty — PDF AI / embeddings will fail.")
if (s.redis_url or "").strip() in ("redis://localhost:6379", "redis://127.0.0.1:6379"):
    print("WARN: REDIS_URL is default :6379 — if you use Docker Redis from start.sh, use redis://localhost:6380")
if not (s.qdrant_url or "").strip():
    print("INFO: QDRANT_URL empty — Scholar RAG indexing/search may be skipped.")
PY
STATUS=$?
[[ "$STATUS" -eq 0 ]] || exit "$STATUS"
ok "Pydantic Settings load succeeded."

echo ""
echo "=== Start commands (repo root) ==="
echo "  ./start.sh --server     # Docker Redis + FastAPI + Celery worker"
echo "  ./start.sh --app        # Vite UI → http://localhost:5173"
echo ""
echo "=== Celery worker check (after server is up) ==="
echo "  cd server && ./.venv/bin/celery -A app.workers.celery_app inspect ping"
echo ""
echo "Required fields (see server/app/core/config.py): MONGODB_URI, JWT_SECRET"
echo "Defaults: REDIS_URL=redis://localhost:6379 (use :6380 with docker-compose.dev.yml)"
echo ""
