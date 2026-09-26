#!/bin/sh
# notify jail セットアップスクリプト
# bastille restart後に実行する

JAIL_ROOT=/usr/local/bastille/jails/notify/root
APP_DIR=${JAIL_ROOT}/usr/local/www/notify

# ファイルコピー
mkdir -p ${APP_DIR}
cp /home/palmspot/server.js ${APP_DIR}/server.js
cp /home/palmspot/package.json ${APP_DIR}/package.json
if [ -f /home/palmspot/package-lock.json ]; then
  cp /home/palmspot/package-lock.json ${APP_DIR}/package-lock.json
fi

# vapid.jsonが既存なら保持
if [ -f /home/palmspot/vapid.json ]; then
  cp /home/palmspot/vapid.json ${APP_DIR}/vapid.json
fi

# subscriptions.jsonが既存なら保持
if [ -f /home/palmspot/subscriptions.json ]; then
  cp /home/palmspot/subscriptions.json ${APP_DIR}/subscriptions.json
elif [ ! -f ${APP_DIR}/subscriptions.json ]; then
  echo '[]' > ${APP_DIR}/subscriptions.json
fi

# Node.js と依存パッケージ
bastille pkg notify install -y node npm
bastille cmd notify sh -c 'cd /usr/local/www/notify && npm install --omit=dev'

# rc.dスクリプト
# 配置したserver.jsを検査
bastille cmd notify \
  /usr/local/bin/node --check /usr/local/www/notify/server.js

if [ $? -ne 0 ]; then
  echo "server.js syntax check failed." >&2
  exit 1
fi

# 旧rc.dスクリプトが管理しているプロセスを先に停止
bastille service notify notify stop 2>/dev/null || true

# 自動再起動対応rc.dスクリプト
cat > ${JAIL_ROOT}/usr/local/etc/rc.d/notify << 'RCEOF'
#!/bin/sh
# PROVIDE: notify
# REQUIRE: NETWORKING
# KEYWORD: shutdown

. /etc/rc.subr

name="notify"
rcvar="notify_enable"

load_rc_config "$name"
: ${notify_enable:="NO"}

pidfile="/var/run/notify.pid"
command="/usr/sbin/daemon"

# -R 5:
#   Node.js終了時に5秒待って再起動
#
# -P:
#   Node.jsではなく監視プロセスのPIDを保存
#   service notify stopで監視ごと停止できる
#
# -o:
#   Node.jsの標準出力・標準エラーをログへ追記
command_args="-R 5 \
  -P ${pidfile} \
  -o /var/log/notify.log \
  -t notify \
  /usr/local/bin/node /usr/local/www/notify/server.js"

run_rc_command "$1"
RCEOF

chmod +x ${JAIL_ROOT}/usr/local/etc/rc.d/notify

# 自動起動を有効化
grep -q '^notify_enable=' ${JAIL_ROOT}/etc/rc.conf || \
  echo 'notify_enable="YES"' >> ${JAIL_ROOT}/etc/rc.conf

# 新しい監視方式で起動
bastille service notify notify start

echo "Setup complete."