// ==================== Main Tab Navigation ====================
var _activeMainTab='forecast';
function switchMainTab(tab){
  _activeMainTab=tab;
  document.querySelectorAll('.main-tab').forEach(function(el){el.classList.toggle('active',el.getAttribute('data-panel')===tab);});
  var forecastEl=document.getElementById('main-content');
  if(forecastEl)forecastEl.style.display=(tab==='forecast')?'block':'none';
  ['radar','wxmap','aq'].forEach(function(p){var el=document.getElementById('panel-'+p);if(el)el.style.display=(tab===p)?'block':'none';});
  if(tab==='radar'){
    if(!_radarInitialized) initRadarMap();
    else if(_radarMap) setTimeout(function(){ _radarMap.invalidateSize(); }, 100);
  }
  if(tab==='wxmap'&&!_wxmapInitialized)initWxmap();
  if(tab==='aq')syncAqPanel();
}

// ==================== Rain Radar (JMA Nowcast) ====================
var _radarMap=null,_radarLayer=null,_radarFrames=[],_radarIdx=0,_radarTimer=null,_radarInitialized=false,_radarDataRoots=['/wxmap/bosai/jmatile/data/nowc','https://www.jma.go.jp/bosai/jmatile/data/nowc'],_radarDataRoot='/wxmap/bosai/jmatile/data/nowc';

