// ==================== Build Content ====================
function mfc(isToday,icon,max,min,rain,note){
  var emojiMap={'ti-sun':'☀️','ti-cloud':'☁️','ti-cloud-rain':'🌧️','ti-cloud-drizzle':'🌦️','ti-cloud-storm':'⛈️','ti-snowflake':'❄️','ti-mist':'🌫️','ti-wind':'💨'};
  var em=emojiMap[icon]||'🌡️';var rainNum=parseInt(rain)||0;var barW=Math.min(100,rainNum);
  return'<div class="mfc'+(isToday?' td':'')+'"><div class="ci">'+em+'</div><div class="ct">'+max+'°</div><div class="cl">'+min+'°</div><div class="rain-bar"><div class="rain-fill" style="width:'+barW+'%"></div></div><div class="cr">'+rainNum+'%</div>'+(note?'<div class="cn">'+esc(note)+'</div>':'')+'</div>';
}
function buildChartSection(){
  var da=_activeChart==='daily';var we=_activeChart==='weekly';
  return '<div class="chart-section"><div class="stitle">'+t('temp_chart')+'</div><div class="chart-tabs"><button class="chart-tab'+(da?' active':'')+'" data-tab="daily" onclick="switchChart(this.dataset.tab)">'+t('daily_chart')+'</button><button class="chart-tab'+(we?' active':'')+'" data-tab="weekly" onclick="switchChart(this.dataset.tab)">'+t('weekly_chart')+'</button></div><div id="daily-wrap" class="chart-wrap" style="display:'+(da?'block':'none')+'"><canvas id="daily-chart"></canvas></div><div id="weekly-wrap" class="chart-wrap" style="display:'+(we?'block':'none')+'"><canvas id="weekly-chart"></canvas></div></div>'+
         '<div class="chart-section"><div class="stitle">'+t('combined_chart')+'</div><div class="chart-wrap"><canvas id="combined-chart"></canvas></div></div>'+
         '<div class="chart-section"><div class="stitle">'+t('windrose_chart')+'</div><div class="chart-wrap"><canvas id="windrose-chart" height="240"></canvas></div></div>';
}

