// ==================== Web Push 通知 ====================
var _pushSubscription=null;

async function initPush(){
  if(!('serviceWorker' in navigator)||!('PushManager' in window))return;
  try{
    var reg=await navigator.serviceWorker.register('/sw.js');
    var sub=await reg.pushManager.getSubscription();
    _pushSubscription=sub;
    updatePushBtn();
  }catch(e){console.warn('SW init error',e);}
}

function updatePushBtn(){
  var btn=document.getElementById('push-btn');
  if(!btn)return;
  btn.textContent=_pushSubscription?'🔔':'🔕';
  btn.title=_pushSubscription?'通知をオフにする':'通知をオンにする';
}

async function fetchPushJson(url,options,label){
  var resp=await fetch(url,options);
  var contentType=resp.headers.get('content-type')||'';
  var text=await resp.text();
  if(!resp.ok){
    throw new Error(label+' APIエラー（HTTP '+resp.status+'）');
  }
  if(!text.trim())return {};
  if(contentType.indexOf('application/json')===-1){
    throw new Error('プッシュ通知サーバーが未設定です。'+url+' がJSONではない応答を返しました。');
  }
  try{
    return JSON.parse(text);
  }catch(e){
    throw new Error(label+' APIのJSONを読み取れませんでした。');
  }
}

async function togglePushNotification(){
  if(!('serviceWorker' in navigator)||!('PushManager' in window)){
    alert('このブラウザはプッシュ通知に対応していません。\niOSの場合はホーム画面に追加してください。');
    return;
  }
  if(_pushSubscription){
    // 購読解除
    try{
      try{
        await fetchPushJson('/push/unsubscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription:_pushSubscription.toJSON()})},'購読解除');
      }catch(e){
        console.warn('Push unsubscribe API error',e);
      }
      await _pushSubscription.unsubscribe();
      _pushSubscription=null;
      updatePushBtn();
      alert('プッシュ通知をオフにしました。');
    }catch(e){alert('解除に失敗しました: '+e.message);}
    return;
  }
  // 購読開始
  var perm=await Notification.requestPermission();
  if(perm!=='granted'){alert('通知が許可されませんでした。');return;}
  try{
    // VAPIDの公開鍵を取得
    var keyData=await fetchPushJson('/push/vapid-public-key',undefined,'VAPID公開鍵');
    var vapidKey=keyData.publicKey;
    if(!vapidKey)throw new Error('VAPID公開鍵が取得できませんでした。');
    // applicationServerKeyをUint8Arrayに変換
    var key=urlBase64ToUint8Array(vapidKey);
    var reg=await navigator.serviceWorker.ready;
    var sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
    // 現在地点のJMAコードと地名を送信
    var locs=loadLocations();var idx=getCurrentIdx();var loc=locs[idx]||{};
    await fetchPushJson('/push/subscribe',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        subscription:sub.toJSON(),
        jmaCode:loc.jma||'',
        locName:loc.name||''
      })
    },'購読登録');
    _pushSubscription=sub;
    updatePushBtn();
    alert('プッシュ通知をオンにしました。警報・注意報が発令されると通知されます。');
  }catch(e){
    try{
      var reg2=await navigator.serviceWorker.ready;
      var sub2=await reg2.pushManager.getSubscription();
      if(sub2)await sub2.unsubscribe();
    }catch(cleanupErr){console.warn('Push cleanup error',cleanupErr);}
    _pushSubscription=null;
    updatePushBtn();
    alert('通知の登録に失敗しました: '+e.message);
  }
}

function urlBase64ToUint8Array(base64String){
  var padding='='.repeat((4-base64String.length%4)%4);
  var base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
  var raw=window.atob(base64);
  var arr=new Uint8Array(raw.length);
  for(var i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i);
  return arr;
}


window.addEventListener('DOMContentLoaded',function(){
  var savedLang=localStorage.getItem('lang')||'ja';
  document.documentElement.setAttribute('data-lang',savedLang);
  var currentTheme=document.documentElement.getAttribute('data-theme')||'light';
  var btn=document.getElementById('theme-btn');if(btn)btn.textContent=currentTheme==='dark'?'☀️':'🌙';
  document.getElementById('owm-key').value=localStorage.getItem('owm_key')||'';
  document.getElementById('tmrw-key').value=localStorage.getItem('tmrw_key')||'';
  document.getElementById('pollen-key').value=localStorage.getItem('pollen_key')||'';
  document.getElementById('gweather-key').value=localStorage.getItem('gweather_key')||'';
  applyI18n();
  renderLocationBar();
  initPush();
  ['wxmap','aq'].forEach(function(p){var el=document.getElementById('panel-'+p);if(el)el.style.display='none';});
  loadAll();
});
