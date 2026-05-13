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
- **Air quality panel** — PM2.5, desert dust (yellow sand / 黄砂), and EU AQI with color-coded level badges (no key required)
- **Pollen forecast via Google Pollen API:**
  - During pollen season (approx. Feb–May): individual species display — Japanese Cedar (スギ), Japanese Cypress (ヒノキ), Alder (ハンノキ), Birch (シラカバ), etc.
  - Off-season: pollen type summary — Tree Pollen (樹木花粉), Grass Pollen (草花粉), Weed Pollen (雑草花粉)
  - Off-season cards shown at reduced opacity with "シーズン外 / Off-season" label
- Daily (24-hour) and weekly temperature charts
- Multiple locations — add, switch, and delete; 9 Japanese city presets included
- Map-based location picker with reverse geocoding (click the map → place name filled in automatically)
- Dark / Light mode toggle, persisted across sessions
- Japanese / English UI toggle
- iOS home screen support (Apple Touch Icon + Web App meta tags)

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
> - The Google Pollen API key has a **dedicated input panel at the bottom of the page**, separate from other API keys.

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

## License

MIT
