// ==================== Warning Banner ====================
var WARN_CODES={'02':{name:'暴風雪警報',level:2},'03':{name:'大雨警報',level:2},'04':{name:'洪水警報',level:2},'05':{name:'暴風警報',level:2},'06':{name:'大雪警報',level:2},'07':{name:'波浪警報',level:2},'08':{name:'高潮警報',level:2},'10':{name:'大雨注意報',level:1},'12':{name:'大雪注意報',level:1},'13':{name:'風雪注意報',level:1},'14':{name:'雷注意報',level:1},'15':{name:'強風注意報',level:1},'16':{name:'波浪注意報',level:1},'17':{name:'融雪注意報',level:1},'18':{name:'洪水注意報',level:1},'19':{name:'高潮注意報',level:1},'20':{name:'濃霧注意報',level:1},'21':{name:'乾燥注意報',level:1},'22':{name:'なだれ注意報',level:1},'23':{name:'低温注意報',level:1},'24':{name:'霜注意報',level:1},'25':{name:'着氷注意報',level:1},'26':{name:'着雪注意報',level:1},'32':{name:'暴風雪特別警報',level:3},'33':{name:'大雨特別警報',level:3},'35':{name:'暴風特別警報',level:3},'36':{name:'大雪特別警報',level:3},'37':{name:'波浪特別警報',level:3},'38':{name:'高潮特別警報',level:3},'39':{name:'顕著な大雨に関する情報',level:3},'111':{name:'大雨警報（土砂災害）',level:2},'112':{name:'大雨警報（浸水害）',level:2},'113':{name:'大雨警報（土砂災害・浸水害）',level:2},'114':{name:'大雨注意報',level:1},'115':{name:'洪水注意報',level:1},'116':{name:'大雨警報（土砂）・洪水警報',level:2},'117':{name:'大雨警報（浸水）・洪水警報',level:2},'118':{name:'大雨警報（土砂・浸水）・洪水警報',level:2},'119':{name:'大雨注意報・洪水注意報',level:1},'131':{name:'大雨・洪水・波浪警報',level:2},'133':{name:'大雨・洪水警報',level:2},'134':{name:'大雨・波浪警報',level:2},'135':{name:'洪水・波浪警報',level:2}};
function normalizeWarnCode(code){var c=String(code);return c.length===1?'0'+c:c;}
function getWarnLevel(code){var c=normalizeWarnCode(code);return WARN_CODES[c]?WARN_CODES[c].level:1;}
function getWarnName(code){var c=normalizeWarnCode(code);return WARN_CODES[c]?WARN_CODES[c].name:'警報・注意報('+c+')';}
function isActiveWarnStatus(status){
  if(!status)return true;
  var s=String(status);
  return s.indexOf('解除')===-1 && s.indexOf('なし')===-1 && s.toLowerCase()!=='none';
}
function getWarnLevelFromKind(kind){
  var code=kind&&String(kind.code||kind.kindCode||'')||'';
  var name=kind&&String(kind.name||kind.kindName||'')||'';
  var known=code&&WARN_CODES[normalizeWarnCode(code)]?WARN_CODES[normalizeWarnCode(code)]:null;
  var levelName=name||(known&&known.name)||'';
  if(levelName.indexOf('特別警報')>=0 || levelName.toLowerCase().indexOf('emergency')>=0)return 4;
  if(levelName.indexOf('危険警報')>=0 || levelName.toLowerCase().indexOf('danger')>=0)return 3;
  if(known)return known.level;
  if(levelName.indexOf('警報')>=0 || levelName.toLowerCase().indexOf('warning')>=0)return 2;
  return 1;
}
function getWarnNameFromKind(kind){
  var code=kind&&String(kind.code||kind.kindCode||'')||'';
  var name=kind&&String(kind.name||kind.kindName||'')||'';
  return name||(code?getWarnName(code):getWarnName(''));
}
function getAreaName(code){
  var c=String(code);
  if(!_jmaAreas) return c;
  var pools=['offices','class10s','class15s','class20s'];
  for(var i=0;i<pools.length;i++){
    var p=pools[i]; if(_jmaAreas[p]&&_jmaAreas[p][c]) return _jmaAreas[p][c].name;
  }
  return c;
}
function getWarningAreaName(area){
  var src=(area&&area.area)?area.area:area;
  if(!src)return '';
  if(src.name&&!/^\d+$/.test(src.name))return src.name;
  if(src.code)return getAreaName(src.code);
  return '';
}
function collectWarningItems(warning){
  var items=[];
  if(Array.isArray(warning)){
    warning.forEach(function(report){
      var w=report&&report.warning;
      if(!w)return;
      ['class20Items','class15Items','class10Items','officeItems'].forEach(function(key){
        (w[key]||[]).forEach(function(area){
          var aName=getWarningAreaName(area);
          (area.kinds||area.warnings||[]).forEach(function(kind){
            if(!isActiveWarnStatus(kind.status))return;
            items.push({
              areaName:aName,
              warnCode:String(kind.code||kind.kindCode||''),
              warnName:getWarnNameFromKind(kind),
              level:getWarnLevelFromKind(kind),
              type:key
            });
          });
        });
      });
    });
    return items;
  }
  if(!warning||!warning.areaTypes)return items;
  var globalCodes = {};
  (warning.areaTypes||[]).forEach(function(at){
    var isGlobal = (at.code === 'offices' || at.code === 'class10s');
    (at.areas||[]).forEach(function(area){
      var aName=getWarningAreaName(area);
      (area.warnings||[]).forEach(function(w){
        var wCode=String(w.code||w.kindCode||'');
        if(wCode && isActiveWarnStatus(w.status)){
          if(isGlobal) globalCodes[wCode] = true;
          items.push({areaName:aName, warnCode:wCode, warnName:getWarnNameFromKind(w), level:getWarnLevelFromKind(w), type:at.code});
        }
      });
    });
  });
  return items.filter(function(it){ return (it.type === 'offices' || it.type === 'class10s') || !globalCodes[it.warnCode]; });
}
function getWarningMeta(warning){
  if(Array.isArray(warning)){
    for(var i=0;i<warning.length;i++){
      if(warning[i])return warning[i];
    }
    return {};
  }
  return warning||{};
}
function buildWarningBanner(warning){
  if(!warning)return'';
  var items=[];
  var seen={};
  try{
    var globalCodes = {};
    if(Array.isArray(warning)){
      var normalized = collectWarningItems(warning);
      normalized.forEach(function(it){
        var k = it.areaName + '_' + (it.warnCode||it.warnName);
        if(!seen[k]){ items.push(it); seen[k] = true; }
      });
      throw new Error('normalized');
    }
    // offices(都道府県)およびclass10s(一次細分区域)から、広域な警告を抽出
    (warning.areaTypes||[]).forEach(function(at){
      var isGlobal = (at.code === 'offices' || at.code === 'class10s');
      (at.areas||[]).forEach(function(area){
        var aName=getWarningAreaName(area);
        (area.warnings||[]).forEach(function(w){
          var wCode=String(w.code||w.kindCode||'');
          var status=String(w.status||'');
          if(wCode && (status === '発表' || status === '継続')){
            if(isGlobal) globalCodes[wCode] = true;
            items.push({areaName:aName, warnCode:wCode, level:getWarnLevel(wCode), type:at.code});
          }
        });
      });
    });
    // 広域で出ているものを優先し、市町村レベルの重複をフィルタリング
    var filtered = items.filter(function(it){ return (it.type === 'offices' || it.type === 'class10s') || !globalCodes[it.warnCode]; });
    var deduped = [];
    filtered.forEach(function(it){
      var k = it.areaName + '_' + it.warnCode;
      if(!seen[k]){ deduped.push(it); seen[k] = true; }
    });
    items = deduped;
  }catch(e){}
  if(items.length===0) return '<div id="warning-banner" style="background:var(--bg2);border:0.5px solid var(--border);border-radius:var(--rm);padding:10px 14px;margin-bottom:1rem;color:var(--text2);font-size:13px;"><i class="ti ti-info-circle" style="vertical-align:-1px;margin-right:4px"></i>' + t('warn_none') + '</div>';

  var meta=getWarningMeta(warning);
  var pubDate = meta.reportDatetime ? new Date(meta.reportDatetime) : new Date();
  var pubTimeStr = pubDate.toLocaleString(getLang()==='ja'?'ja-JP':'en-US', {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
  var office = meta.publishingOffice ? ' (' + meta.publishingOffice + ')' : '';
  var timeInfo = '<span style="font-size:11px;font-weight:400;opacity:0.8;margin-left:8px">' + pubTimeStr + (getLang() === 'ja' ? '発表' : ' Announced') + office + '</span>';

  var maxLevel=0;items.forEach(function(it){if(it.level>maxLevel)maxLevel=it.level;});
  var isSpecial=maxLevel>=4;var isDanger=maxLevel>=3;var isWarning=maxLevel>=2;
  var bg=isSpecial?'#6A0DAD':isDanger?'#8E1B1B':isWarning?'#C0392B':'#F5C400';
  var border=isSpecial?'#4A0080':isDanger?'#641313':isWarning?'#922B21':'#C9A000';
  var textColor=isSpecial?'#fff':isWarning?'#fff':'#3D2E00';
  var icon=isSpecial?'🟣':isWarning?'🔴':'🟡';
  var labelKey=isSpecial?'warn_special':isDanger?'warn_danger':isWarning?'warn_warning':'warn_advisory';
  var levelBg={4:'rgba(255,255,255,0.25)',3:'rgba(255,255,255,0.25)',2:'rgba(255,255,255,0.2)',1:'rgba(0,0,0,0.1)'};
  var levelBd={4:'rgba(255,255,255,0.5)',3:'rgba(255,255,255,0.5)',2:'rgba(255,255,255,0.4)',1:'rgba(0,0,0,0.25)'};
  var areaMap={};
  items.forEach(function(it){var aName=it.areaName;if(!areaMap[aName])areaMap[aName]=[];areaMap[aName].push({kind:it.warnName||getWarnName(it.warnCode),level:it.level});});
  var rows=Object.keys(areaMap).map(function(area){
    var badges=areaMap[area].map(function(k){return'<span style="display:inline-block;background:'+levelBg[k.level]+';border:1px solid '+levelBd[k.level]+';border-radius:3px;padding:1px 7px;margin:2px 2px;font-size:12px;white-space:nowrap">'+esc(k.kind)+'</span>';}).join('');
    return'<span style="font-weight:700;margin-right:4px">'+esc(area)+'</span>'+badges;
  }).join('<span style="margin:0 8px;opacity:0.4">|</span>');
  return'<div id="warning-banner" style="background:'+bg+';border:0.5px solid '+border+';border-radius:var(--rm);padding:10px 14px;margin-bottom:1rem;color:'+textColor+';line-height:1.8;"><div style="font-size:13px;font-weight:700;margin-bottom:4px">'+icon+' '+t(labelKey)+timeInfo+'</div><div style="font-size:13px">'+rows+'</div></div>';
}
function someKeys(obj){var res=[];for(var k in obj)if(obj.hasOwnProperty(k))res.push(k);return res;}

// ==================== JMA Detail ====================
function buildJmaDetail(jma){
  if(!jma)return'';
  try{
    var ts0=jma[0].timeSeries;var ts1=jma[1]&&jma[1].timeSeries;
    var area0=ts0[0]&&ts0[0].areas&&ts0[0].areas[0];
    var weatherText=esc(area0&&area0.weathers&&area0.weathers[0]||'');
    var windText=esc(area0&&area0.winds&&area0.winds[0]||'');
    var waveText=esc(area0&&area0.waves&&area0.waves[0]||'');
    var tempArea=ts0[2]&&ts0[2].areas&&ts0[2].areas[0];
    var temps=tempArea&&tempArea.temps||[];
    var tempMin=temps[2]||'—';var tempMax=temps[3]||'—';
    var popArea=ts0[1]&&ts0[1].areas&&ts0[1].areas[0];
    var pops=popArea&&popArea.pops||[];
    var popTimes=ts0[1]&&ts0[1].timeDefines||[];
    var popHtml='';
    if(pops.length){
      popHtml='<div class="stitle" style="margin-top:12px;margin-bottom:6px">'+t('pop_6h')+'</div><div class="jma-pop-row">';
      for(var pi=0;pi<Math.min(pops.length,6);pi++){
        var pt=popTimes[pi]?new Date(popTimes[pi]):null;
        var ptStr=pt?pt.getHours()+(getLang()==='ja'?'時':'h'):'—';
        var ptDate=pt?(pt.getMonth()+1)+'/'+(pt.getDate()):'';
        var popVal=pops[pi]!==''&&pops[pi]!==undefined?parseInt(pops[pi]):null;
        var barW=popVal!==null?Math.min(100,popVal):0;
        popHtml+='<div class="jma-pop-cell"><div class="pt">'+ptDate+'<br>'+ptStr+'</div><div class="pv">'+(popVal!==null?popVal+'%':'—')+'</div><div class="pb"><div class="pbf" style="width:'+barW+'%"></div></div></div>';
      }
      popHtml+='</div>';
    }
    var week7Html='';
    if(ts1&&ts1[0]&&ts1[0].areas){
      var wa=ts1[0].areas[0];var wCodes=wa.weatherCodes||[];var wPops=wa.pops||[];var wRels=wa.reliabilities||[];var wTimes=ts1[0].timeDefines||[];
      var tempA=ts1[1]&&ts1[1].areas&&ts1[1].areas[0];var tMax=tempA&&tempA.tempsMax||[];var tMin=tempA&&tempA.tempsMin||[];
      var DAYS=t('days');var nowD=new Date();var tomorrowD=new Date(nowD);tomorrowD.setDate(nowD.getDate()+1);
      week7Html='<div class="stitle" style="margin-top:12px;margin-bottom:8px">'+t('week7')+'</div><div class="jma-7cards">';
      wTimes.forEach(function(tm,i){
        var d=new Date(tm);var isToday=d.toDateString()===nowD.toDateString();var isTmrw=d.toDateString()===tomorrowD.toDateString();
        var dayLb=isToday?t('today_lbl'):isTmrw?t('tomorrow_lbl'):DAYS[d.getDay()]+(getLang()==='ja'?'曜':'');
        var dateLb=(d.getMonth()+1)+'/'+(d.getDate());
        var em=wCodes[i]?jmaEmoji(wCodes[i]):'🌡️';
        var hi=tMax[i]!==undefined&&tMax[i]!==''?tMax[i]+'°':'—';
        var lo=tMin[i]!==undefined&&tMin[i]!==''?tMin[i]+'°':'—';
        var pop=wPops[i]!==''&&wPops[i]!==undefined?parseInt(wPops[i]):null;
        var rel=wRels[i]||'';var relCls=rel==='A'?'jdc-rel-A':rel==='B'?'jdc-rel-B':'jdc-rel-C';
        var barW2=pop!==null?Math.min(100,pop):0;
        week7Html+='<div class="jma-7card'+(isToday?' today':'')+'"><div class="jdc-day">'+dayLb+'</div><div class="jdc-date">'+dateLb+'</div><div class="jdc-em">'+em+'</div><div class="jdc-hi">'+hi+'</div><div class="jdc-lo">'+lo+'</div><div class="jdc-bar"><div class="jdc-fill" style="width:'+barW2+'%"></div></div><div class="jdc-pop">'+(pop!==null?pop+'%':'—')+'</div>'+(rel?'<div class="jdc-rel '+relCls+'">'+rel+'</div>':'')+'</div>';
      });
      week7Html+='</div>';
    }
    var todayCode=area0&&area0.weatherCodes&&area0.weatherCodes[0]?area0.weatherCodes[0]:null;
    var todayEm=todayCode?jmaEmoji(todayCode):'🌡️';
    var gridHtml='<div class="jma-grid">';
    if(tempMin!=='—'||tempMax!=='—'){gridHtml+='<div class="jma-item"><div class="ji-head"><div class="ji-em">'+todayEm+'</div><div class="ji-label">'+t('today_temp')+'</div></div><div class="ji-temp"><span style="color:#D44000">'+tempMax+'°</span><span style="font-size:14px;color:var(--text2);font-weight:400;margin:0 4px">/</span><span style="color:#2A6DB5">'+tempMin+'°</span></div></div>';}
    if(windText){var windArrow=windDirToArrow(windText);gridHtml+='<div class="jma-item"><div class="ji-head">'+(windArrow?windArrow:'<div class="ji-em">💨</div>')+'<div class="ji-label">'+t('wind_lbl')+'</div></div><div class="ji-val">'+windText+'</div></div>';}
    if(waveText){
      var waveTextH=waveText.replace(/[０-９．]/g,function(ch){return String.fromCharCode(ch.charCodeAt(0)-0xFEE0);});
      var waveNums=waveTextH.match(/[\d.]+/);var waveM=waveNums?parseFloat(waveNums[0]):null;
      var waveEm='🌊';if(waveM!==null){if(waveM<=0.5)waveEm='🫧';else if(waveM<=1.0)waveEm='🔵';else if(waveM<=2.0)waveEm='🌊';else if(waveM<=3.0)waveEm='🌬️';else waveEm='⚠️';}
      gridHtml+='<div class="jma-item"><div class="ji-head"><div class="ji-em">'+waveEm+'</div><div class="ji-label">'+t('wave_lbl')+(waveM!==null?' '+waveM+'m':'')+'</div></div><div class="ji-val">'+waveText+'</div></div>';
    }
    gridHtml+='</div>';
    return'<div class="jma-detail"><div class="jma-detail-title"><span class="tag t-jma">'+t('jma_chip')+'</span>'+t('jma_detail')+'</div>'+(weatherText?'<div class="jma-weather-text">'+weatherText+'</div>':'')+gridHtml+popHtml+week7Html+'</div>';
  }catch(e){console.warn('JMA detail error',e);return'';}
}
