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
cat > ${JAIL_ROOT}/usr/local/etc/rc.d/notify << 'RCEOF'
#!/bin/sh
# PROVIDE: notify
# REQUIRE: NETWORKING
# KEYWORD: shutdown
. /etc/rc.subr
name="notify"
rcvar="notify_enable"
pidfile="/var/run/notify.pid"
start_cmd="notify_start"
stop_cmd="notify_stop"
notify_start(){
  cd /usr/local/www/notify
  /usr/local/bin/node server.js > /var/log/notify.log 2>&1 &
  echo $! > ${pidfile}
}
notify_stop(){
  kill $(cat ${pidfile} 2>/dev/null) 2>/dev/null
  rm -f ${pidfile}
}
load_rc_config $name
run_rc_command "$1"
RCEOF
chmod +x ${JAIL_ROOT}/usr/local/etc/rc.d/notify

# rc.conf
grep -q 'notify_enable' ${JAIL_ROOT}/etc/rc.conf || \
  echo 'notify_enable="YES"' >> ${JAIL_ROOT}/etc/rc.conf

bastille service notify notify restart

echo "Setup complete."
