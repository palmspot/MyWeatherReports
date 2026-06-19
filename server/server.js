// server.js - Push notification server
// Node.js + web-push

'use strict';
const http    = require('http');
const https   = require('https');
const fs      = require('fs');
const fs      = require('fs').promises;
const path    = require('path');
const webpush = require('web-push');

const PORT         = Number(process.env.PORT || 3000);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://example.com';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
const VAPID_FILE   = path.join(__dirname, 'vapid.json');
const SUBS_FILE    = path.join(__dirname, 'subscriptions.json');
const POLL_INTERVAL= 5 * 60 * 1000; // 5分
const WARNED_FILE  = path.join(__dirname, 'warned.json');

// ==================== VAPID ====================
function loadOrGenVapid() {
  if (fs.existsSync(VAPID_FILE)) {
    return JSON.parse(fs.readFileSync(VAPID_FILE, 'utf8'));
async function loadOrGenVapid() {
  try {
    const data = await fs.readFile(VAPID_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    const keys = webpush.generateVAPIDKeys();
    const vapid = { publicKey: keys.publicKey, privateKey: keys.privateKey };
    await fs.writeFile(VAPID_FILE, JSON.stringify(vapid, null, 2), { mode: 0o600 });
    console.log('VAPID keys generated:', VAPID_FILE);
    return vapid;
  }
  const keys = webpush.generateVAPIDKeys();
  const vapid = { publicKey: keys.publicKey, privateKey: keys.privateKey };
  fs.writeFileSync(VAPID_FILE, JSON.stringify(vapid, null, 2), { mode: 0o600 });
  console.log('VAPID keys generated:', VAPID_FILE);
  return vapid;
}
const VAPID = loadOrGenVapid();
webpush.setVapidDetails(VAPID_SUBJECT, VAPID.publicKey, VAPID.privateKey);

// ==================== Subscriptions ====================
function loadSubs() {
  try { return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8')); } catch(e) { return []; }
async function loadSubs() {
  try { 
    const data = await fs.readFile(SUBS_FILE, 'utf8');
    return JSON.parse(data); 
  } catch(e) { return []; }
}
function saveSubs(subs) {
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2), { mode: 0o600 });
async function saveSubs(subs) {
  await fs.writeFile(SUBS_FILE, JSON.stringify(subs, null, 2), { mode: 0o600 });
}

// ==================== Warned state ====================
// 同じ警報を何度も通知しないよう、送信済みキーを記録
function loadWarned() {
  try { return JSON.parse(fs.readFileSync(WARNED_FILE, 'utf8')); } catch(e) { return {}; }
async function loadWarned() {
  try { 
    const data = await fs.readFile(WARNED_FILE, 'utf8');
    return JSON.parse(data); 
  } catch(e) { return {}; }
}
function saveWarned(w) {
  fs.writeFileSync(WARNED_FILE, JSON.stringify(w, null, 2), { mode: 0o600 });
async function saveWarned(w) {
  await fs.writeFile(WARNED_FILE, JSON.stringify(w, null, 2), { mode: 0o600 });
}

// ==================== JMA Warning Poll ====================
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'tenki-dashboard/2.1' } }, (res) => {
    const req = https.get(url, { 
      headers: { 'User-Agent': 'tenki-dashboard/2.1' },
      timeout: 10000 
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { reject(e); }
      });
    }).on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request Timeout'));
    });
  });
}

// 警報コードマスター（index.htmlと同一）
const WARN_CODES = {
  '02':'暴風雪警報','03':'大雨警報','04':'洪水警報','05':'暴風警報',
  '06':'大雪警報','07':'波浪警報','08':'高潮警報',
  '10':'大雨注意報','12':'大雪注意報','13':'風雪注意報','14':'雷注意報',
  '15':'強風注意報','16':'波浪注意報','17':'融雪注意報','18':'洪水注意報',
  '19':'高潮注意報','20':'濃霧注意報','21':'乾燥注意報','22':'なだれ注意報',
  '23':'低温注意報','24':'霜注意報','25':'着氷注意報','26':'着雪注意報',
  '32':'暴風雪特別警報','33':'大雨特別警報','35':'暴風特別警報',
  '36':'大雪特別警報','37':'波浪特別警報','38':'高潮特別警報',
};
const WARN_LEVEL = {
  '02':2,'03':2,'04':2,'05':2,'06':2,'07':2,'08':2,
  '10':1,'12':1,'13':1,'14':1,'15':1,'16':1,'17':1,'18':1,
  '19':1,'20':1,'21':1,'22':1,'23':1,'24':1,'25':1,'26':1,
  '32':3,'33':3,'35':3,'36':3,'37':3,'38':3,
};

function normalizeCode(c) { return String(c).length === 1 ? '0'+c : String(c); }
function getWarnName(c) { return WARN_CODES[normalizeCode(c)] || ('警報・注意報('+c+')'); }
function getWarnLevel(c) { return WARN_LEVEL[normalizeCode(c)] || 1; }