function buildContent(loc,om,gfs,jma,owm,tmrw,aq,pollen,gw,gwf,warning){
  window._lastBuildArgs=[loc,om,gfs,jma,owm,tmrw,aq,pollen,gw,gwf,warning];
  var now=new Date();var DAYS=t('days');
  var h0=Math.floor(now.getHours()/3)*3;
  var hIdx=om.hourly.time.findIndex(function(t2){return t2.includes('T'+String(h0).padStart(2,'0')+':00');});
  var cTemp=hIdx>=0?Math.round(om.hourly.temperature_2m[hIdx]):'--';
  var cWind=hIdx>=0?Math.round(om.hourly.windspeed_10m[hIdx]):'--';
  var cHum=hIdx>=0?Math.round(om.hourly.relativehumidity_2m[hIdx]):'--';
  var cRain=hIdx>=0?Math.round(om.hourly.precipitation_probability[hIdx]):'--';
  var cCode=hIdx>=0?om.hourly.weathercode[hIdx]:0;
  var avgMax=Math.round((om.daily.temperature_2m_max[0]+gfs.daily.temperature_2m_max[0])/2);
  var avgMin=Math.round((om.daily.temperature_2m_min[0]+gfs.daily.temperature_2m_min[0])/2);

  var jmaDateMap={};var jmaMax=[],jmaMin=[],jmaRain=[],jmaCodes=[];
  if(jma&&jma[1]&&jma[1].timeSeries){
    var ts1=jma[1].timeSeries;var a0=ts1[0]&&ts1[0].areas&&ts1[0].areas[0];
    if(a0){jmaCodes=a0.weatherCodes||[];jmaRain=(a0.pops||[]).map(function(p){var v=parseInt(p);return isNaN(v)?null:v;});(ts1[0].timeDefines||[]).forEach(function(t2,i){jmaDateMap[t2.slice(0,10)]=i;});}
    var a1=ts1[1]&&ts1[1].areas&&ts1[1].areas[0];if(a1){jmaMax=a1.tempsMax||[];jmaMin=a1.tempsMin||[];}
  }

  var dates=om.daily.time.slice(0,7);
  var headHtml=dates.map(function(ds,i){var d=new Date(ds);var dayLb=i===0?t('today_lbl'):i===1?t('tomorrow_lbl'):DAYS[d.getDay()]+(getLang()==='ja'?'曜':'');var dateLb=(d.getMonth()+1)+'/'+(d.getDate());return'<div class="mfhd'+(i===0?' td':'')+'"><div class="dow">'+dayLb+'</div><div class="mdate">'+dateLb+'</div></div>';}).join('');
  var omCells=dates.map(function(ds,i){return mfc(i===0,omIcon(om.daily.weathercode[i]),Math.round(om.daily.temperature_2m_max[i]),Math.round(om.daily.temperature_2m_min[i]),Math.round(om.daily.precipitation_probability_max[i]),'');}).join('');
  var gfsCells=dates.map(function(ds,i){return mfc(i===0,omIcon(gfs.daily.weathercode?gfs.daily.weathercode[i]:0),Math.round(gfs.daily.temperature_2m_max[i]),Math.round(gfs.daily.temperature_2m_min[i]),Math.round(gfs.daily.precipitation_probability_max[i]),'');}).join('');
  var jmaCells=dates.map(function(ds,i){
    var ji=jmaDateMap.hasOwnProperty(ds)?jmaDateMap[ds]:null;
    var mx=ji!==null&&jmaMax[ji]!==undefined&&jmaMax[ji]!==''?jmaMax[ji]:'—';
    var mn=ji!==null&&jmaMin[ji]!==undefined&&jmaMin[ji]!==''?jmaMin[ji]:'—';
    var rn=ji!==null&&jmaRain[ji]!==null&&jmaRain[ji]!==undefined?jmaRain[ji]:'—';
    var wc=ji!==null&&jmaCodes[ji]?jmaCodes[ji]:null;
    var emojiMapJ={'ti-sun':'☀️','ti-cloud':'☁️','ti-cloud-rain':'🌧️','ti-cloud-drizzle':'🌦️','ti-cloud-storm':'⛈️','ti-snowflake':'❄️','ti-mist':'🌫️'};
    var ic=wc?jmaIcon(wc):'ti-cloud';var em=emojiMapJ[ic]||'🌡️';
    var rainNum2=rn!=='—'?parseInt(rn):null;var barW2=rainNum2!==null?Math.min(100,rainNum2):0;
    return'<div class="mfc'+(i===0?' td':'')+'"><div class="ci">'+em+'</div><div class="ct">'+mx+'°</div><div class="cl">'+mn+'°</div><div class="rain-bar"><div class="rain-fill" style="width:'+barW2+'%"></div></div><div class="cr">'+(rainNum2!==null?rainNum2+'%':'—')+'</div></div>';
  }).join('');

  var gwCells='';
  if(gwf&&gwf.forecastDays&&gwf.forecastDays.length>0){
    document.getElementById('chip-gw').classList.add('on');
    gwCells='<div class="mfrow"><div class="mflb" style="background:#E3F2FD;color:#0D47A1">G.Weather</div>'+dates.map(function(ds,i){
      if(!gwf.forecastDays[i])return'<div class="mfc empty"></div>';
      var fd=gwf.forecastDays[i];
      var hiTemp=fd.maxTemperature?Math.round(fd.maxTemperature.degrees):'—';var loTemp=fd.minTemperature?Math.round(fd.minTemperature.degrees):'—';
      var rainPct=fd.daytimeForecast&&fd.daytimeForecast.precipitation?Math.round(fd.daytimeForecast.precipitation.probability.percent||0):0;
      var wType=fd.daytimeForecast&&fd.daytimeForecast.weatherCondition?fd.daytimeForecast.weatherCondition.type:'';
      var gwEmojiMap={CLEAR:'☀️',MOSTLY_CLEAR:'🌤️',PARTLY_CLOUDY:'⛅',MOSTLY_CLOUDY:'🌥️',CLOUDY:'☁️',LIGHT_RAIN:'🌦️',RAIN:'🌧️',RAIN_SHOWERS:'🌧️',SHOWERS:'🌦️',THUNDERSTORM:'⛈️',SNOW:'❄️',LIGHT_SNOW:'🌨️',SLEET:'🌧️',WINDY:'💨',FOG:'🌫️',DRIZZLE:'🌦️'};
      var em2=gwEmojiMap[wType]||'🌡️';var rainNum3=parseInt(rainPct)||0;
      return'<div class="mfc'+(i===0?' td':'')+'"><div class="ci">'+em2+'</div><div class="ct">'+hiTemp+'°</div><div class="cl">'+loTemp+'°</div><div class="rain-bar"><div class="rain-fill" style="width:'+Math.min(100,rainNum3)+'%"></div></div><div class="cr">'+rainNum3+'%</div></div>';
    }).join('')+'</div>';
  }
  var owmCells='';
  if(owm&&owm.list){document.getElementById('chip-owm').classList.add('on');owmCells='<div class="mfrow"><div class="mflb t-owm">OWM</div>'+dates.map(function(ds,i){var items=owm.list.filter(function(it){return it.dt_txt.startsWith(ds);});if(!items.length)return'<div class="mfc empty"></div>';var noon=items.find(function(it){return it.dt_txt.includes('12:00:00');})||items[Math.floor(items.length/2)];return mfc(i===0,owmIcon(noon.weather[0].id),Math.round(Math.max.apply(null,items.map(function(it){return it.main.temp_max;}))),Math.round(Math.min.apply(null,items.map(function(it){return it.main.temp_min;}))),Math.round(Math.max.apply(null,items.map(function(it){return(it.pop||0)*100;}))),esc(noon.weather[0].description));}).join('')+'</div>';}
  var tmrwCells='';
  if(tmrw&&tmrw.timelines&&tmrw.timelines.daily){document.getElementById('chip-tmrw').classList.add('on');var td=tmrw.timelines.daily;tmrwCells='<div class="mfrow"><div class="mflb t-tmrw">Tomorrow</div>'+dates.map(function(ds,i){if(!td[i])return'<div class="mfc empty"></div>';var v=td[i].values;return mfc(i===0,tmrwIcon(v.weatherCodeMax||v.weatherCode||0),Math.round(v.temperatureMax),Math.round(v.temperatureMin),Math.round(v.precipitationProbabilityAvg||0),'');}).join('')+'</div>';}

  var hourlyHtml=Array.from({length:8},function(_,i){
    var h=(h0+i*3)%24;var isNowHour=(h===now.getHours()||(h<=now.getHours()&&now.getHours()<h+3));
    var idx=om.hourly.time.findIndex(function(t2){var d=new Date(t2);return d.getDate()===now.getDate()&&d.getHours()===h;});
    var temp=idx>=0?Math.round(om.hourly.temperature_2m[idx]):'--';var rain=idx>=0?Math.round(om.hourly.precipitation_probability[idx]):'--';var wcode=idx>=0?om.hourly.weathercode[idx]:0;
    return'<div class="hc'+(isNowHour?' now':'')+'"><div class="ht">'+String(h).padStart(2,'0')+(getLang()==='ja'?'時':'h')+'</div><div class="he">'+weatherEmoji(wcode)+'</div><div class="hv">'+temp+'°</div><div class="hr">'+rain+'%</div></div>';
  }).join('');

  var compareRows=om.daily.time.slice(0,5).map(function(ds,i){
    var d=new Date(ds);var lb=i===0?t('today_lbl'):i===1?t('tomorrow_lbl'):(d.getMonth()+1)+'/'+(d.getDate());
    var omR=Math.round(om.daily.precipitation_probability_max[i]);
    var ji=jmaDateMap.hasOwnProperty(ds)?jmaDateMap[ds]:null;
    var jR=ji!==null&&jmaRain[ji]!==null&&jmaRain[ji]!==undefined?jmaRain[ji]:null;
    var jMx=ji!==null&&jmaMax[ji]!==undefined&&jmaMax[ji]!==''?jmaMax[ji]:'—';
    var jMn=ji!==null&&jmaMin[ji]!==undefined&&jmaMin[ji]!==''?jmaMin[ji]:'—';
    var bar=jR!==null?Math.round((omR+jR)/2):omR;
    return'<tr><td style="font-weight:500">'+lb+'</td><td><span class="tag t-om">'+Math.round(om.daily.temperature_2m_max[i])+'°/'+Math.round(om.daily.temperature_2m_min[i])+'° '+omR+'%</span></td><td><span class="tag t-gfs">'+Math.round(gfs.daily.temperature_2m_max[i])+'°/'+Math.round(gfs.daily.temperature_2m_min[i])+'°</span></td><td><span class="tag t-jma">'+jMx+'°/'+jMn+'°'+(jR!==null?' '+jR+'%':'')+'</span></td><td><div class="barwrap"><div class="barbg"><div class="barfill" style="width:'+bar+'%"></div></div><span style="font-size:12px;color:var(--info-text);min-width:32px">'+bar+'%</span></div></td></tr>';
  }).join('');

  document.getElementById('page-title').textContent=loc.name+' '+t('app_title');
  var wlKey=Object.keys(WL).find(function(k){return parseInt(k)===cCode;})||'';
  var wlText=wlKey?WL[wlKey].split('/')[getLang()==='ja'?0:1]||'—':'—';

  var displayTemp=cTemp;var displayDesc=wlText;var displayHi=avgMax;var displayLo=avgMin;
  if(gw&&gw.temperature&&gw.temperature.degrees!==undefined){displayTemp=Math.round(gw.temperature.degrees);if(gw.weatherCondition&&gw.weatherCondition.description)displayDesc=esc(gw.weatherCondition.description.text||wlText);document.getElementById('chip-gw').classList.add('on');}
  if(gwf&&gwf.forecastDays&&gwf.forecastDays[0]){var fd0=gwf.forecastDays[0];if(fd0.maxTemperature&&fd0.maxTemperature.degrees!==undefined)displayHi=Math.round(fd0.maxTemperature.degrees);if(fd0.minTemperature&&fd0.minTemperature.degrees!==undefined)displayLo=Math.round(fd0.minTemperature.degrees);}

  var heroHtml='<div class="hero"><div class="hero-left"><div class="hero-icon">'+weatherEmoji(cCode)+'</div><div><div><span class="hero-temp">'+displayTemp+'</span><span class="hero-unit">°C</span></div><div class="hero-desc">'+displayDesc+'</div><div class="hero-loc"><i class="ti ti-map-pin" style="font-size:12px;vertical-align:-1px"></i> '+esc(loc.name)+'</div></div></div><div class="hero-right"><div class="hero-hilow">'+displayHi+'°<span>/ '+displayLo+'°</span></div><div class="hero-stat"><i class="ti ti-droplet"></i>'+t('rain_prob')+' '+cRain+'%</div><div class="hero-stat"><i class="ti ti-wind"></i>'+t('wind')+' '+cWind+'m/s</div><div class="hero-stat"><i class="ti ti-ripple"></i>'+t('humidity')+' '+cHum+'%</div></div></div>';

  document.getElementById('main-content').innerHTML=buildWarningBanner(warning)+heroHtml
    +'<div class="stitle">'+t('hourly_forecast')+'</div><div class="hourly">'+hourlyHtml+'</div>'
    +buildChartSection()
    +buildJmaDetail(jma)
    +'<div class="stitle">'+t('src_forecast')+'</div>'
    +'<div class="mf"><div class="mfrow"><div></div>'+headHtml+'</div>'
    +'<div class="mfrow"><div class="mflb t-om">Open-Meteo</div>'+omCells+'</div>'
    +'<div class="mfrow"><div class="mflb t-gfs">GFS</div>'+gfsCells+'</div>'
    +'<div class="mfrow"><div class="mflb t-jma">'+t('jma_chip')+'</div>'+jmaCells+'</div>'
    +gwCells+owmCells+tmrwCells+'</div>'
    +'<div class="stitle">'+t('compare_5')+'</div>'
    +'<div style="overflow-x:auto;margin-bottom:1.5rem"><table class="ctbl"><thead><tr><th style="width:12%">'+t('date')+'</th><th style="width:28%">Open-Meteo</th><th style="width:20%">GFS</th><th style="width:22%">'+t('jma_chip')+'</th><th style="width:18%">'+t('rain_prob')+'</th></tr></thead><tbody>'+compareRows+'</tbody></table></div>'
    +buildAqSection(aq,pollen)
    +'<div class="footer">v'+esc(APP_VERSION)+' | Data: <a href="https://open-meteo.com" target="_blank" rel="noopener">Open-Meteo</a> / <a href="https://www.jma.go.jp" target="_blank" rel="noopener">JMA</a> / <a href="https://openweathermap.org" target="_blank" rel="noopener">OWM</a> / <a href="https://www.tomorrow.io" target="_blank" rel="noopener">Tomorrow.io</a> / Map: <a href="https://www.openstreetmap.org" target="_blank" rel="noopener">OpenStreetMap</a></div>';

  document.getElementById('updated-at').textContent=t('updated')+now.toLocaleTimeString(getLang()==='ja'?'ja-JP':'en-US',{hour:'2-digit',minute:'2-digit'})+' | '+loc.name+' ('+loc.lat+', '+loc.lon+')';
  setTimeout(function(){buildCharts(om,gfs);},50);
  setTimeout(function(){resetAqSync();},100);
}

