// ==================== Theme ====================
function toggleTheme(){
  var h=document.documentElement;var dark=h.getAttribute('data-theme')==='dark';
  h.setAttribute('data-theme',dark?'light':'dark');
  var btn=document.getElementById('theme-btn');
  if(btn)btn.textContent=dark?'🌙':'☀️';
  localStorage.setItem('theme',dark?'light':'dark');
  if(window._lastBuildArgs)buildContent.apply(null,window._lastBuildArgs);
}

// ==================== Utilities ====================
function esc(str){
  if(str===null||str===undefined)return'';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function fetchWithTimeout(url,msOrOptions){
  var opts={};
  var ms=8000;
  if(typeof msOrOptions==='number'){
    ms=msOrOptions;
  }else if(msOrOptions&&typeof msOrOptions==='object'){
    opts=Object.assign({}, msOrOptions);
    if(typeof opts.timeout==='number'){
      ms=opts.timeout;
      delete opts.timeout;
    }
  }
  if(typeof AbortController==='undefined')return fetch(url,opts);
  var ctrl=new AbortController();
  var timer=setTimeout(function(){ctrl.abort();},ms);
  opts.signal=ctrl.signal;
  return fetch(url,opts).then(function(r){clearTimeout(timer);return r;},function(e){clearTimeout(timer);throw e;});
}

// ==================== Location Management ====================
var DEFAULT_LOCATIONS=[
  {name:'Osaka',lat:34.6937,lon:135.5023,jma:'270000'},
  {name:'Tokyo',lat:35.6895,lon:139.6917,jma:'130000'}
];
function loadLocations(){try{var s=localStorage.getItem('locations');return s?JSON.parse(s):DEFAULT_LOCATIONS;}catch(e){return DEFAULT_LOCATIONS;}}
function saveLocations(l){localStorage.setItem('locations',JSON.stringify(l));}
function getCurrentIdx(){return parseInt(localStorage.getItem('loc_idx')||'0')||0;}
function setCurrentIdx(i){localStorage.setItem('loc_idx',String(i));}
function renderLocationBar(){
  var locs=loadLocations();var idx=getCurrentIdx();if(idx>=locs.length)idx=0;
  var html=locs.map(function(loc,i){
    var del=locs.length>1?'<span class="del" onclick="deleteLocation('+i+',event)"><i class="ti ti-x" style="font-size:11px"></i></span>':'';
    return '<div class="loc-tab'+(i===idx?' active':'')+'" onclick="switchLocation('+i+')"><i class="ti ti-map-pin" style="font-size:12px"></i>'+esc(loc.name)+del+'</div>';
  }).join('');
  html+='<button class="add-loc-btn" onclick="toggleAddForm()"><i class="ti ti-plus" style="font-size:13px;vertical-align:-1px"></i> '+t('add_loc_btn')+'</button>';
  document.getElementById('location-bar').innerHTML=html;
}
function switchLocation(i){setCurrentIdx(i);renderLocationBar();document.getElementById('add-form').style.display='none';loadAll();}
function deleteLocation(i,e){
  e.stopPropagation();var locs=loadLocations();
  if(locs.length<=1){alert(t('min_loc'));return;}
  if(!confirm('"'+locs[i].name+'"'+t('del_confirm')))return;
  locs.splice(i,1);saveLocations(locs);
  var idx=getCurrentIdx();if(idx>=locs.length)setCurrentIdx(locs.length-1);
  renderLocationBar();loadAll();
}
function toggleAddForm(){var f=document.getElementById('add-form');f.style.display=f.style.display==='none'?'block':'none';}
function setPreset(name,lat,lon,jma){
  document.getElementById('new-name').value=name;
  document.getElementById('new-lat').value=lat;
  document.getElementById('new-lon').value=lon;
  document.getElementById('new-jma').value=jma;
}
function addLocation(){
  var name=document.getElementById('new-name').value.trim();
  var lat=parseFloat(document.getElementById('new-lat').value);
  var lon=parseFloat(document.getElementById('new-lon').value);
  var jma=document.getElementById('new-jma').value.trim();
  if(!name||isNaN(lat)||isNaN(lon)){alert(t('loc_required'));return;}
  var locs=loadLocations();locs.push({name:name,lat:lat,lon:lon,jma:jma||''});saveLocations(locs);
  setCurrentIdx(locs.length-1);document.getElementById('add-form').style.display='none';
  document.getElementById('new-name').value='';document.getElementById('new-lat').value='';
  document.getElementById('new-lon').value='';document.getElementById('new-jma').value='';
  renderLocationBar();loadAll();
}
function applyBulkPaste(){
  var raw=document.getElementById('bulk-paste').value;
  var lines=raw.split('\n').map(function(l){return l.trim();}).filter(function(l){return l.length>0;});
  if(lines[0])document.getElementById('owm-key').value=lines[0];
  if(lines[1])document.getElementById('tmrw-key').value=lines[1];
  document.getElementById('bulk-paste').value='';
  document.getElementById('bulk-paste').placeholder=t('bulk_done')+' ✓';
  setTimeout(function(){document.getElementById('bulk-paste').placeholder=t('bulk_paste_ph');},2000);
}
function applyKeys(){
  var o=document.getElementById('owm-key').value.trim();
  var t2=document.getElementById('tmrw-key').value.trim();
  var p=document.getElementById('pollen-key').value.trim();
  var gw=document.getElementById('gweather-key').value.trim();
  if(o)localStorage.setItem('owm_key',o);
  if(t2)localStorage.setItem('tmrw_key',t2);
  if(p)localStorage.setItem('pollen_key',p);
  if(gw)localStorage.setItem('gweather_key',gw);
  loadAll(true);
}

// ==================== Map Search ====================
var _map=null,_marker=null,_pickedLat=null,_pickedLon=null,_pickedName='';
function toggleMapSearch(){
  var box=document.getElementById('map-search-box');
  var show=box.style.display==='none';
  box.style.display=show?'block':'none';
  if(show&&!_map)initMap();
}
function initMap(){
  var locs=loadLocations();var idx=getCurrentIdx();var loc=locs[idx]||{lat:35.6895,lon:139.6917};
  _map=L.map('map-container').setView([loc.lat,loc.lon],10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(_map);
  _map.on('click',function(e){pickLocationWithGeocode(e.latlng.lat,e.latlng.lng);});
}
function reverseGeocode(lat,lon,callback){
  var lang=getLang()==='en'?'en':'ja';
  fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat='+lat+'&lon='+lon+'&accept-language='+lang)
    .then(function(r){return r.json();})
    .then(function(data){
      var name='';
      if(data&&data.address){
        name=data.address.city||data.address.town||data.address.village||data.address.county||data.address.state||'';
        var sub=data.address.suburb||data.address.neighbourhood||data.address.quarter||'';
        if(sub&&name)name=sub+' ('+name+')';else if(sub)name=sub;
      }
      if(!name)name=data&&data.display_name?data.display_name.split(',')[0]:'';
      callback(name||'');
    }).catch(function(){callback('');});
}
function pickLocation(lat,lon,name){
  _pickedLat=lat;_pickedLon=lon;_pickedName=name;
  if(_marker)_map.removeLayer(_marker);
  _marker=L.marker([lat,lon]).addTo(_map);
  document.getElementById('map-result').textContent=t('map_selected')+(esc(name)||lat.toFixed(4)+', '+lon.toFixed(4))+' ('+lat.toFixed(4)+', '+lon.toFixed(4)+')';
  document.getElementById('apply-map-btn').style.display='inline-block';
  document.getElementById('new-lat').value=lat.toFixed(4);
  document.getElementById('new-lon').value=lon.toFixed(4);
  if(!document.getElementById('new-name').value&&name)document.getElementById('new-name').value=name;
}
function pickLocationWithGeocode(lat,lon){
  pickLocation(lat,lon,'');
  document.getElementById('map-result').textContent='地名を取得中...';
  reverseGeocode(lat,lon,function(name){
    _pickedName=name;
    document.getElementById('map-result').textContent=t('map_selected')+(esc(name)||lat.toFixed(4)+', '+lon.toFixed(4))+' ('+lat.toFixed(4)+', '+lon.toFixed(4)+')';
    if(!document.getElementById('new-name').value)document.getElementById('new-name').value=name;
  });
}
function searchPlace(){
  var q=document.getElementById('map-search-input').value.trim();if(!q)return;
  var lang=getLang()==='en'?'en':'ja';
  fetch('https://nominatim.openstreetmap.org/search?format=json&q='+encodeURIComponent(q)+'&limit=1&accept-language='+lang)
    .then(function(r){return r.json();})
    .then(function(data){
      if(data&&data[0]){var lat=parseFloat(data[0].lat),lon=parseFloat(data[0].lon);var name=data[0].display_name.split(',')[0];_map.setView([lat,lon],12);pickLocation(lat,lon,name);}
    });
}
function useCurrentLocation(){
  if(!navigator.geolocation){alert('Geolocation not supported');return;}
  navigator.geolocation.getCurrentPosition(function(pos){var lat=pos.coords.latitude,lon=pos.coords.longitude;_map.setView([lat,lon],12);pickLocationWithGeocode(lat,lon);});
}
function applyMapLocation(){
  if(_pickedLat===null)return;
  document.getElementById('new-lat').value=_pickedLat.toFixed(4);
  document.getElementById('new-lon').value=_pickedLon.toFixed(4);
  if(!document.getElementById('new-name').value)document.getElementById('new-name').value=_pickedName;
  document.getElementById('map-search-box').style.display='none';
}

// ==================== Icon Mapping ====================
var WE={0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'🌨️',75:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',95:'⛈️',96:'⛈️',99:'⛈️'};
function weatherEmoji(code){return WE[code]||'🌡️';}
var WI={0:'ti-sun',1:'ti-sun',2:'ti-cloud',3:'ti-cloud',45:'ti-mist',48:'ti-mist',51:'ti-cloud-drizzle',53:'ti-cloud-drizzle',55:'ti-cloud-drizzle',61:'ti-cloud-rain',63:'ti-cloud-rain',65:'ti-cloud-rain',71:'ti-snowflake',73:'ti-snowflake',75:'ti-snowflake',80:'ti-cloud-rain',81:'ti-cloud-rain',82:'ti-cloud-rain',95:'ti-cloud-storm',96:'ti-cloud-storm',99:'ti-cloud-storm'};
var WL={0:'快晴/Clear',1:'晴れ/Sunny',2:'薄曇り/Partly Cloudy',3:'曇り/Cloudy',45:'霧/Fog',51:'霧雨/Drizzle',61:'小雨/Light Rain',63:'雨/Rain',65:'大雨/Heavy Rain',71:'小雪/Light Snow',73:'雪/Snow',80:'にわか雨/Showers',95:'雷雨/Thunderstorm'};
var JMA_EMOJI={'100':'☀️','101':'🌤️','102':'🌦️','103':'🌦️','104':'🌨️','105':'🌨️','110':'🌤️','111':'⛅','112':'🌦️','113':'🌦️','114':'🌦️','115':'🌨️','200':'☁️','201':'🌥️','202':'🌧️','203':'🌧️','204':'🌨️','205':'🌨️','206':'🌧️','207':'🌨️','208':'⛈️','209':'🌧️','210':'🌧️','211':'🌧️','212':'🌧️','213':'🌧️','214':'🌧️','215':'🌨️','216':'🌧️','217':'🌨️','218':'🌧️','219':'🌧️','220':'🌧️','221':'🌧️','222':'🌧️','223':'🌥️','224':'🌧️','225':'🌨️','226':'🌧️','228':'🌨️','229':'🌧️','230':'🌧️','231':'🌧️','300':'🌧️','301':'🌧️','302':'🌧️','303':'🌧️','304':'🌧️','306':'⛈️','308':'⛈️','309':'🌧️','311':'🌧️','313':'🌧️','314':'🌨️','315':'🌧️','316':'🌧️','317':'🌧️','320':'🌧️','321':'🌧️','322':'🌧️','323':'🌧️','324':'🌧️','325':'🌧️','326':'🌨️','327':'🌨️','328':'🌧️','329':'🌧️','340':'🌨️','350':'🌧️','361':'🌨️','371':'🌨️','400':'❄️','401':'🌨️','402':'🌨️','403':'🌨️','405':'🌨️','406':'⛈️','407':'⛈️','409':'🌨️','411':'🌨️','413':'❄️','414':'🌨️','420':'🌨️','421':'🌨️','422':'❄️','423':'❄️','425':'❄️','426':'🌨️','427':'🌨️','450':'❄️'};
function jmaEmoji(code){return JMA_EMOJI[String(code)]||'🌡️';}
var JI={'100':'ti-sun','101':'ti-sun','102':'ti-cloud-rain','103':'ti-cloud-rain','104':'ti-snowflake','105':'ti-snowflake','110':'ti-cloud','111':'ti-cloud','112':'ti-cloud-rain','200':'ti-cloud','201':'ti-cloud','202':'ti-cloud-rain','203':'ti-cloud-rain','204':'ti-snowflake','211':'ti-cloud','212':'ti-cloud-rain','300':'ti-cloud-rain','301':'ti-cloud-rain','306':'ti-cloud-storm','308':'ti-cloud-storm','400':'ti-snowflake','401':'ti-snowflake'};
function omIcon(c){return WI[c]||'ti-cloud';}
function jmaIcon(c){return JI[String(c)]||'ti-cloud';}
function owmIcon(id){if(id>=200&&id<300)return'ti-cloud-storm';if(id>=300&&id<400)return'ti-cloud-drizzle';if(id>=500&&id<600)return'ti-cloud-rain';if(id>=600&&id<700)return'ti-snowflake';if(id>=700&&id<800)return'ti-mist';if(id===800)return'ti-sun';return'ti-cloud';}
function tmrwIcon(c){if(c===1000)return'ti-sun';if(c===1100||c===1101)return'ti-cloud';if(c===4000||c===4001||c===4200||c===4201)return'ti-cloud-rain';if(c===5000||c===5001||c===5100||c===5101)return'ti-snowflake';if(c===8000)return'ti-cloud-storm';return'ti-cloud';}
function wapiIcon(c){if(c===1000)return'ti-sun';if(c===1003||c===1006||c===1009)return'ti-cloud';if(c===1030||c===1135)return'ti-mist';if(c>=1063&&c<=1201)return'ti-cloud-rain';if(c===1087||c>=1273)return'ti-cloud-storm';return'ti-cloud';}

function windDirToArrow(text){
  var dirs=[{k:'北北東',deg:22.5},{k:'北東',deg:45},{k:'東北東',deg:67.5},{k:'東',deg:90},{k:'東南東',deg:112.5},{k:'南東',deg:135},{k:'南南東',deg:157.5},{k:'南',deg:180},{k:'南南西',deg:202.5},{k:'南西',deg:225},{k:'西南西',deg:247.5},{k:'西',deg:270},{k:'西北西',deg:292.5},{k:'北西',deg:315},{k:'北北西',deg:337.5},{k:'北',deg:0}];
  var found=null;var foundIdx=9999;
  dirs.forEach(function(d){var idx=text.indexOf(d.k);if(idx>=0&&(idx<foundIdx||(idx===foundIdx&&found&&d.k.length>found.k.length))){foundIdx=idx;found=d;}});
  if(!found)return'';
  var arrowDeg=(found.deg+180)%360;
  return'<svg width="32" height="32" viewBox="-16 -16 32 32" style="display:inline-block;vertical-align:middle"><circle cx="0" cy="0" r="14" fill="var(--info-bg)" stroke="var(--border)" stroke-width="1"/><g transform="rotate('+arrowDeg+')"><polygon points="0,-10 4,4 0,1 -4,4" fill="var(--info-text)"/></g><text x="0" y="0" text-anchor="middle" dominant-baseline="middle" font-size="7" fill="var(--text2)" transform="rotate('+(arrowDeg>90&&arrowDeg<270?180:0)+') translate(0,'+(arrowDeg>90&&arrowDeg<270?-18:18)+')">'+found.k+'</text></svg>';
}

// ==================== Data Fetching ====================
async function fetchOM(lat,lon){var r=await fetchWithTimeout('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&hourly=temperature_2m,precipitation_probability,windspeed_10m,wind_direction_10m,relativehumidity_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=Asia%2FTokyo&forecast_days=7');return r.json();}
async function fetchGFS(lat,lon){var r=await fetchWithTimeout('https://api.open-meteo.com/v1/gfs?latitude='+lat+'&longitude='+lon+'&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo&forecast_days=7');return r.json();}
async function fetchJMA(code){if(!code)return null;try{var r=await fetchWithTimeout('https://www.jma.go.jp/bosai/forecast/data/forecast/'+code+'.json');if(!r.ok)return null;return r.json();}catch(e){return null;}}
async function fetchWarning(code){
  if(!code)return null;
  var c = String(code).substring(0, 6);
  var p = c.substring(0, 2);
  var r = 'r3';
  if(p === '01') r = 'r1';
  else if(p >= '02' && p <= '07') r = 'r2';
  else if((p >= '08' && p <= '14') || p === '19' || p === '20') r = 'r3';
  else if(p >= '15' && p <= '18') r = 'r4';
  else if(p >= '21' && p <= '24') r = 'r5';
  else if(p >= '31' && p <= '35') r = 'r6';
  else if(p >= '40' && p <= '46') r = 'r7';
  else if((p >= '25' && p <= '30') || (p >= '36' && p <= '39') || p === '47') r = 'r8';
  var roots = ['r8'];
  if(r !== 'r8') roots.push(r);
  for(var i=0;i<roots.length;i++){
    var url = 'https://www.jma.go.jp/bosai/warning/data/' + roots[i] + '/' + c + '.json?t=' + Date.now();
    try {
      var res = await fetchWithTimeout(url, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch (e) { console.warn('JMA Warning fetch failed:', e); }
  }
  return null;
}
async function fetchOWM(lat,lon,key){if(!key)return null;try{var r=await fetchWithTimeout('https://api.openweathermap.org/data/2.5/forecast?lat='+lat+'&lon='+lon+'&appid='+key+'&units=metric&lang=ja&cnt=40');if(!r.ok)return null;return r.json();}catch(e){return null;}}
async function fetchTmrw(lat,lon,key){if(!key)return null;try{var r=await fetchWithTimeout('https://api.tomorrow.io/v4/weather/forecast?location='+lat+','+lon+'&apikey='+key+'&units=metric&timesteps=1d');if(!r.ok)return null;return r.json();}catch(e){return null;}}
async function fetchGoogleWeather(lat,lon,key){if(!key)return null;try{var r=await fetchWithTimeout('https://weather.googleapis.com/v1/currentConditions:lookup?key='+key+'&location.latitude='+lat+'&location.longitude='+lon+'&unitsSystem=METRIC');if(!r.ok)return null;return r.json();}catch(e){return null;}}
async function fetchGoogleWeatherForecast(lat,lon,key){if(!key)return null;try{var r=await fetchWithTimeout('https://weather.googleapis.com/v1/forecast/days:lookup?key='+key+'&location.latitude='+lat+'&location.longitude='+lon+'&days=10&unitsSystem=METRIC');if(!r.ok)return null;return r.json();}catch(e){return null;}}
async function fetchAirQuality(lat,lon){try{var r=await fetchWithTimeout('https://air-quality-api.open-meteo.com/v1/air-quality?latitude='+lat+'&longitude='+lon+'&hourly=pm2_5,dust,european_aqi&timezone=Asia%2FTokyo&forecast_days=1');if(!r.ok)return null;return r.json();}catch(e){return null;}}
async function fetchPollen(lat,lon,key){if(!key)return null;try{var r=await fetchWithTimeout('https://pollen.googleapis.com/v1/forecast:lookup?key='+key+'&location.longitude='+lon+'&location.latitude='+lat+'&days=5&languageCode='+(getLang()==='en'?'en':'ja'));if(!r.ok)return null;return r.json();}catch(e){return null;}}

var _jmaAreas=null;
async function fetchJmaAreas(){if(_jmaAreas)return _jmaAreas;try{var r=await fetchWithTimeout('https://www.jma.go.jp/bosai/common/const/area.json');if(!r.ok)return null;_jmaAreas=await r.json();return _jmaAreas;}catch(e){return null;}}