async function checkWarnings() {
  const subs = loadSubs();
  const subs = await loadSubs();
  if (!subs.length) return;

  // JMAコードごとにグループ化
  const codeMap = {};
  subs.forEach(s => {
    if (s.jmaCode) {
      if (!codeMap[s.jmaCode]) codeMap[s.jmaCode] = [];
      codeMap[s.jmaCode].push(s);
    }
  });

  const warned = loadWarned();
  const warned = await loadWarned();
  let warnedChanged = false;

  for (const [jmaCode, subscribers] of Object.entries(codeMap)) {
  await Promise.all(Object.entries(codeMap).map(async ([jmaCode, subscribers]) => {
    let data;
    try {
      data = await fetchJson(`https://www.jma.go.jp/bosai/warning/data/warning/${jmaCode}.json`);
    } catch(e) {
      console.error(`Failed to fetch warning for ${jmaCode}:`, e.message);
      continue;
      return;
    }

    // 発令中の警報を収集
    const active = [];
    try {
      const prefAreas = data.areaTypes && data.areaTypes[0] && data.areaTypes[0].areas || [];
      prefAreas.forEach(area => {
        (area.warnings || []).forEach(w => {
          if (w.status === '発表' || w.status === '継続') {
            active.push({ code: normalizeCode(w.code), level: getWarnLevel(w.code), name: getWarnName(w.code) });
          }
        });
      });
    } catch(e) {}

    if (!active.length) {
      // 警報解除 → 記録をリセット
      if (warned[jmaCode]) { delete warned[jmaCode]; warnedChanged = true; }
      continue;
      return;
    }

    // 送信済みキー（コードのソート済み文字列）
    const currentKey = active.map(a => a.code).sort().join(',');
    if (warned[jmaCode] === currentKey) continue; // 変化なし
    if (warned[jmaCode] === currentKey) return; // 変化なし
    warned[jmaCode] = currentKey;
    warnedChanged = true;

    // 通知内容を組み立て
    const maxLevel = Math.max(...active.map(a => a.level));
    const levelLabel = maxLevel >= 3 ? '⚠️特別警報' : maxLevel >= 2 ? '🔴警報' : '🟡注意報';
    const kinds = [...new Set(active.map(a => a.name))].join('・');
    const payload = JSON.stringify({
      title: `${levelLabel} — ${subscribers[0].locName || jmaCode}`,
      body: kinds,
      url: '/'
    });

    // 各購読者に送信
    for (const sub of subscribers) {
      try {
        await webpush.sendNotification(sub.subscription, payload);
        console.log(`Sent to ${sub.locName}: ${kinds}`);
      } catch(e) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          // 購読期限切れ → 削除
          const all = loadSubs();
          const all = await loadSubs();
          const filtered = all.filter(s => s.subscription.endpoint !== sub.subscription.endpoint);
          saveSubs(filtered);
          await saveSubs(filtered);
          console.log('Removed expired subscription:', sub.subscription.endpoint.slice(-20));
        } else {
          console.error('sendNotification error:', e.message);
        }
      }
    }
  }
  }));

  if (warnedChanged) saveWarned(warned);
  if (warnedChanged) await saveWarned(warned);
}

// ==================== HTTP Server ====================
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch(e) { resolve({}); } });
    req.on('error', reject);
  });
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, code, obj) {
  cors(res);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
async function startServer() {
  const VAPID = await loadOrGenVapid();
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID.publicKey, VAPID.privateKey);

  const server = http.createServer(async (req, res) => {
  const url = req.url.replace(/^\/push/, "").split('?')[0];

  if (req.method === 'OPTIONS') { cors(res); res.writeHead(204); res.end(); return; }

  if (req.method === 'GET' && url === '/vapid-public-key') {
    return json(res, 200, { publicKey: VAPID.publicKey });
  }

  if (req.method === 'POST' && url === '/subscribe') {
    const body = await parseBody(req);
    if (!body.subscription || !body.subscription.endpoint) return json(res, 400, { error: 'invalid' });
    const subs = loadSubs();
    const subs = await loadSubs();
    // 重複チェック
    const exists = subs.find(s => s.subscription.endpoint === body.subscription.endpoint);
    if (!exists) {
      subs.push({ subscription: body.subscription, jmaCode: body.jmaCode || '', locName: body.locName || '' });
      saveSubs(subs);
      await saveSubs(subs);
      console.log(`Subscribed: ${body.locName} (${body.jmaCode})`);
    }
    return json(res, 200, { ok: true });
  }

  if (req.method === 'POST' && url === '/unsubscribe') {
    const body = await parseBody(req);
    const endpoint = body.endpoint || (body.subscription && body.subscription.endpoint);
    if (!endpoint) return json(res, 400, { error: 'invalid' });
    const subs = loadSubs().filter(s => s.subscription.endpoint !== endpoint);
    saveSubs(subs);
    const all = await loadSubs();
    const filtered = all.filter(s => s.subscription.endpoint !== endpoint);
    await saveSubs(filtered);
    console.log('Unsubscribed:', endpoint.slice(-20));
    return json(res, 200, { ok: true });
  }

  json(res, 404, { error: 'not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Push server listening on port ${PORT}`);
  console.log(`VAPID public key: ${VAPID.publicKey}`);
  // 起動時に1回チェック、以降5分ごと
  checkWarnings();
  setInterval(checkWarnings, POLL_INTERVAL);
});
}

startServer().catch(console.error);
