#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="/opt/meal-planner"
SERVICE_NAME="meal-planner-api"
SERVICE_USER="meal-planner"
NGINX_CONF="/etc/nginx/sites-available/meal-planner"
NGINX_ENABLED="/etc/nginx/sites-enabled/meal-planner"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Colour helpers ────────────────────────────────────────────────────────────
green()  { echo -e "\033[32m$*\033[0m"; }
yellow() { echo -e "\033[33m$*\033[0m"; }
red()    { echo -e "\033[31m$*\033[0m"; }
die()    { red "Error: $*"; exit 1; }

# ── Prerequisites ─────────────────────────────────────────────────────────────
echo "Checking prerequisites..."

[[ "$(id -u)" -eq 0 ]] || die "This script must be run as root (sudo)."

command -v node  >/dev/null 2>&1 || die "Node.js is not installed. Install Node.js 20+ and retry."
command -v npm   >/dev/null 2>&1 || die "npm is not installed."
command -v nginx >/dev/null 2>&1 || die "Nginx is not installed. Run: sudo apt install nginx"

NODE_MAJOR=$(node -e "process.stdout.write(process.version.split('.')[0].slice(1))")
[[ "$NODE_MAJOR" -ge 20 ]] || die "Node.js 20+ is required (found $(node --version))."

green "Prerequisites OK"

# ── Build ─────────────────────────────────────────────────────────────────────
echo "Building application..."
cd "$REPO_ROOT"
npm install --workspaces --if-present
npm run build --workspaces --if-present
green "Build complete"

# ── Create user ───────────────────────────────────────────────────────────────
if ! id "$SERVICE_USER" &>/dev/null; then
    echo "Creating system user '$SERVICE_USER'..."
    useradd --system --no-create-home --shell /usr/sbin/nologin "$SERVICE_USER"
fi

# ── Create directories ────────────────────────────────────────────────────────
echo "Creating installation directories..."
mkdir -p "$INSTALL_DIR/backend"
mkdir -p "$INSTALL_DIR/frontend"
mkdir -p "$INSTALL_DIR/data"

# ── Copy backend ──────────────────────────────────────────────────────────────
echo "Installing backend..."
rsync -a --delete \
    --exclude='.env' \
    "$REPO_ROOT/backend/dist/"         "$INSTALL_DIR/backend/dist/"
rsync -a --delete \
    "$REPO_ROOT/backend/node_modules/" "$INSTALL_DIR/backend/node_modules/"
cp "$REPO_ROOT/backend/package.json"   "$INSTALL_DIR/backend/package.json"

# Copy migration files so the migrate script works at runtime
rsync -a --delete \
    "$REPO_ROOT/backend/drizzle/" "$INSTALL_DIR/backend/drizzle/"

# ── Copy frontend ─────────────────────────────────────────────────────────────
echo "Installing frontend..."
rsync -a --delete \
    "$REPO_ROOT/frontend/dist/" "$INSTALL_DIR/frontend/"

# ── Run migrations ────────────────────────────────────────────────────────────
echo "Running database migrations..."
DATABASE_URL="$INSTALL_DIR/data/meal_planner.db" \
    node --experimental-vm-modules "$INSTALL_DIR/backend/dist/db/migrate.js" \
    || DATABASE_URL="$INSTALL_DIR/data/meal_planner.db" \
       node "$INSTALL_DIR/backend/dist/db/migrate.js"
green "Migrations complete"

# ── Permissions ───────────────────────────────────────────────────────────────
chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"
chmod 750 "$INSTALL_DIR/data"

# ── Systemd service ───────────────────────────────────────────────────────────
echo "Installing systemd service..."
cp "$SCRIPT_DIR/meal-planner-api.service" "/etc/systemd/system/$SERVICE_NAME.service"
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"
green "Service installed and started"

# ── Nginx ─────────────────────────────────────────────────────────────────────
echo "Configuring Nginx..."
cp "$SCRIPT_DIR/nginx-meal-planner.conf" "$NGINX_CONF"
ln -sf "$NGINX_CONF" "$NGINX_ENABLED"

# Remove default site if still linked
rm -f /etc/nginx/sites-enabled/default

nginx -t || die "Nginx configuration test failed."
systemctl reload nginx
green "Nginx configured"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
green "Installation complete!"
echo ""
echo "  App:  http://$(hostname -I | awk '{print $1}')"
echo "  API:  http://$(hostname -I | awk '{print $1}')/api"
echo "  Docs: http://$(hostname -I | awk '{print $1}')/docs"
echo ""
echo "  Logs:    sudo journalctl -u $SERVICE_NAME -f"
echo "  Status:  sudo systemctl status $SERVICE_NAME"
