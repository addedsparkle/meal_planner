#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

VERSION="${1:-$(node -e "process.stdout.write(require('$REPO_ROOT/package.json').version)")}"
RELEASE_NAME="meal-planner-$VERSION"
RELEASE_DIR="$REPO_ROOT/dist/$RELEASE_NAME"
TARBALL="$REPO_ROOT/dist/$RELEASE_NAME.tar.gz"

green()  { echo -e "\033[32m$*\033[0m"; }
yellow() { echo -e "\033[33m$*\033[0m"; }
die()    { echo -e "\033[31mError: $*\033[0m"; exit 1; }

echo "Building Meal Planner $VERSION..."

# ── Build ─────────────────────────────────────────────────────────────────────
cd "$REPO_ROOT"
npm install --workspaces --if-present
npm run build --workspaces --if-present
green "Build complete"

# ── Assemble release directory ────────────────────────────────────────────────
echo "Assembling release package..."
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR/backend"
mkdir -p "$RELEASE_DIR/frontend"
mkdir -p "$RELEASE_DIR/scripts"

# Backend: compiled output + production deps + migration files
rsync -a --delete \
    --exclude='.env' \
    "$REPO_ROOT/backend/dist/"         "$RELEASE_DIR/backend/dist/"
rsync -a --delete \
    "$REPO_ROOT/backend/node_modules/" "$RELEASE_DIR/backend/node_modules/"
cp "$REPO_ROOT/backend/package.json"   "$RELEASE_DIR/backend/package.json"
rsync -a --delete \
    "$REPO_ROOT/backend/drizzle/"      "$RELEASE_DIR/backend/drizzle/"

# Frontend: static build output
rsync -a --delete \
    "$REPO_ROOT/frontend/dist/" "$RELEASE_DIR/frontend/"

# Deployment scripts
cp "$SCRIPT_DIR/install.sh"                 "$RELEASE_DIR/scripts/"
cp "$SCRIPT_DIR/update.sh"                  "$RELEASE_DIR/scripts/"
cp "$SCRIPT_DIR/uninstall.sh"               "$RELEASE_DIR/scripts/"
cp "$SCRIPT_DIR/meal-planner-api.service"   "$RELEASE_DIR/scripts/"
cp "$SCRIPT_DIR/nginx-meal-planner.conf"    "$RELEASE_DIR/scripts/"
chmod +x "$RELEASE_DIR/scripts/"*.sh

green "Release directory assembled at $RELEASE_DIR"

# ── Create tarball ────────────────────────────────────────────────────────────
echo "Creating tarball..."
mkdir -p "$REPO_ROOT/dist"
tar -czf "$TARBALL" -C "$REPO_ROOT/dist" "$RELEASE_NAME"
green "Tarball created: $TARBALL"

# ── Checksums ─────────────────────────────────────────────────────────────────
echo "Generating checksums..."
cd "$REPO_ROOT/dist"
sha256sum "$RELEASE_NAME.tar.gz" > "$RELEASE_NAME.tar.gz.sha256"
green "Checksum written: $RELEASE_NAME.tar.gz.sha256"

echo ""
green "Package complete: $TARBALL"
echo "  Size:     $(du -sh "$TARBALL" | cut -f1)"
echo "  SHA-256:  $(cat "$RELEASE_NAME.tar.gz.sha256" | awk '{print $1}')"
echo ""
echo "To install on a server:"
echo "  1. scp $TARBALL user@server:/tmp/"
echo "  2. ssh user@server"
echo "  3. tar -xzf /tmp/$RELEASE_NAME.tar.gz -C /tmp"
echo "  4. sudo bash /tmp/$RELEASE_NAME/scripts/install.sh"
