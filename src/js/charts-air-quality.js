// ==================== Charts ====================
var _charts={};
function destroyCharts(){Object.values(_charts).forEach(function(c){c.destroy();});_charts={};}
function getChartColors(){var dark=document.documentElement.getAttribute('data-theme')==='dark';return{grid:dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)',text:dark?'#9a9a96':'#6b6b67',bg:dark?'#242422':'#ffffff'};}
function buildCharts(om,gfs){
  destroyCharts();var cc=getChartColors();
  var baseOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:cc.text,font:{size:11}}},tooltip:{mode:'index',intersect:false}},scales:{x:{grid:{color:cc.grid},ticks:{color:cc.text,font:{size:10}}},y:{grid:{color:cc.grid},ticks:{color:cc.text,font:{size:10}}}}};
  var now=new Date();var hourLabels=[],omTemp=[];
  for(var i=0;i<24;i++){var idx=om.hourly.time.findIndex(function(t2){var d=new Date(t2);return d.getDate()===now.getDate()&&d.getHours()===i;});if(idx>=0){hourLabels.push(i+'時');omTemp.push(Math.round(om.hourly.temperature_2m[idx]));}}
  var nowHour=now.getHours();var nowIdx=hourLabels.indexOf(nowHour+'時');if(nowIdx<0)nowIdx=hourLabels.findIndex(function(l){return parseInt(l)<=nowHour;});
  var dCtx=document.getElementById('daily-chart');
  if(dCtx){
    var pointBg=omTemp.map(function(_,i){return i===nowIdx?'#E05C2A':'#378ADD';});var pointR=omTemp.map(function(_,i){return i===nowIdx?7:3;});
    _charts.daily=new Chart(dCtx,{type:'line',data:{labels:hourLabels,datasets:[{label:'Open-Meteo',data:omTemp,borderColor:'#378ADD',backgroundColor:'rgba(55,138,221,0.1)',tension:0.4,pointRadius:pointR,pointBackgroundColor:pointBg,fill:true}]},options:Object.assign({},baseOpts,{plugins:Object.assign({},baseOpts.plugins,{tooltip:{mode:'index',intersect:false,callbacks:{title:function(items){return items[0].label+(getLang()==='ja'?'時':'h');},label:function(item){return item.dataset.label+': '+item.raw+'°C';}}}}),scales:Object.assign({},baseOpts.scales,{y:{grid:{color:cc.grid},ticks:{color:cc.text,font:{size:10},callback:function(v){return v+'°';}}}})})});
  }
  var DAYS=t('days');
  var weekLabels=om.daily.time.slice(0,7).map(function(ds,i){var d=new Date(ds);return i===0?t('today_lbl'):i===1?t('tomorrow_lbl'):DAYS[d.getDay()];});
  var omMax=om.daily.temperature_2m_max.slice(0,7).map(Math.round);var omMin=om.daily.temperature_2m_min.slice(0,7).map(Math.round);
  var gfsMax=gfs.daily.temperature_2m_max.slice(0,7).map(Math.round);var gfsMin=gfs.daily.temperature_2m_min.slice(0,7).map(Math.round);
  var wCtx=document.getElementById('weekly-chart');
  if(wCtx){_charts.weekly=new Chart(wCtx,{type:'line',data:{labels:weekLabels,datasets:[{label:'OM '+t('max_temp'),data:omMax,borderColor:'#E05C2A',backgroundColor:'rgba(224,92,42,0.12)',tension:0.4,pointRadius:5,pointBackgroundColor:'#E05C2A',fill:'+1'},{label:'OM '+t('min_temp'),data:omMin,borderColor:'#378ADD',backgroundColor:'rgba(55,138,221,0.12)',tension:0.4,pointRadius:5,pointBackgroundColor:'#378ADD',fill:false},{label:'GFS '+t('max_temp'),data:gfsMax,borderColor:'#E05C2A',borderDash:[4,3],tension:0.4,pointRadius:3,fill:false,borderWidth:1.5},{label:'GFS '+t('min_temp'),data:gfsMin,borderColor:'#378ADD',borderDash:[4,3],tension:0.4,pointRadius:3,fill:false,borderWidth:1.5}]},options:Object.assign({},baseOpts,{plugins:Object.assign({},baseOpts.plugins,{tooltip:{mode:'index',intersect:false,callbacks:{label:function(item){return item.dataset.label+': '+item.raw+'°';}}}}),scales:Object.assign({},baseOpts.scales,{y:Object.assign({},baseOpts.scales.y,{ticks:Object.assign({},baseOpts.scales.y.ticks,{callback:function(v){return v+'°';}})})})})}); }
  // build combined chart: temperature, humidity, wind speed (shared x: hourLabels)
  var omHumidity=[];var omWindspeed=[];var omWinddirection=[];
  for(var i=0;i<24;i++){var idx=om.hourly.time.findIndex(function(t2){var d=new Date(t2);return d.getDate()===now.getDate()&&d.getHours()===i;});if(idx>=0){omHumidity.push(Math.round(om.hourly.relativehumidity_2m[idx]));omWindspeed.push(Math.round(om.hourly.windspeed_10m[idx]*10)/10);omWinddirection.push(om.hourly.wind_direction_10m?Math.round(om.hourly.wind_direction_10m[idx]):null);} }
  var cCtx=document.getElementById('combined-chart');
  if(cCtx){
    var tempPointBg=omTemp.map(function(_,i){return i===nowIdx?'#E05C2A':'#E05C2A';});var tempPointR=omTemp.map(function(_,i){return i===nowIdx?6:3;});
    var humPointBg=omHumidity.map(function(_,i){return i===nowIdx?'#378ADD':'#378ADD';});var humPointR=omHumidity.map(function(_,i){return i===nowIdx?6:3;});
    var wsPointBg=omWindspeed.map(function(_,i){return i===nowIdx?'#22AA22':'#22AA22';});var wsPointR=omWindspeed.map(function(_,i){return i===nowIdx?6:3;});
    var nowPlugin={id:'nowLine',afterDraw:function(chart){if(typeof nowIdx!=='number'||nowIdx<0)return;var ctx=chart.ctx;var xScale=chart.scales.x;var x=xScale.getPixelForValue(nowIdx);ctx.save();ctx.beginPath();ctx.moveTo(x,chart.chartArea.top);ctx.lineTo(x,chart.chartArea.bottom);ctx.lineWidth=1;ctx.strokeStyle='rgba(224,92,42,0.9)';ctx.setLineDash([4,4]);ctx.stroke();ctx.restore();}};
    var combinedOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:cc.text,font:{size:11}}},tooltip:{mode:'index',intersect:false,callbacks:{title:function(items){return items[0].label+(getLang()==='ja'?'時':'h');}}}},scales:{x:{grid:{color:cc.grid},ticks:{color:cc.text,font:{size:10}}},y_temp:{position:'left',grid:{color:cc.grid},ticks:{color:cc.text,callback:function(v){return v+'°';}}},y_hum:{position:'right',grid:{drawOnChartArea:false,color:cc.grid},ticks:{color:cc.text,callback:function(v){return v+'%';}},min:0,max:100},y_ws:{position:'right',grid:{drawOnChartArea:false,color:cc.grid},ticks:{color:cc.text,callback:function(v){return v+' m/s';}}}}}; 
    _charts.combined=new Chart(cCtx,{type:'line',data:{labels:hourLabels,datasets:[{label:t('temp_chart'),data:omTemp,yAxisID:'y_temp',borderColor:'#E05C2A',backgroundColor:'rgba(224,92,42,0.08)',tension:0.3,pointRadius:tempPointR,pointBackgroundColor:tempPointBg,fill:false},{label:t('humidity_chart'),data:omHumidity,yAxisID:'y_hum',borderColor:'#378ADD',backgroundColor:'rgba(55,138,221,0.06)',tension:0.3,pointRadius:humPointR,pointBackgroundColor:humPointBg,fill:false},{label:t('windspeed_chart'),data:omWindspeed,yAxisID:'y_ws',borderColor:'#22AA22',backgroundColor:'rgba(34,170,34,0.06)',tension:0.3,pointRadius:wsPointR,pointBackgroundColor:wsPointBg,fill:false}]},options:combinedOpts,plugins:[nowPlugin]});
  }
  // build windrose as per-hour polarArea: labels=hours, value=wind speed, color by direction; tooltip shows direction
  var wrLabels=hourLabels.slice();var wrData=omWindspeed.slice();var wrDirs=omWinddirection.slice();
  var wrCtx=document.getElementById('windrose-chart');
  if(wrCtx){
    var wrColors=[];
    for(var i=0;i<wrDirs.length;i++){
      if(i===nowIdx) wrColors.push('#E05C2A');
      else if(wrDirs[i]===null) wrColors.push('rgba(200,200,200,0.25)');
      else wrColors.push('hsl('+wrDirs[i]+',70%,50%)');
    }
    _charts.windrose=new Chart(wrCtx,{type:'polarArea',data:{labels:wrLabels,datasets:[{data:wrData,backgroundColor:wrColors}]},options:{responsive:true,plugins:{legend:{labels:{color:cc.text}}},scales:{r:{ticks:{color:cc.text,backdropColor:'transparent'},grid:{color:cc.grid}}}}});
  }
}
var _activeChart='daily';
function switchChart(tab){_activeChart=tab;document.getElementById('daily-wrap').style.display=tab==='daily'?'block':'none';document.getElementById('weekly-wrap').style.display=tab==='weekly'?'block':'none';document.querySelectorAll('.chart-tab').forEach(function(el){el.classList.toggle('active',el.getAttribute('data-tab')===tab);});}

