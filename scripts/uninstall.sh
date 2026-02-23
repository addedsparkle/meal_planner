#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="/opt/meal-planner"
SERVICE_NAME="meal-planner-api"
SERVICE_USER="meal-planner"
NGINX_CONF="/etc/nginx/sites-available/meal-planner"
NGINX_ENABLED="/etc/nginx/sites-enabled/meal-planner"

green()  { echo -e "\033[32m$*\033[0m"; }
yellow() { echo -e "\033[33m$*\033[0m"; }
red()    { echo -e "\033[31m$*\033[0m"; }

[[ "$(id -u)" -eq 0 ]] || { red "Error: This script must be run as root (sudo)."; exit 1; }

echo "This will remove Meal Planner from this system."
echo ""
read -rp "Remove application data (database)? [y/N] " REMOVE_DATA
echo ""
read -rp "Proceed with uninstall? [y/N] " CONFIRM
[[ "${CONFIRM,,}" == "y" ]] || { echo "Aborted."; exit 0; }

# ── Stop and disable service ──────────────────────────────────────────────────
if systemctl list-units --full -all | grep -q "$SERVICE_NAME.service"; then
    echo "Stopping and disabling service..."
    systemctl stop    "$SERVICE_NAME" 2>/dev/null || true
    systemctl disable "$SERVICE_NAME" 2>/dev/null || true
    rm -f "/etc/systemd/system/$SERVICE_NAME.service"
    systemctl daemon-reload
    green "Service removed"
fi

# ── Remove Nginx config ───────────────────────────────────────────────────────
if [[ -f "$NGINX_CONF" ]]; then
    echo "Removing Nginx configuration..."
    rm -f "$NGINX_ENABLED"
    rm -f "$NGINX_CONF"
    nginx -t && systemctl reload nginx 2>/dev/null || true
    green "Nginx configuration removed"
fi

# ── Remove application files ──────────────────────────────────────────────────
if [[ -d "$INSTALL_DIR" ]]; then
    if [[ "${REMOVE_DATA,,}" == "y" ]]; then
        echo "Removing application and data..."
        rm -rf "$INSTALL_DIR"
        green "Application and data removed"
    else
        echo "Removing application (keeping data)..."
        rm -rf "$INSTALL_DIR/backend"
        rm -rf "$INSTALL_DIR/frontend"
        green "Application removed (data preserved at $INSTALL_DIR/data)"
    fi
fi

# ── Remove system user ────────────────────────────────────────────────────────
if id "$SERVICE_USER" &>/dev/null; then
    echo "Removing system user '$SERVICE_USER'..."
    userdel "$SERVICE_USER" 2>/dev/null || true
fi

echo ""
green "Uninstall complete."
