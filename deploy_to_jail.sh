#!/usr/bin/env bash
# Usage: ./deploy_to_jail.sh [--once]
# Deploys project files to remote FreeBSD jail via rsync over SSH.

set -euo pipefail
REMOTE_USER="DEPLOY_USER"
REMOTE_HOST="DEPLOY_HOST"
# Use direct server IP because Cloudflare does not proxy SSH.
REMOTE_PORT=22
REMOTE_PATH="/usr/local/www/html"
SSH_OPTS="-tt -p ${REMOTE_PORT} -o StrictHostKeyChecking=accept-new"
RSYNC_EXCLUDES=(.git .vscode deploy_to_jail.sh)

ARGS=()
for a in "$@"; do
  ARGS+=("$a")
done

RSYNC_EXCLUDE_ARGS=()
for e in "${RSYNC_EXCLUDES[@]}"; do
  RSYNC_EXCLUDE_ARGS+=("--exclude=$e")
done

remote_supports_rsync() {
  ssh ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST} "command -v rsync >/dev/null 2>&1"
}

deploy_with_scp() {
  echo "Remote rsync not available; falling back to tarball+scp with sudo."
  local tmpname="/tmp/deploy_to_jail_${REMOTE_USER}_$$.tar"
  tar --exclude='.git' --exclude='.vscode' --exclude='deploy_to_jail.sh' -cf "${tmpname}" .
  scp -P "${REMOTE_PORT}" "${tmpname}" "${REMOTE_USER}@${REMOTE_HOST}:${tmpname}"
  ssh ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST} "sudo -n mkdir -p \"${REMOTE_PATH}\" && sudo -n tar -xpf \"${tmpname}\" -C \"${REMOTE_PATH}\" && rm -f \"${tmpname}\""
  rm -f "${tmpname}"
}

if [[ "${ARGS[*]}" == *"--once"* ]]; then
  echo "Running one-shot deploy..."
  if remote_supports_rsync; then
    rsync -avz --delete "${RSYNC_EXCLUDE_ARGS[@]}" -e "ssh ${SSH_OPTS}" ./ ${REMOTE_USER}@${REMOTE_HOST}:"${REMOTE_PATH}/"
  else
    deploy_with_scp
  fi
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
  if remote_supports_rsync; then
    rsync -avz --delete "${RSYNC_EXCLUDE_ARGS[@]}" -e "ssh ${SSH_OPTS}" ./ ${REMOTE_USER}@${REMOTE_HOST}:"${REMOTE_PATH}/"
  else
    deploy_with_scp
  fi
  # Wait for filesystem change
  inotifywait -r -e modify,create,delete,move . >/dev/null 2>&1
  echo "Changes detected; syncing..."
done
