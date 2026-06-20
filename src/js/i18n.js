// ==================== i18n ====================
var I18N={
  ja:{
    title:'天気予報ダッシュボード',app_title:'天気予報ダッシュボード',refresh:'更新',
    add_location:'地点を追加',loc_name:'地点名',loc_name_ph:'例：東京',latitude:'緯度',longitude:'経度',
    jma_code:'気象庁コード（任意）',add:'追加',presets:'よく使う地点：',
    pick_on_map:'地図から選択',search_place:'地名・住所で検索',search:'検索',
    current_loc:'現在地',use_this_location:'この地点を使用',
    latlon_hint:'緯度・経度はGoogle マップで右クリックすると確認できます。',
    api_keys:'APIキー設定（任意・無料）',api_key_ph:'APIキーを入力',apply:'適用して更新',
    api_note:'無料登録：OpenWeatherMap（1,000回/日）　Tomorrow.io（500回/日）',
    loading:'天気データを取得中...',
    cur_temp:'現在気温',hi_lo:'最高/最低',rain_prob:'降水確率',wind:'風速',humidity:'湿度',
    today_max:'本日最大',avg_2src:'2ソース平均',current:'現在',
    jma_detail:'気象庁 詳細予報',
    today_weather:'今日の天気',today_temp:'今日の気温',wind_lbl:'風',wave_lbl:'波',
    pop_6h:'6時間ごとの降水確率（気象庁）',week7:'7日間予報（気象庁）',
    date:'日付',weather_lbl:'天気',hi:'最高°',lo:'最低°',pop:'降水%',reliability:'信頼度',
    src_forecast:'ソース別 7日間予報',
    hourly_forecast:'本日の時間別予報',
    compare_5:'ソース別 比較（5日間）',
    temp_chart:'気温グラフ',daily_chart:'日次（24時間）',weekly_chart:'週次（7日間）',humidity_chart:'湿度グラフ',windspeed_chart:'風速グラフ',winddirection_chart:'風向グラフ',combined_chart:'統合（気温・湿度・風速）',windrose_chart:'風向ローズ（風向分布）',
    today_lbl:'今日',tomorrow_lbl:'明日',
    days:['日','月','火','水','木','金','土'],
    jma_chip:'気象庁',
    add_loc_btn:'地点追加',
    map_selected:'地点を選択しました：',
    loc_required:'地点名・緯度・経度を入力してください',
    del_confirm:'を削除しますか？',min_loc:'最低1つの地点が必要です',
    updated:'最終更新：',
    max_temp:'最高気温',min_temp:'最低気温',temp_c:'気温 (°C)',
    bulk_paste_hint:'2行まとめて貼り付け（順番：OpenWeatherMap / Tomorrow.io）',
    bulk_paste_ph:'1行目: OpenWeatherMap\n2行目: Tomorrow.io',
    distribute:'振り分け',
    bulk_done:'振り分けました',
    tab_forecast:'予報',tab_radar:'雨雲レーダー',tab_wxmap:'天気図',tab_aq:'大気質',
    radar_now:'現在',radar_loading:'データを取得中...',radar_error:'レーダーデータの取得に失敗しました',
    radar_play:'再生',radar_pause:'一時停止',
    wxmap_surface:'地上天気図',wxmap_fcst24:'予想（24h後）',wxmap_fcst48:'予想（48h後）',
    wxmap_source:'出典：気象庁',wxmap_note:'天気図は気象庁が発行するものです。更新は1日数回です。',
    aq_title:'大気質・花粉',pm25:'PM2.5',dust:'黄砂（Dust）',aqi:'大気質指数',
    pollen_title:'花粉予報（Google）',pollen_na:'データなし',
    ql_good:'良い',ql_fair:'普通',ql_mod:'やや悪い',ql_poor:'悪い',ql_vpoor:'非常に悪い',
    warn_special:'特別警報',warn_danger:'危険警報',warn_warning:'警報',warn_advisory:'注意報',
    warn_label:'気象警報・注意報',warn_none:'現在、警報・注意報はありません',
  },
  en:{
    title:'Weather Dashboard',app_title:'Weather Dashboard',refresh:'Refresh',
    add_location:'Add Location',loc_name:'Name',loc_name_ph:'e.g. Tokyo',latitude:'Latitude',longitude:'Longitude',
    jma_code:'JMA Code (opt.)',add:'Add',presets:'Presets:',
    pick_on_map:'Pick on Map',search_place:'Search place or address',search:'Search',
    current_loc:'My Location',use_this_location:'Use This Location',
    latlon_hint:'You can also right-click on Google Maps to get coordinates.',
    api_keys:'API Key Settings (Optional / Free)',api_key_ph:'Enter API key',apply:'Apply & Refresh',
    api_note:'Free tiers: OpenWeatherMap (1k/day)  Tomorrow.io (500/day)',
    loading:'Loading weather data...',
    cur_temp:'Current Temp',hi_lo:'High/Low',rain_prob:'Rain Prob.',wind:'Wind',humidity:'Humidity',
    today_max:'Today max',avg_2src:'2-src avg',current:'Now',
    jma_detail:'JMA Detailed Forecast',
    today_weather:"Today's Weather",today_temp:"Today's Temp",wind_lbl:'Wind',wave_lbl:'Wave',
    pop_6h:'6-hour Precipitation Probability (JMA)',week7:'7-Day Forecast (JMA)',
    date:'Date',weather_lbl:'Weather',hi:'High°',lo:'Low°',pop:'Rain%',reliability:'Reliability',
    src_forecast:'7-Day Forecast by Source',
    hourly_forecast:"Today's Hourly Forecast",
    compare_5:'5-Day Comparison by Source',
    temp_chart:'Temperature Chart',daily_chart:'Daily (24h)',weekly_chart:'Weekly (7d)',humidity_chart:'Humidity Chart',windspeed_chart:'Wind Speed Chart',winddirection_chart:'Wind Direction Chart',combined_chart:'Combined (Temp/Humidity/Wind)',windrose_chart:'Windrose (Direction Distribution)',
    today_lbl:'Today',tomorrow_lbl:'Tomorrow',
    days:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    jma_chip:'JMA',
    add_loc_btn:'Add Location',
    map_selected:'Location selected: ',
    loc_required:'Please enter name, latitude and longitude.',
    del_confirm:' - delete?',min_loc:'At least one location is required.',
    updated:'Updated: ',
    max_temp:'High',min_temp:'Low',temp_c:'Temp (°C)',
    bulk_paste_hint:'Paste 2 keys at once (order: OpenWeatherMap / Tomorrow.io)',
    bulk_paste_ph:'Line 1: OpenWeatherMap\nLine 2: Tomorrow.io',
    distribute:'Distribute',bulk_done:'Keys distributed',
    tab_forecast:'Forecast',tab_radar:'Rain Radar',tab_wxmap:'Weather Map',tab_aq:'Air Quality',
    radar_now:'Now',radar_loading:'Loading radar...',radar_error:'Radar data failed to load',
    radar_play:'Play',radar_pause:'Pause',
    wxmap_surface:'Surface Analysis',wxmap_fcst24:'Forecast (24h)',wxmap_fcst48:'Forecast (48h)',
    wxmap_source:'Source: Japan Meteorological Agency',wxmap_note:'Weather maps are issued by the Japan Meteorological Agency and updated several times daily.',
    aq_title:'Air Quality & Pollen',pm25:'PM2.5',dust:'Dust (Desert)',aqi:'AQI',
    pollen_title:'Pollen Forecast (Google)',pollen_na:'No data',
    ql_good:'Good',ql_fair:'Fair',ql_mod:'Moderate',ql_poor:'Poor',ql_vpoor:'Very Poor',
    warn_special:'Emergency Warning',warn_danger:'Danger Warning',warn_warning:'Warning',warn_advisory:'Advisory',
    warn_label:'Weather Warnings & Advisories',warn_none:'No active warnings or advisories',
  }
};
function t(k){var l=getLang();return(I18N[l]&&I18N[l][k])||I18N.ja[k]||k;}
function getLang(){return document.documentElement.getAttribute('data-lang')||'ja';}
function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(function(el){var k=el.getAttribute('data-i18n');el.textContent=t(k);});
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){if(el.tagName==='TEXTAREA'||el.tagName==='INPUT')el.placeholder=t(el.getAttribute('data-i18n-placeholder'));});
  document.title=t('title');
  document.getElementById('lang-btn').textContent=getLang()==='ja'?'EN':'日本語';
  var jmaChip=document.querySelector('[data-i18n-chip="jma"]');if(jmaChip)jmaChip.textContent=t('jma_chip');
}
function toggleLang(){
  var nl=getLang()==='ja'?'en':'ja';
  document.documentElement.setAttribute('data-lang',nl);
  localStorage.setItem('lang',nl);
  applyI18n();
  if(window._lastBuildArgs)buildContent.apply(null,window._lastBuildArgs);
}
