# 🌤️ [Weather Forecast Dashboard](https://github.com/REDACTED/MyWeatherReports)

![Version](https://img.shields.io/badge/version-1.15.0-blue)

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

### v1.15.0 — JMA forecast visual overhaul
- Replaced JMA 7-day forecast table with card grid layout — each day shown as a card with weather emoji (24px), high/low temp in orange/blue, precipitation probability bar, and reliability badge (A=green, B=yellow, C=gray)
- Added JMA weather emoji mapping (`JMA_EMOJI`) for all JMA weather codes
- 6-hour precipitation probability cells now include a blue gradient progress bar
- Today's temperature high/low shown in red/orange and blue with stronger color contrast
- Weather text card styled with left accent border for visual emphasis
- Fixed duplicate `.jma-weather-text` CSS definition causing layout misalignment in the weather text card
- Moved hourly forecast section to immediately below the hero card

### v1.14.0 — Visual overhaul of forecast grid
- Replaced Tabler icon font with weather emoji (☀️🌧️⛈️❄️ etc.) in all forecast cells — larger (26px), no font dependency, works on all platforms
- High temperature shown in orange, low temperature in blue across all sources
- Added precipitation probability bar — a blue gradient progress bar below the percentage value in each cell
- Today's column now highlighted with background color in addition to border
- Hourly forecast cards: added weather emoji icon and highlight for the current time slot
- Weekly chart: OM high/low temperature range filled with semi-transparent band for easier reading; temperature axis now shows degree symbol
- All sources (OM, GFS, JMA, OWM, Tomorrow.io, WeatherAPI, Google Weather) use unified visual style
- Fixed Google Weather API silently returning 404 for Japan — Japanese locations (JMA code present) now skip Google Weather automatically; note added to key input panel

### v1.13.0 — Google Weather API, visual overhaul & bug fixes
- Added **Google Weather API** support (current conditions + 10-day daily forecast); shown in hero card and source comparison grid
- Added **Google Weather API key input** in the Google APIs panel (alongside Pollen API key)
- **Fixed "Apply & Refresh" button** — was silently using 30-min cache instead of fetching live data; now calls `loadAll(true)` to force refresh
- **Hero card**: replaced small metric tiles with a large current-conditions card showing weather emoji, large temperature, high/low, wind, humidity, and precipitation probability at a glance
- **Daily chart improvement**: current hour point highlighted in orange with larger radius for easy identification of current temperature
- Added weather emoji mapping (`WE`) for all WMO weather codes
- Google Weather current conditions used as primary temperature source when API key is set

### v1.12.0 — Mobile fix & iOS compatibility
- Fixed critical bug: `DEFAULT_LOCATIONS` variable was missing, causing blank/stuck loading screen on first visit (no localStorage data) — affected all mobile users and any browser without prior session data
- Default locations set to Osaka and Tokyo as fallback when localStorage is empty
- Added `Promise.allSettled` polyfill for iOS 12 and older
- Replaced `.finally()` with `.then()/.catch()` for iOS 11 compatibility
- Added `AbortController` availability check — falls back to plain `fetch()` on unsupported environments
- Added on-screen debug log mode: append `?debug=1` to URL to show per-API fetch results on screen (useful for mobile debugging without DevTools)

### v1.11.0 — Network resilience improvements
- Replaced `Promise.all` with `Promise.allSettled` — a single API failure no longer blocks the entire page load; failed sources show as unavailable while others display normally
- Reduced fetch timeout from 10s to 8s for faster fallback on slow mobile connections
- Extended cache TTL from 5 minutes to 30 minutes — location switching and page reloads on slow connections now use cached data more aggressively
- Open-Meteo (OM) and GFS remain required; if both fail, cache fallback is triggered as before

### v1.10.0 — Full JMA location presets
- Expanded Japan presets from 9 cities to all 55 JMA forecast API locations
- Grouped by region: Hokkaido (5), Tohoku (6), Kanto (7), Chubu (10), Kinki (6), Chugoku (5), Shikoku (4), Kyushu & Okinawa (12)
- All 55 presets include JMA region codes, enabling full JMA detailed forecast display for every location
- Remote islands included: Amami (460040), Miyako (473000), Ishigaki (474000), Okinawa-North (472000)
- Preset button labels show both English and Japanese names (e.g. "Sapporo")

### v1.9.0 — World city presets
- Added 62 city presets across 7 regions: Japan, East Asia, South Asia / Middle East, Europe, Africa, Americas, Oceania
- Presets are grouped by region with flag emoji headers for easy navigation
- Southern Hemisphere cities included: Cape Town, Johannesburg, Nairobi, Buenos Aires, Santiago, Lima, Jakarta, Sydney, Melbourne, Auckland, and more
- Japanese cities retain JMA region codes for official forecast data

### v1.8.0 — Cache improvements & refresh behavior
- Refresh button now forces a live API fetch (bypasses cache)
- On network failure during forced refresh, gracefully falls back to cached data with orange warning banner
- Location switching uses cache if data is less than 5 minutes old (faster tab switching)
- Fixed stale/corrupt cache causing JMA detailed forecast to disappear — cache is now only saved when all required data (OM, GFS, JMA) is valid
- Fixed JMA detailed forecast not updating on location switch (was reading corrupt cached data from previous session)
- Fixed Tabler Icons CDN path (`/dist/` directory was missing after version pin to 3.11.0), causing all icons and weather symbols to disappear
- Fixed theme toggle button appearing as empty oval — replaced icon font with emoji (🌙/☀️) for reliability
- Reverted Chart.js from v3.9.1 back to v4.4.0 (v3.9.1 caused charts to stop rendering due to API differences)

### v1.7.0 — Security hardening
- Added `esc()` HTML escape function applied to all API response strings before `innerHTML` insertion (XSS prevention)
- Escaped fields: JMA weather text, wind, wave, pollen category, pollen plant names, reverse-geocoded place names, location tab labels, WeatherAPI condition text, OWM weather description
- Added Subresource Integrity (SRI) `integrity` attributes to CDN resources:
  - Leaflet CSS/JS: official sha256 hashes from leafletjs.com
  - Tabler Icons: pinned from `@latest` to `@3.11.0` for version stability
  - Chart.js v4.x intentionally does not provide SRI hashes (upstream decision); v4.4.0 is retained as-is. Risk is low given jsDelivr's infrastructure, but users who require strict SRI compliance can self-host `chart.umd.min.js`
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
