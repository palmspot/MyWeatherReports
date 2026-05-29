# Deployment to FreeBSD Jail (Public)

This is an anonymized deployment guide safe for publishing. Replace `deployuser` and `remote.host.example` with your deployment user and host when you deploy.

Requirements:
- `rsync` installed locally
- `inotifywait` (from `inotify-tools`) for automatic watch mode
- SSH access to the jail (remote deploy user and host) using key authentication
- Remote `sudo` access for the deploy user to write to the target directory

Usage:
- One-shot deploy:
  ./deploy_to_jail.sh --once
- Watch mode (auto-sync on changes):
  ./deploy_to_jail.sh

### Remote sudoers setup for passwordless deploy
On the remote FreeBSD server, create a sudoers file so the deploy user can run only the required commands without a password:

```sh
sudo visudo -f /usr/local/etc/sudoers.d/deploy_weather_reports
```

Add the following contents:

```text
Cmnd_Alias DEPLOY_CMDS = /bin/mkdir, /usr/bin/tar
deployuser ALL=(root) NOPASSWD: DEPLOY_CMDS
```

Then verify permissions:

```sh
sudo chmod 440 /usr/local/etc/sudoers.d/deploy_weather_reports
```