// ==================== Air Quality ====================
function aqiLevel(aqi){if(aqi===null||aqi===undefined)return{cls:'ql-na',lbl:'—'};if(aqi<=20)return{cls:'ql-good',lbl:t('ql_good')};if(aqi<=40)return{cls:'ql-fair',lbl:t('ql_fair')};if(aqi<=60)return{cls:'ql-mod',lbl:t('ql_mod')};if(aqi<=80)return{cls:'ql-poor',lbl:t('ql_poor')};return{cls:'ql-vpoor',lbl:t('ql_vpoor')};}
function pm25Level(v){if(v===null||v===undefined)return{cls:'ql-na',lbl:'—'};if(v<=10)return{cls:'ql-good',lbl:t('ql_good')};if(v<=20)return{cls:'ql-fair',lbl:t('ql_fair')};if(v<=25)return{cls:'ql-mod',lbl:t('ql_mod')};if(v<=50)return{cls:'ql-poor',lbl:t('ql_poor')};return{cls:'ql-vpoor',lbl:t('ql_vpoor')};}
function dustLevel(v){if(v===null||v===undefined)return{cls:'ql-na',lbl:'—'};if(v<=50)return{cls:'ql-good',lbl:t('ql_good')};if(v<=200)return{cls:'ql-fair',lbl:t('ql_fair')};if(v<=500)return{cls:'ql-mod',lbl:t('ql_mod')};if(v<=1000)return{cls:'ql-poor',lbl:t('ql_poor')};return{cls:'ql-vpoor',lbl:t('ql_vpoor')};}
function pollenIndexClass(index){if(index<=0)return{cls:'ql-good',lbl:t('ql_good')};if(index<=1)return{cls:'ql-fair',lbl:t('ql_fair')};if(index<=2)return{cls:'ql-mod',lbl:t('ql_mod')};if(index<=3)return{cls:'ql-poor',lbl:t('ql_poor')};return{cls:'ql-vpoor',lbl:t('ql_vpoor')};}
function buildAqSection(aq,pollen){
  var now=new Date();var h=now.getHours();
  var pm25Val=null,dustVal=null,aqiVal=null;
  if(aq&&aq.hourly){var idx=aq.hourly.time.findIndex(function(t2){return t2.includes('T'+String(h).padStart(2,'0')+':00');});if(idx<0)idx=0;pm25Val=aq.hourly.pm2_5[idx]!==null?Math.round(aq.hourly.pm2_5[idx]*10)/10:null;dustVal=aq.hourly.dust[idx]!==null?Math.round(aq.hourly.dust[idx]*10)/10:null;aqiVal=aq.hourly.european_aqi[idx]!==null?Math.round(aq.hourly.european_aqi[idx]):null;}
  var pm25L=pm25Level(pm25Val);var dustL=dustLevel(dustVal);var aqiL=aqiLevel(aqiVal);
  var aqHtml='<div class="aq-grid"><div class="aq-card"><div class="lb"><i class="ti ti-wind" style="font-size:12px;vertical-align:-1px;margin-right:3px"></i>'+t('aqi')+' (EU)</div><div class="vl">'+(aqiVal!==null?aqiVal:'—')+'</div><div class="ql '+aqiL.cls+'">'+aqiL.lbl+'</div></div><div class="aq-card"><div class="lb"><i class="ti ti-circle-dotted" style="font-size:12px;vertical-align:-1px;margin-right:3px"></i>'+t('pm25')+' (μg/m³)</div><div class="vl">'+(pm25Val!==null?pm25Val:'—')+'</div><div class="ql '+pm25L.cls+'">'+pm25L.lbl+'</div></div><div class="aq-card"><div class="lb"><i class="ti ti-wind" style="font-size:12px;vertical-align:-1px;margin-right:3px"></i>'+t('dust')+' (μg/m³)</div><div class="vl">'+(dustVal!==null?dustVal:'—')+'</div><div class="ql '+dustL.cls+'">'+dustL.lbl+'</div></div></div>';
  var pollenHtml='';
  if(pollen&&pollen.dailyInfo&&pollen.dailyInfo.length>0){
    var today=pollen.dailyInfo[0];
    var nameMapType={ja:{TREE:'樹木花粉',GRASS:'草花粉',WEED:'雑草花粉'},en:{TREE:'Tree Pollen',GRASS:'Grass Pollen',WEED:'Weed Pollen'}};
    var nameMapPlant={ja:{JAPANESE_CEDAR:'スギ',JAPANESE_CYPRESS:'ヒノキ',ALDER:'ハンノキ',BIRCH:'シラカバ',GRASS:'イネ科',MUGWORT:'ヨモギ',RAGWEED:'ブタクサ',OAK:'カシ'},en:{JAPANESE_CEDAR:'Japanese Cedar',JAPANESE_CYPRESS:'Japanese Cypress',ALDER:'Alder',BIRCH:'Birch',GRASS:'Grass',MUGWORT:'Mugwort',RAGWEED:'Ragweed',OAK:'Oak'}};
    var plants=today.plantsInfo||[];var types=today.pollenTypeInfo||[];var pollenCards='';
    if(plants.length>0){
      var priority=['JAPANESE_CEDAR','JAPANESE_CYPRESS','ALDER','BIRCH','GRASS','MUGWORT','RAGWEED','OAK'];
      var sorted=plants.slice().sort(function(a,b){var ai=priority.indexOf(a.code);var bi=priority.indexOf(b.code);if(ai===-1)ai=99;if(bi===-1)bi=99;return ai-bi;});
      pollenCards=sorted.slice(0,8).map(function(p){var idxVal=(p.indexInfo&&p.indexInfo.value!==undefined)?p.indexInfo.value:null;var cat=esc(p.indexInfo&&p.indexInfo.category?p.indexInfo.category:'');var lvl=idxVal!==null?pollenIndexClass(idxVal):{cls:'ql-na',lbl:t('pollen_na')};var name=esc((nameMapPlant[getLang()]&&nameMapPlant[getLang()][p.code])||p.displayName||p.code);var inSeason=p.inSeason===false?' style="opacity:0.5"':'';var seasonNote=p.inSeason===false?'<div style="font-size:10px;color:var(--text2)">'+(getLang()==='ja'?'シーズン外':'Off-season')+'</div>':'';return'<div class="pollen-card"'+inSeason+'><div class="pn">'+name+'</div><div class="pi">'+(idxVal!==null?idxVal:'—')+'</div><div class="pc '+lvl.cls+'">'+(cat||lvl.lbl)+'</div>'+seasonNote+'</div>';}).join('');
    }else if(types.length>0){
      pollenCards=types.map(function(p){var idxVal=(p.indexInfo&&p.indexInfo.value!==undefined)?p.indexInfo.value:null;var cat=esc(p.indexInfo&&p.indexInfo.category?p.indexInfo.category:'');var inSeason=p.inSeason===false?' style="opacity:0.5"':'';var lvl=idxVal!==null?pollenIndexClass(idxVal):{cls:'ql-na',lbl:t('pollen_na')};var name=esc((nameMapType[getLang()]&&nameMapType[getLang()][p.code])||p.displayName||p.code);var seasonNote=p.inSeason===false?'<div style="font-size:10px;color:var(--text2)">'+(getLang()==='ja'?'シーズン外':'Off-season')+'</div>':'';return'<div class="pollen-card"'+inSeason+'><div class="pn">'+name+'</div><div class="pi">'+(idxVal!==null?idxVal:'—')+'</div><div class="pc '+lvl.cls+'">'+(cat||lvl.lbl)+'</div>'+seasonNote+'</div>';}).join('');
    }
    if(pollenCards){pollenHtml='<div class="stitle" style="margin-top:12px;margin-bottom:6px">'+t('pollen_title')+'</div><div class="pollen-grid">'+pollenCards+'</div>';}
  }
  return'<div class="aq-panel"><div class="stitle">'+t('aq_title')+'</div>'+aqHtml+pollenHtml+'<div style="font-size:11px;color:var(--text2);margin-top:10px">Data: <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noopener">Open-Meteo Air Quality</a>'+(pollen?' / <a href="https://developers.google.com/maps/documentation/pollen" target="_blank" rel="noopener">Google Pollen API</a>':'')+'</div></div>';
}

// ==================== Cache ====================
function cacheKey(loc){return'cache_'+loc.lat+'_'+loc.lon;}
function saveCache(loc,results){try{var data={ts:Date.now(),results:results};localStorage.setItem(cacheKey(loc),JSON.stringify(data));}catch(e){}}
function loadCache(loc){try{var raw=localStorage.getItem(cacheKey(loc));if(!raw)return null;return JSON.parse(raw);}catch(e){return null;}}
