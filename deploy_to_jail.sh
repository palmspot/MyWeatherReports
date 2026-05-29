#!/usr/bin/env bash
# Usage: ./deploy_to_jail.sh [--once]
# Deploys project files to remote FreeBSD jail via rsync over SSH.

set -euo pipefail
REMOTE_USER="DEPLOY_USER"
REMOTE_HOST="DEPLOY_HOST"
REMOTE_PORT=22
REMOTE_PATH="/usr/local/www/html"
SSH_OPTS="-p ${REMOTE_PORT} -o StrictHostKeyChecking=accept-new"
RSYNC_EXCLUDES=(.git .vscode deploy_to_jail.sh)

ARGS=()
for a in "$@"; do
  ARGS+=("$a")
done

RSYNC_EXCLUDE_ARGS=()
for e in "${RSYNC_EXCLUDES[@]}"; do
  RSYNC_EXCLUDE_ARGS+=("--exclude=$e")
done

if [[ "${ARGS[*]}" == *"--once"* ]]; then
  echo "Running one-shot deploy..."
  rsync -avz --delete "${RSYNC_EXCLUDE_ARGS[@]}" -e "ssh ${SSH_OPTS}" ./ ${REMOTE_USER}@${REMOTE_HOST}:"${REMOTE_PATH}/"
  echo "Deploy complete."
  exit 0
fi

# Watch mode: require inotifywait
if ! command -v inotifywait >/dev/null 2>&1; then
  echo "inotifywait not found. Install inotify-tools (Linux) or use fswatch on macOS." >&2
  exit 1
fi

echo "Starting watch mode. Press Ctrl+C to stop."
while true; do
  rsync -avz --delete "${RSYNC_EXCLUDE_ARGS[@]}" -e "ssh ${SSH_OPTS}" ./ ${REMOTE_USER}@${REMOTE_HOST}:"${REMOTE_PATH}/"
  # Wait for filesystem change
  inotifywait -r -e modify,create,delete,move . >/dev/null 2>&1
  echo "Changes detected; syncing..."
done
