# Deployment to FreeBSD Jail

This repository includes a helper script `deploy_to_jail.sh` that syncs files to a FreeBSD jail using `rsync` over SSH.

Requirements:
- `rsync` installed locally
- `inotifywait` (from `inotify-tools`) for automatic watch mode
- SSH access to the jail (`DEPLOY_USER@DEPLOY_HOST`) using key authentication

Usage:
- One-shot deploy:
  ./deploy_to_jail.sh --once
- Watch mode (auto-sync on changes):
  ./deploy_to_jail.sh

Customize the `REMOTE_*` variables in `deploy_to_jail.sh` if needed.
