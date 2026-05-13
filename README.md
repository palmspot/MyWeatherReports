# 🌤️ Weather Forecast Dashboard

A multi-source weather forecast dashboard — a single static HTML file, no build step, no server-side processing.

Aggregates and compares forecasts from Open-Meteo, GFS, and the Japan Meteorological Agency side-by-side, with optional support for OpenWeatherMap, Tomorrow.io, and WeatherAPI.

---

## Deploy

Just drop the files onto any web server:

```
index.html
apple-touch-icon.png
```

That's it. No dependencies to install, no build process, no backend required.

---

## Optional API Keys

Three additional weather sources are supported if you bring your own free API keys. Enter them in the **API Key Settings** panel at the bottom of the page — they're saved in the browser's `localStorage`.

| Service | Free Tier | Sign Up |
|---------|-----------|---------|
| OpenWeatherMap | 1,000 requests / day | [openweathermap.org/api](https://openweathermap.org/api) |
| Tomorrow.io | 500 requests / day | [app.tomorrow.io/signup](https://app.tomorrow.io/signup) |
| WeatherAPI | 1,000,000 requests / month | [weatherapi.com/signup.aspx](https://www.weatherapi.com/signup.aspx) |

> **Note:** OpenWeatherMap keys can take up to 24 hours to activate after registration. Tomorrow.io and WeatherAPI work immediately.

---

## Features

- Side-by-side 7-day forecast comparison across up to 6 sources
- JMA detailed forecast — weather description, wind, waves, 6-hour precipitation probability, 7-day outlook with reliability grades
- Daily (24-hour) and weekly temperature charts
- Multiple locations — add, switch, and delete; 9 Japanese city presets included
- Map-based location picker with reverse geocoding (click the map → place name filled in automatically)
- Dark / Light mode toggle
- Japanese / English UI toggle
- iOS home screen support (Apple Touch Icon)

---

## Data Sources (No Key Required)

| Source | Notes |
|--------|-------|
| [Open-Meteo](https://open-meteo.com) | ECMWF-based, completely free, no key |
| [GFS via Open-Meteo](https://open-meteo.com/en/docs/gfs-api) | NCEP GFS model, free, no key |
| [JMA](https://www.jma.go.jp) | Japan Meteorological Agency official API, free, no key |

---

## License

MIT
