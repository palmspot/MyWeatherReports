# [Weather Forecast Dashboard](https://github.com/REDACTED/MyWeatherReports)

![Version](https://img.shields.io/badge/version-2.2.2-blue)

A multi-source weather forecast dashboard in a single static HTML file. No build step, no backend, and no server-side processing are required.

The dashboard compares forecasts from Open-Meteo, GFS, and the Japan Meteorological Agency (JMA), with optional support for OpenWeatherMap, Tomorrow.io, WeatherAPI, Google Weather, and Google Pollen API. It also includes air quality data, rain radar with +4-hour nowcast, JMA weather maps, and JMA weather warnings/advisories.

---

## Deploy

Upload these files to any static web server:

```text
index.html
apple-touch-icon.png
sw.js
```

No dependencies need to be installed. CDN assets are loaded directly in the browser.

---

## Server Configuration

This dashboard is designed to run behind a reverse proxy (Caddy + Nginx on FreeBSD/Bastille). Two Nginx proxy paths are required:

### JMA weather map proxy

```nginx
location /wxmap/ {
    proxy_pass https://www.jma.go.jp/;
    proxy_set_header Host www.jma.go.jp;
    proxy_set_header Origin "";
    proxy_set_header Referer "";
    proxy_ssl_server_name on;
    add_header Access-Control-Allow-Origin *;
}
```

This same `/wxmap/` proxy path is also used by the JMA Nowcast rain radar panel, so no additional proxy route is required for `nowc` data.

### Rainbow.ai radar proxy

```nginx
location /rbapi/ {
    proxy_pass https://api.rainbow.ai/;
    proxy_set_header Host api.rainbow.ai;
    proxy_set_header Ocp-Apim-Subscription-Key $http_ocp_apim_subscription_key;
    proxy_set_header Origin "";
    proxy_set_header Referer "";
    proxy_ssl_server_name on;
    add_header Access-Control-Allow-Origin *;
}
```

Both blocks are required because browsers block direct cross-origin requests to these external APIs.

---

## Features

- Single-file static weather dashboard
- Forecast / Rain Radar / Weather Map / Air Quality tab layout
- 7-day forecast comparison across Open-Meteo, GFS, JMA, and optional API-key sources
- Hero card with current conditions, temperature, high/low, wind, humidity, and precipitation probability
- JMA detailed forecast with weather text, wind, waves, 6-hour precipitation probability, and 7-day outlook
- JMA weather warnings and advisories banner using official JMA warning data
- Rainbow.ai rain radar with past 2-hour history and +4-hour nowcast timeline
- JMA weather map panel for surface analysis, 24-hour forecast, and 48-hour forecast maps
- Open-Meteo Air Quality panel for PM2.5, dust/yellow sand, and European AQI
- Google Pollen API support for pollen indexes and plant-specific pollen cards when available
- Google Weather API support for non-Japan locations
- Japan locations automatically skip Google Weather API because it is currently unavailable in Japan
- Multiple saved locations with add, switch, and delete controls
- Map-based location picker with reverse geocoding
- Japanese and English UI toggle
- Light and dark theme toggle
- Local browser cache with graceful fallback during network failures
- iOS home screen support with Apple Touch Icon and web app meta tags
- Mobile-friendly responsive layout

---

## Data Sources

### No API Key Required

| Source | Data |
| --- | --- |
| [Open-Meteo](https://open-meteo.com) | 7-day forecast and hourly forecast |
| [GFS via Open-Meteo](https://open-meteo.com/en/docs/gfs-api) | 7-day GFS model forecast |
| [Japan Meteorological Agency](https://www.jma.go.jp) | Official Japan forecast, detailed JMA forecast, warnings/advisories, weather maps |
| [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api) | PM2.5, dust/yellow sand, European AQI |
| [OpenStreetMap](https://www.openstreetmap.org) | Base map tiles |
| [Nominatim](https://nominatim.org) | Reverse geocoding for the map-based location picker |

### Optional API Keys

Enter keys in the API key panels at the bottom of the page. Keys are stored only in the browser's `localStorage`.

| Service | Data | Notes |
| --- | --- | --- |
| [Rainbow.ai](https://developer.rainbow.ai) | Rain radar tiles with +4h nowcast | Free tier: 30,000 calls/month. Requires Nginx `/rbapi/` proxy. Authentication: `Ocp-Apim-Subscription-Key` header |
| [OpenWeatherMap](https://openweathermap.org/api) | 5-day forecast | Free keys can take time to activate |
| [Tomorrow.io](https://app.tomorrow.io/signup) | 7-day forecast | Optional comparison source |
| [WeatherAPI](https://www.weatherapi.com) | 7-day forecast | Optional comparison source |
| [Google Weather API](https://developers.google.com/maps/documentation/weather) | Current conditions and daily forecast | Skipped for Japan locations |
| [Google Pollen API](https://developers.google.com/maps/documentation/pollen) | Pollen index and plant/type forecasts | HTTP referrer restriction is recommended |

---

## API Key Security

This is a static client-side app. API keys saved in the browser can be viewed in browser DevTools, so use dedicated keys with restrictions.

Recommended restrictions for Google APIs:

1. Create a dedicated key in Google Cloud Console.
2. Restrict the key to only the required API, such as Pollen API or Weather API.
3. Add HTTP referrer restrictions for your production domain, for example `https://your-domain.com/*`.
4. Do not reuse a private server-side key in this dashboard.

---

## Cache And Refresh

Forecast results are cached per location in `localStorage`.

- Normal reloads can use cached data for faster display.
- The refresh/apply action forces a live fetch.
- If the network fails and cached data exists, the dashboard shows cached results with a warning banner.
- If required Open-Meteo/GFS data is unavailable and no cache exists, an error message is shown.

For debugging on mobile, open the page with:

```text
?debug=1
```

---

## Production Notes

- After uploading, force-refresh the browser with `Ctrl + F5`.
- If installed as a home-screen web app, clear the web app/browser cache if old content remains.
- The JMA weather map panel loads JMA map images from `/wxmap/bosai/weather_map/data/...`; if your server does not proxy or host those paths, the panel falls back to a link to the official JMA weather map page.
- The Rainbow.ai radar panel requires the `/rbapi/` Nginx proxy. Without it, the browser blocks the request due to CORS. If no Rainbow.ai API key is set, a prompt is shown in the radar panel.

---

## Changelog

### v2.2.2 - Radar zoom and Warning logic improvements

- Adjusted rain radar initial zoom level and fixed rendering issue when switching tabs.
- Improved JMA warning/advisory logic to handle area names more accurately and prevent duplicate display.
- Added a "no warnings" message for locations with clear weather.
- Added support for "Linear Rainband" (顕著な大雨に関する情報) in warning codes.

### v2.2.1 - Current rain probability

- Changed the hero rain probability from the daily maximum to the Open-Meteo hourly value nearest the current time.

### v2.2.0 - Rainbow.ai nowcast radar

- Replaced RainViewer radar with Rainbow.ai Tiles API.
- Rain radar now shows past 2 hours (13 frames) plus +4-hour nowcast (24 frames) at 10-minute intervals.
- Added Rainbow.ai API key input in the key settings panel.
- Added `Rainbow.ai` source chip in the data source indicator bar.
- Added Nginx `/rbapi/` reverse proxy for CORS bypass. Authentication uses `Ocp-Apim-Subscription-Key` header; tile images use `?token=` query parameter.

### v2.1.0 - JMA warnings/advisories fix

- Added/updated JMA weather warnings and advisories support.
- Fixed JMA warning/advisory code mapping.
- Corrected the issue where Osaka's `乾燥注意報` could be displayed as `雷注意報`.
- Added warning code normalization so one-digit codes are safely handled as zero-padded codes.

### v2.0.0 - Tabbed layout, rain radar, and weather map

- Added Forecast / Rain Radar / Weather Map / Air Quality tabs.
- Added RainViewer radar panel with timeline and play/pause controls.
- Added JMA weather map panel with surface, 24-hour, and 48-hour forecast tabs.
- Added Air Quality tab using the same air quality/pollen panel from the forecast view.

### Earlier Releases

Earlier versions added Google Weather support, the hero current-conditions card, JMA detail visual enhancements, air quality and pollen panels, map-based location selection, multi-location management, charts, local cache, i18n, dark mode, and mobile/iOS compatibility.

---

## License

MIT
