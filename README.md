# 🌤️ [Weather Forecast Dashboard](https://github.com/REDACTED/MyWeatherReports)

A multi-source weather forecast dashboard — a single static HTML file, no build step, no server-side processing.

Aggregates and compares forecasts from Open-Meteo, GFS, and the Japan Meteorological Agency side-by-side, with optional support for OpenWeatherMap, Tomorrow.io, WeatherAPI, and Google Pollen API. Also displays real-time air quality data including PM2.5, desert dust, and pollen levels.

---

## Deploy

Just drop the files onto any web server:

```
index.html
apple-touch-icon.png
```

No dependencies to install, no build process, no backend required.

---

## Features

- Side-by-side 7-day forecast comparison across up to 6 weather sources
- JMA detailed forecast — weather description, wind, waves, 6-hour precipitation probability, 7-day outlook with reliability grades (A/B/C)
- **Air quality panel** — PM2.5, desert dust (yellow sand), and EU AQI with color-coded level badges (no key required)
- **Pollen forecast via Google Pollen API:**
  - During pollen season (approx. Feb–May): individual species — Japanese Cedar, Japanese Cypress, Alder, Birch, etc.
  - Off-season: pollen type summary — Tree Pollen, Grass Pollen, Weed Pollen
  - Off-season cards shown at reduced opacity with "Off-season" label
- Daily (24-hour) and weekly temperature charts
- Multiple locations — add, switch, and delete; 9 Japanese city presets included
- Map-based location picker with reverse geocoding (click the map → place name filled in automatically)
- **Bulk API key paste** — paste up to 3 keys at once (OWM / Tomorrow.io / WeatherAPI); auto-distributed to each field
- Dark / Light mode toggle, persisted across sessions
- Japanese / English UI toggle
- iOS home screen support (Apple Touch Icon + Web App meta tags)
- Mobile-friendly layout

---

## Data Sources

### No API Key Required

