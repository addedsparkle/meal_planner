#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="/opt/meal-planner"
SERVICE_NAME="meal-planner-api"
SERVICE_USER="meal-planner"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$INSTALL_DIR/data/backups"

green()  { echo -e "\033[32m$*\033[0m"; }
yellow() { echo -e "\033[33m$*\033[0m"; }
red()    { echo -e "\033[31m$*\033[0m"; }
die()    { red "Error: $*"; exit 1; }

[[ "$(id -u)" -eq 0 ]] || die "This script must be run as root (sudo)."

[[ -d "$INSTALL_DIR" ]] || die "Meal Planner is not installed at $INSTALL_DIR. Run install.sh first."

# ── Backup database ───────────────────────────────────────────────────────────
echo "Backing up database..."
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/meal_planner-$(date +%Y%m%d-%H%M%S).db"
cp "$INSTALL_DIR/data/meal_planner.db" "$BACKUP_FILE"
green "Database backed up to $BACKUP_FILE"

# Prune backups older than 30 days
find "$BACKUP_DIR" -name "meal_planner-*.db" -mtime +30 -delete 2>/dev/null || true

# ── Build ─────────────────────────────────────────────────────────────────────
echo "Building application..."
cd "$REPO_ROOT"
npm install --workspaces --if-present
npm run build --workspaces --if-present
green "Build complete"

# ── Stop service ──────────────────────────────────────────────────────────────
echo "Stopping service..."
systemctl stop "$SERVICE_NAME"

# ── Deploy ────────────────────────────────────────────────────────────────────
echo "Deploying backend..."
rsync -a --delete \
    --exclude='.env' \
    "$REPO_ROOT/backend/dist/"         "$INSTALL_DIR/backend/dist/"
rsync -a --delete \
    "$REPO_ROOT/backend/node_modules/" "$INSTALL_DIR/backend/node_modules/"
cp "$REPO_ROOT/backend/package.json"   "$INSTALL_DIR/backend/package.json"
rsync -a --delete \
    "$REPO_ROOT/backend/drizzle/"      "$INSTALL_DIR/backend/drizzle/"

echo "Deploying frontend..."
rsync -a --delete \
    "$REPO_ROOT/frontend/dist/" "$INSTALL_DIR/frontend/"

# ── Migrate ───────────────────────────────────────────────────────────────────
echo "Running database migrations..."
DATABASE_URL="$INSTALL_DIR/data/meal_planner.db" \
    node "$INSTALL_DIR/backend/dist/db/migrate.js"
green "Migrations complete"

# ── Fix permissions & restart ─────────────────────────────────────────────────
chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"
systemctl start "$SERVICE_NAME"

# ── Verify ────────────────────────────────────────────────────────────────────
sleep 2
if systemctl is-active --quiet "$SERVICE_NAME"; then
    green "Service restarted successfully"
else
    red "Service failed to start — check logs:"
    journalctl -u "$SERVICE_NAME" -n 20 --no-pager
    yellow "Database backup available at: $BACKUP_FILE"
    exit 1
fi

green "Update complete!"
