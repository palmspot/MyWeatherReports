# Deployment to FreeBSD Jail

This repository includes a helper script `deploy_to_jail.sh` that syncs files to a FreeBSD jail using `rsync` over SSH.

Requirements:
- `rsync` installed locally
- `inotifywait` (from `inotify-tools`) for automatic watch mode
- SSH access to the jail (`DEPLOY_USER@DEPLOY_HOST`) using key authentication
- Remote `sudo` access for the `DEPLOY_USER` user to write to the target directory

Usage:
- One-shot deploy:
  ./deploy_to_jail.sh --once
- Watch mode (auto-sync on changes):
  ./deploy_to_jail.sh

### Save-to-deploy (VS Code)
Install the `emeraldwalk.runonsave` extension in VS Code, then saving files matching `*.html`, `*.js`, `*.css`, or `*.json` will automatically trigger `./deploy_to_jail.sh --once`.

If the remote target directory requires elevated permissions, this script now uses `sudo` on the remote side for directory creation and extraction.

### Remote sudoers setup for passwordless deploy
On the remote FreeBSD server, create a sudoers file so `DEPLOY_USER` can run only the required commands without a password:

```sh
sudo visudo -f /usr/local/etc/sudoers.d/deploy_weather_reports
```

そして、以下を追加します:

```text
Cmnd_Alias DEPLOY_CMDS = /bin/mkdir, /usr/bin/tar
DEPLOY_USER ALL=(root) NOPASSWD: DEPLOY_CMDS
```

保存後、権限を確認します:

```sh
sudo chmod 440 /usr/local/etc/sudoers.d/deploy_weather_reports
```

これにより、`./deploy_to_jail.sh --once` が保存時にパスワードなしで実行できるようになります。

Customize the `REMOTE_*` variables in `deploy_to_jail.sh` if needed.