| Source | Data |
|--------|------|
| [Open-Meteo](https://open-meteo.com) | 7-day forecast + hourly (ECMWF model) |
| [GFS via Open-Meteo](https://open-meteo.com/en/docs/gfs-api) | 7-day forecast (NCEP GFS model) |
| [JMA](https://www.jma.go.jp) | Japan Meteorological Agency official forecast |
| [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api) | PM2.5, desert dust, EU AQI |

### Optional API Keys

Enter keys in the **API Key Settings** panel at the bottom of the page — they are saved in the browser's `localStorage` and never sent to any server other than the respective API.

| Service | Free Tier | Data | Sign Up |
|---------|-----------|------|---------|
| [OpenWeatherMap](https://openweathermap.org/api) | 1,000 req/day | 5-day forecast | [Sign up](https://openweathermap.org/api) |
| [Tomorrow.io](https://app.tomorrow.io/signup) | 500 req/day | 7-day forecast | [Sign up](https://app.tomorrow.io/signup) |
| [WeatherAPI](https://www.weatherapi.com) | 1,000,000 req/month | 7-day forecast | [Sign up](https://www.weatherapi.com/signup.aspx) |
| [Google Pollen API](https://developers.google.com/maps/documentation/pollen) | 10,000 req/month | Pollen index incl. Japanese cedar & cypress | [Google Cloud Console](https://console.cloud.google.com) |

> **Notes:**
> - OpenWeatherMap keys can take up to 24 hours to activate after registration.
> - Google Pollen API requires a Google Cloud billing account (free tier covers personal use).
> - The Google Pollen API key has a **dedicated input panel at the very bottom of the page**, separate from other API keys.

---

## API Key Security

Because this is a static HTML file, API keys entered in the browser are stored in `localStorage` and are visible in browser DevTools. This is an inherent limitation of client-side apps.

**Recommended mitigation for Google Pollen API:**

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create a **new dedicated key** for this dashboard (do not reuse existing keys)
3. Under **API restrictions** → select **Pollen API only**
4. Under **Application restrictions** → select **HTTP referrers** → add `https://your-domain.com/*`

This ensures the key only works from your site and only for the Pollen API, making it safe to use client-side.

---

## Changelog

### v1.7.0 — Security hardening
- Added `esc()` HTML escape function applied to all API response strings before `innerHTML` insertion (XSS prevention)
- Escaped fields: JMA weather text, wind, wave, pollen category, pollen plant names, reverse-geocoded place names, location tab labels, WeatherAPI condition text, OWM weather description
- Added Subresource Integrity (SRI) `integrity` attributes to CDN resources:
  - Leaflet CSS/JS: official sha256 hashes from leafletjs.com
  - Chart.js: downgraded from v4.4.0 (no SRI support) to v3.9.1 (last SRI-supported version) with sha256 hash
  - Tabler Icons: pinned from `@latest` to `@3.11.0` for version stability
- Verified escaping with automated tests: XSS attack strings, normal Japanese text, double-escape prevention, None/empty input handling

### v1.6.0 — Offline cache & graceful degradation
- Added localStorage cache per location — successful data is saved after every fetch
- On network failure, cached data is displayed instead of showing an error
- Orange warning banner shown when using cached data, including elapsed time since last update (e.g. "5 min ago")
- Error screen only shown when network fails AND no cache is available (first-time load with no connection)

### v1.5.0 — Mobile layout improvements & bulk API key paste
- Fixed full-page horizontal overflow on mobile (removed fixed `min-width` from input fields, added `overflow-x: hidden` to `html`, `body`, `.wrap`, and all panels)
- Added bulk API key paste field — paste 3 keys at once in order (OWM / Tomorrow.io / WeatherAPI), auto-distributed to each input
- Fixed JavaScript syntax error caused by missing `function applyKeys()` declaration
- Moved Google Pollen API key input to a dedicated panel at the very bottom of the page

### v1.4.0 — Air quality, pollen, and icon improvements
- Added air quality panel: PM2.5, desert dust (yellow sand), EU AQI from Open-Meteo Air Quality API (no key required)
- Added Google Pollen API support: pollen index by type (TREE / GRASS / WEED); individual species (Japanese Cedar, Japanese Cypress, etc.) shown during pollen season
- Fixed pollen data parsing — switched from `plantsInfo` to `pollenTypeInfo` to match actual API response structure
- Fixed pollen type display names (single-character Google API labels mapped to descriptive English names)
- Added seasonal behavior: individual species during season, type summary off-season
- Embedded favicon SVG as base64 data URI (no separate file needed)
- Updated Apple Touch Icon to user-supplied design
- All JS comments made bilingual (English / Japanese)

### v1.3.0 — Map-based location picker & i18n
- Added map-based location picker using Leaflet + OpenStreetMap
- Added reverse geocoding (Nominatim) — clicking the map auto-fills the place name field
- Fixed reverse geocoding for current location button (was inserting lat/lon as place name)
- Added Japanese / English UI toggle (full i18n)
- Added Dark / Light mode toggle with localStorage persistence

### v1.2.0 — Multi-location & charts
- Added multiple location management: add, switch, delete with tab bar
- Added 9 Japanese city presets (Osaka, Tokyo, Nagoya, Sapporo, Fukuoka, Naha, Sendai, Hiroshima, Kanazawa)
- Added daily (24-hour hourly) and weekly (7-day high/low) temperature charts via Chart.js
- Fixed JMA 7-day forecast date labels incorrectly showing "Ashita (tomorrow)" for all entries — now resolved by matching `timeDefines` dates to actual calendar dates

### v1.1.0 — Additional weather sources & JMA data expansion
- Added OpenWeatherMap, Tomorrow.io, and WeatherAPI as optional sources (API key required)
- Added GFS (NCEP model) as a second free source alongside Open-Meteo
- Expanded JMA data display: today's weather text, wind, wave height, 6-hour precipitation probability, 7-day outlook with reliability grades (A/B/C), high/low temperature ranges
- Fixed JMA data parsing — switched from `jma[0]` to `jma[1]` for 7-day forecast data; added date-based index mapping to correctly align forecast days
- Fixed precipitation probability display (was incorrectly averaging across sources)
- Added weather icons for GFS and JMA forecast rows
- Added iOS home screen support (Apple Touch Icon, `apple-mobile-web-app-capable`)

### v1.0.0 — Initial release
- Single-file static dashboard, no build step required
- 7-day forecast from Open-Meteo (ECMWF) and JMA
- Current conditions: temperature, weather description, wind speed, humidity, precipitation probability
- Today's hourly forecast (3-hour intervals)
- 5-day source comparison table
- Location stored in localStorage

---

## License

MIT
