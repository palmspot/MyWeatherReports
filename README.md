# [Weather Forecast Dashboard](https://github.com/REDACTED/MyWeatherReports)

![Version](https://img.shields.io/badge/version-2.1.0-blue)

A multi-source weather forecast dashboard in a single static HTML file. No build step, no backend, and no server-side processing are required.

The dashboard compares forecasts from Open-Meteo, GFS, and the Japan Meteorological Agency (JMA), with optional support for OpenWeatherMap, Tomorrow.io, WeatherAPI, Google Weather, and Google Pollen API. It also includes air quality data, rain radar, JMA weather maps, and JMA weather warnings/advisories.

---

## Deploy

Upload these files to any static web server:

```text
osaka_weather_dashboard.html
apple-touch-icon.png
```

If your production page is named `index.html`, rename or copy `osaka_weather_dashboard.html` to `index.html` before uploading.

No dependencies need to be installed. CDN assets are loaded directly in the browser.

---

## Features

- Single-file static weather dashboard
- Forecast / Rain Radar / Weather Map / Air Quality tab layout
- 7-day forecast comparison across Open-Meteo, GFS, JMA, and optional API-key sources
- Hero card with current conditions, temperature, high/low, wind, humidity, and precipitation probability
- JMA detailed forecast with weather text, wind, waves, 6-hour precipitation probability, and 7-day outlook
- JMA weather warnings and advisories banner using official JMA warning data
- Correct JMA warning/advisory code mapping, including `14 = 雷注意報` and `21 = 乾燥注意報`
- RainViewer rain radar with timeline controls and play/pause animation
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
| [RainViewer](https://www.rainviewer.com/api.html) | Rain radar tiles and nowcast frames |
| [OpenStreetMap](https://www.openstreetmap.org) | Base map tiles |
| [Nominatim](https://nominatim.org) | Reverse geocoding for the map-based location picker |

### Optional API Keys

Enter keys in the API key panels at the bottom of the page. Keys are stored only in the browser's `localStorage`.

| Service | Data | Notes |
| --- | --- | --- |
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
- The footer in the current HTML still displays `v2.0.0`, while the file header and README version are `v2.1.0`.

---

## Changelog

### v2.1.0 - JMA warnings/advisories fix

- Added/updated JMA weather warnings and advisories support.
- Fixed JMA warning/advisory code mapping.
- Corrected the issue where Osaka's `乾燥注意報` could be displayed as `雷注意報`.
- Added warning code normalization so one-digit codes are safely handled as zero-padded codes.
- Confirmed JavaScript syntax with a local script parse check.

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