async function initRadarMap(){
  if(_radarInitialized)return;
  _radarInitialized=true;
  var locs=loadLocations();var idx=getCurrentIdx();var loc=locs[idx]||{lat:34.6937,lon:135.5023};
  _radarMap=L.map('radar-map',{minZoom:4,maxZoom:10}).setView([loc.lat,loc.lon],8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',opacity:0.6}).addTo(_radarMap);
  loadRadarFrames();
}

async function fetchRadarTimeFile(base, file){
  try {
    var r = await fetchWithTimeout(base + '/' + file, {cache:'no-store'});
    if(!r.ok) throw new Error('Radar time file failed: '+base+'/'+file+' ('+r.status+')');
    var data = await r.json();
    if(!Array.isArray(data)) throw new Error('Radar time file invalid: '+base+'/'+file);
    return data;
  } catch (e) {
    console.warn('Radar time file load failed', base+'/'+file, e);
    return [];
  }
}

async function loadRadarFrames(){
  var tl=document.getElementById('radar-timeline');
  if(tl)tl.innerHTML='<span style="font-size:11px;color:var(--text2)">'+t('radar_loading')+'</span>';

  try {
    var files = ['targetTimes_N1.json','targetTimes_N2.json'];
    var frames = [];
    for(var i=0;i<files.length;i++){
      var data = [];
      for(var j=0;j<_radarDataRoots.length;j++){
        data = await fetchRadarTimeFile(_radarDataRoots[j], files[i]);
        if(data && data.length){
          _radarDataRoot = _radarDataRoots[j];
          break;
        }
      }
      if(data && data.length) frames = frames.concat(data);
    }
    frames = frames.filter(function(f){
      return f && f.basetime && f.validtime && Array.isArray(f.elements) && (f.elements.indexOf('hrpns')>=0 || f.elements.indexOf('hrpns_nd')>=0);
    });
    if(!frames.length) throw new Error('Radar frames not found');
    frames.sort(function(a,b){return a.validtime < b.validtime ? -1 : a.validtime > b.validtime ? 1 : 0;});
    _radarFrames = frames.slice(-12);
    _radarIdx = _radarFrames.length - 1;

    buildRadarTimeline();
    showRadarFrame();
  } catch (e) {
    console.error('JMA Radar error:', e);
    if(tl)tl.innerHTML='<span style="font-size:11px;color:#A32D2D">'+t('radar_error')+'</span>';
  }
}

function getRadarElement(frame){
  if(!frame||!Array.isArray(frame.elements)) return 'hrpns';
  if(frame.elements.indexOf('hrpns')>=0) return 'hrpns';
  if(frame.elements.indexOf('hrpns_nd')>=0) return 'hrpns_nd';
  return frame.elements[0] || 'hrpns';
}

function formatRadarTimeJST(time){
  if(!time||time.length<12) return '??:??';
  var y = parseInt(time.substring(0,4),10);
  var m = parseInt(time.substring(4,6),10) - 1;
  var d = parseInt(time.substring(6,8),10);
  var h = parseInt(time.substring(8,10),10);
  var mi = parseInt(time.substring(10,12),10);
  var dt = new Date(Date.UTC(y,m,d,h,mi));
  dt.setUTCHours(dt.getUTCHours() + 9);
  var hh = String(dt.getUTCHours()).padStart(2,'0');
  var mm = String(dt.getUTCMinutes()).padStart(2,'0');
  return hh + ':' + mm;
}

function buildRadarTimeline(){
  var tl=document.getElementById('radar-timeline');if(!tl)return;
  if(!_radarFrames||!_radarFrames.length){tl.innerHTML='<span style="font-size:11px;color:#A32D2D">'+t('radar_error')+'</span>';return;}
  tl.innerHTML=_radarFrames.map(function(f,i){
    var vt = f.validtime || '';
    var lbl = formatRadarTimeJST(vt);
    var isFuture = f.basetime !== f.validtime;
    var cls = 'radar-ts-btn' + (isFuture ? ' future' : '') + (i === _radarIdx ? ' active' : '');
    return '<button class="'+cls+'" onclick="selectRadarFrame('+i+')">'+lbl+'</button>';
  }).join('');
}

function selectRadarFrame(idx){
  _radarIdx=idx;
  buildRadarTimeline();
  showRadarFrame();
}

function showRadarFrame(){
  if(!_radarFrames||!_radarFrames[_radarIdx])return;
  var f = _radarFrames[_radarIdx];
  var basetime = f.basetime || '';
  var validtime = f.validtime || '';
  if(!basetime||!validtime){console.warn('Invalid radar frame',f);return;}
  var element = getRadarElement(f);
  var url = _radarDataRoot + '/' + basetime + '/none/' + validtime + '/surf/' + element + '/{z}/{x}/{y}.png';
  console.log('Radar tile URL:', url);
  
  if(_radarLayer) _radarMap.removeLayer(_radarLayer);
  _radarLayer = L.tileLayer(url, {
    opacity: 0.7,
    attribution: '出典：気象庁 ナウキャスト',
    maxZoom: 10,
    crossOrigin: true
  }).addTo(_radarMap);
}

function toggleRadarPlay(){
  if(_radarTimer){
    clearInterval(_radarTimer);
    _radarTimer=null;
    document.getElementById('radar-play-icon').className='ti ti-player-play';
    document.getElementById('radar-play-label').textContent=t('radar_play');
  } else {
    _radarTimer=setInterval(function(){
      _radarIdx = (_radarIdx + 1) % _radarFrames.length;
      selectRadarFrame(_radarIdx);
    }, 1000);
    document.getElementById('radar-play-icon').className='ti ti-player-pause';
    document.getElementById('radar-play-label').textContent=t('radar_pause');
  }
}

var _aqSynced=false;
function syncAqPanel(){
  var aqPanel=document.getElementById('panel-aq');if(!aqPanel)return;
  var src=document.querySelector('#main-content .aq-panel');
  if(src&&!_aqSynced){aqPanel.innerHTML='';var clone=src.cloneNode(true);aqPanel.appendChild(clone);_aqSynced=true;}
  else if(!src){aqPanel.innerHTML='<div class="loading">'+t('loading')+'</div>';}
}
function resetAqSync(){_aqSynced=false;if(_activeMainTab==='aq')syncAqPanel();}

// ==================== Weather Map ====================
var _wxmapInitialized=false,_activeWxtab='surface',_wxmapList=null;
function fetchWxmapList(callback){
  if(_wxmapList){callback(_wxmapList);return;}
  fetch('/wxmap/bosai/weather_map/data/list.json').then(function(r){return r.json();}).then(function(data){_wxmapList=data;callback(data);}).catch(function(){handleWxmapError();});
}
function getWxmapFilename(data,type){
  var arr;
  if(type==='surface')arr=data.near&&data.near.now;
  else if(type==='fcst24')arr=data.near&&data.near.ft24;
  else if(type==='fcst48')arr=data.near&&data.near.ft48;
  if(!arr||arr.length===0)return null;
  return arr[arr.length-1];
}
function initWxmap(){if(_wxmapInitialized)return;_wxmapInitialized=true;loadWxmapImage('surface');}
function switchWxTab(tab){_activeWxtab=tab;document.querySelectorAll('.wxmap-tab').forEach(function(el){el.classList.toggle('active',el.getAttribute('data-wxtab')===tab);});loadWxmapImage(tab);}
function loadWxmapImage(type){
  var img=document.getElementById('wxmap-img');if(!img)return;img.style.opacity='0.4';
  fetchWxmapList(function(data){var filename=getWxmapFilename(data,type);if(!filename){handleWxmapError();return;}img.src='/wxmap/bosai/weather_map/data/png/'+filename;img.onload=function(){img.style.opacity='1';};img.onerror=function(){handleWxmapError();};});
}
function handleWxmapError(){var wrap=document.querySelector('.wxmap-img-wrap');if(wrap){wrap.innerHTML='<div style="padding:2rem;text-align:center;color:var(--text2);font-size:13px"><i class="ti ti-photo-off" style="font-size:32px;display:block;margin-bottom:8px;opacity:0.4"></i>画像を直接読み込めませんでした。<br><a href="https://www.jma.go.jp/bosai/weather_map/" target="_blank" rel="noopener" style="color:var(--info-text)">気象庁 天気図ページで確認 →</a></div>';}}