// ==================== loadAll ====================
async function loadAll(forceRefresh){
  document.getElementById('main-content').innerHTML='<div class="loading" id="loading-msg"><i class="ti ti-cloud-download" style="font-size:28px;display:block;margin-bottom:8px"></i>'+t('loading')+'</div><div id="debug-log"></div>';
  document.getElementById('chip-owm').classList.remove('on');document.getElementById('chip-tmrw').classList.remove('on');
  var locs=loadLocations();var idx=getCurrentIdx();if(idx>=locs.length)idx=0;var loc=locs[idx];
  var debugMode=location.search.indexOf('debug=1')!==-1;
  function dbg(msg){var el=document.getElementById('debug-log');if(!el)return;var line=document.createElement('div');line.style.cssText='font-size:12px;color:#333;padding:2px 8px;font-family:monospace;background:#f5f5f5;border-bottom:1px solid #ddd';line.textContent=new Date().toLocaleTimeString()+' '+msg;el.appendChild(line);if(!debugMode)el.style.display='none';}
  dbg('start loc='+loc.name+' force='+!!forceRefresh);
  if(!forceRefresh){
    var cached=loadCache(loc);
    if(cached&&cached.results&&Array.isArray(cached.results[2])){
      var age=Math.round((Date.now()-cached.ts)/60000);
      dbg('cache found, age='+age+'min');
      if(age<30){dbg('using cache');var r=cached.results;buildContent(loc,r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9]);return;}
    }else{dbg('no valid cache');}
  }
  try{
    var ok=localStorage.getItem('owm_key')||'';
    var tk=localStorage.getItem('tmrw_key')||'';
    var pk=localStorage.getItem('pollen_key')||'';
    var gwk=localStorage.getItem('gweather_key')||'';
    if(!Promise.allSettled){Promise.allSettled=function(promises){return Promise.all(promises.map(function(p){return Promise.resolve(p).then(function(v){return{status:'fulfilled',value:v};},function(e){return{status:'rejected',reason:e};});}));};}
    await fetchJmaAreas();
    dbg('fetching all APIs...');
    var isJapan=!!loc.jma;
    var settled=await Promise.allSettled([fetchOM(loc.lat,loc.lon),fetchGFS(loc.lat,loc.lon),fetchJMA(loc.jma),fetchOWM(loc.lat,loc.lon,ok),fetchTmrw(loc.lat,loc.lon,tk),fetchAirQuality(loc.lat,loc.lon),fetchPollen(loc.lat,loc.lon,pk),isJapan?Promise.resolve(null):fetchGoogleWeather(loc.lat,loc.lon,gwk),isJapan?Promise.resolve(null):fetchGoogleWeatherForecast(loc.lat,loc.lon,gwk),fetchWarning(loc.jma)]);
    var names=['OM','GFS','JMA','OWM','Tmrw','AQ','Pollen','GW-Current','GW-Forecast','Warning'];
    settled.forEach(function(s,i){dbg(names[i]+': '+(s.status==='fulfilled'?'OK':'FAIL '+(s.reason&&s.reason.message||s.reason)));});
    var results=settled.map(function(s){return s.status==='fulfilled'?s.value:null;});
    if(results[0]&&results[0].daily&&results[1]&&results[1].daily&&results[2]&&Array.isArray(results[2])){saveCache(loc,results);dbg('cache saved');}
    if(!results[0]||!results[0].daily||!results[1]||!results[1].daily){throw new Error('Required weather data (OM/GFS) unavailable');}
    dbg('buildContent start');
    buildContent(loc,results[0],results[1],results[2],results[3],results[4],results[5],results[6],results[7],results[8],results[9]);
  }catch(e){
    dbg('catch: '+e.message);
    var cached2=loadCache(loc);
    if(cached2&&cached2.results){
      var age2=Math.round((Date.now()-cached2.ts)/60000);
      var ageStr=age2<60?age2+(getLang()==='ja'?'分前':' min ago'):Math.round(age2/60)+(getLang()==='ja'?'時間前':' hr ago');
      var r2=cached2.results;
      buildContent(loc,r2[0],r2[1],r2[2],r2[3],r2[4],r2[5],r2[6],r2[7],r2[8],r2[9]);
      var banner='<div style="background:#FAEEDA;border:0.5px solid #BA7517;border-radius:var(--rm);padding:8px 12px;margin-bottom:1rem;font-size:12px;color:#633806;"><i class="ti ti-wifi-off" style="font-size:13px;vertical-align:-1px;margin-right:4px"></i>'+(getLang()==='ja'?'通信エラーのため前回のデータを表示しています（'+ageStr+'）':'Showing cached data due to network error ('+ageStr+')')+'</div>';
      document.getElementById('main-content').innerHTML=banner+document.getElementById('main-content').innerHTML;
    }else{
      document.getElementById('main-content').innerHTML='<div class="errmsg"><i class="ti ti-alert-circle"></i> '+(getLang()==='ja'?'データを取得できませんでした。通信状況を確認してください。':'Failed to load data. Please check your connection.')+'<br><small>'+esc(e.message)+'</small></div>';
    }
  }
}
