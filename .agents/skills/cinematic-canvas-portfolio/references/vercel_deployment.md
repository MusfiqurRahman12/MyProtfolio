# Vercel Production Deployment & Sequence Caching

This reference documents the configuration to deploy image-sequence driven websites to Vercel without 404 errors, missing assets, or slow loading.

---

## 1. Core Deployment Challenges with 300-Frame Sequences

1. **Default `@vercel/static` Omission**:
   * If `vercel.json` specifies `"src": "index.html"`, Vercel only uploads `index.html`, ignoring folders like `protfolio-images/` or `assets/`.
   * **Fix**: Use wildcard `"src": "**"` to bundle all sequence frames and assets.
2. **Missing Filesystem Handler**:
   * If routing rules don't include `{ "handle": "filesystem" }`, image assets may be caught by SPA fallbacks and return HTML instead of images.
3. **Bandwidth & Cache Misses**:
   * 300 frames can consume significant bandwidth if re-downloaded on every page load.
   * **Fix**: Force 1-year immutable caching on all images.

---

## 2. Tested Production `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)\\.(jpg|jpeg|png|webp|avif|gif|svg|ico)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 3. Minimal `package.json` Requirement

Vercel's build pipeline expects a build script:

```json
{
  "name": "cinematic-portfolio",
  "version": "1.0.0",
  "scripts": {
    "dev": "node server.js",
    "build": "echo 'Static build ready'"
  }
}
```
