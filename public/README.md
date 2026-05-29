# Weather Forecast Dashboard (Public)

![Version](https://img.shields.io/badge/version-2.2.1-blue)

Public-facing README: anonymized for GitHub distribution. This copy omits private host/user details and includes only configuration guidance safe for publishing.

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

This dashboard is designed to run behind a reverse proxy (Caddy + Nginx). Two Nginx proxy paths are required:

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
