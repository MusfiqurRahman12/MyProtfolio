---
name: cinematic-canvas-portfolio
description: >-
  Build an ultra-premium, interactive 3D cinematic canvas-scrubbed website or portfolio (like the $10k dollar portfolio). Features a 300-frame image-sequence background scrubbing engine with LERP fluid interpolation, high-DPI canvas cover mode, luxury dark glassmorphism aesthetic (#FF5E3A accent), responsive mobile navigation drawer, interactive project showcase (compact slider + bento grid + filter + shuffle), and headless Sanity.io CMS dynamic hydration with offline fallback. Use this skill when the user wants to create a new high-end portfolio, a cinematic scroll-driven personal brand website, or replicate this exact architecture.
---

# Cinematic Canvas Portfolio Skill

This skill provides the comprehensive blueprint, reusable templates, mathematical canvas engine, and design standards to build an ultra-premium, $10k-tier interactive website driven by scroll-scrubbed 3D image sequences, dark glassmorphism, responsive navigation, and optional Sanity.io CMS hydration.

---

## 1. Architecture Overview

A **Cinematic Canvas Website** is built around 5 decoupled layers:

```
┌────────────────────────────────────────────────────────┐
│ 1. Fixed Background Canvas (0 to 300 frames scrubbed)  │
├────────────────────────────────────────────────────────┤
│ 2. Dynamic Contrast Overlay (Gradient legibility tint)  │
├────────────────────────────────────────────────────────┤
│ 3. Foreground DOM Content (Glassmorphic cards & grids) │
├────────────────────────────────────────────────────────┤
│ 4. Navigation Layer (Desktop links + Mobile 36px blur)  │
├────────────────────────────────────────────────────────┤
│ 5. CMS Hydration Engine (Sanity.io GROQ with fallback) │
└────────────────────────────────────────────────────────┘
```

---

## 2. Step-by-Step Implementation Procedure

### Step 1: Asset Preparation & Sequence Generation
1. Prepare a 100 to 300 frame sequence (PNG or JPG rendered from Blender, Cinema4D, Midjourney/Higgsfield, or high-res video).
   * Recommended dimensions: `1280x720` or `1920x1080`.
   * Standard file naming: `ezgif-frame-001.jpg` through `ezgif-frame-300.jpg`.
2. Compress frames for web performance using the helper script:
   * See [convert_frames.py](./resources/convert_frames.py) for batch resizing and WebP/JPG compression (target $\approx 35\text{KB}$ to $55\text{KB}$ per frame).
3. Place frames in `./protfolio-images/`.

### Step 2: Canvas Scrubbing Engine & Preloading Pipeline
Implement the fixed canvas and LERP animation loop:
1. **Fixed Fullscreen Viewport**:
   ```css
   #canvas-container {
     position: fixed;
     top: 0; left: 0;
     width: 100%;
     height: 100vh;
     height: 100dvh;
     z-index: 0;
     pointer-events: none;
     background: #000000;
   }
   ```
2. **High-DPI Cover Mode**:
   Calculate exact cover coordinates (`renderW`, `renderH`, `renderX`, `renderY`) preserving aspect ratio edge-to-edge on any screen resolution.
3. **Bi-directional Nearest-Neighbor Frame Fallback**:
   If a scrubbed frame is still in transit over the network, scan backward and forward dynamically to immediately render the nearest loaded frame without visual blackout.
4. **Two-Stage Progressive Preloader**:
   * **Stage 1**: Load frame `0` immediately to paint the hero screen within $\le 200\text{ms}$.
   * **Stage 2**: Load 10 evenly spaced keyframes (e.g. frames `0, 30, 60... 299`) to drive the preloader progress bar up to 100%, dismiss the loader, then pump remaining frames in background idle callbacks (`requestIdleCallback`).
5. **Mobile Viewport Stability**:
   * Use `100dvh`.
   * In `resize()`, guard against mobile browser address bar collapse/expansion by ignoring height oscillations $\le 120\text{px}$ unless width changes or orientation flips.
   * Attach passive `touchmove` and `orientationchange` listeners.
* For the complete implementation, see [references/canvas_engine.md](./references/canvas_engine.md).

### Step 3: Design System & Visual Tokenization
Apply the signature luxury dark palette:
* **Background**: `#000000` pure black.
* **Accent**: `#FF5E3A` (Energetic Red-Orange) with hover `#FF7252`.
* **Typography**: `'Plus Jakarta Sans', sans-serif` loaded from Google Fonts.
* **Glassmorphism**:
  ```css
  background: rgba(18, 18, 18, 0.65);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  ```
* **Ambient Contrast Overlay**:
  ```css
  #ambient-overlay {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100dvh;
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.35) 0%,
      rgba(0, 0, 0, 0.15) 20%,
      rgba(0, 0, 0, 0.45) 50%,
      rgba(0, 0, 0, 0.75) 80%,
      rgba(0, 0, 0, 0.92) 100%
    );
  }
  ```
* For full design tokens and layout utility rules, see [references/design_tokens.md](./references/design_tokens.md).

### Step 4: Component Architecture & Layout
Assemble the foreground sections inside `<div id="page-content">` (`max-width: 1280px; margin: 0 auto; position: relative; z-index: 10;`):
1. **Header & Navigation**:
   * Desktop: Logo + inline text links + pill CTA button.
   * Mobile ($\le 860\text{px}$): Animated $44\times 44\text{px}$ circular hamburger button + fullscreen glassmorphic drawer (`backdrop-filter: blur(36px)`).
2. **Hero Section**:
   * Dynamic rotating titles with vertical slide-fade transition (`.title-item.active`).
   * Mini role tag pills with bullet separators.
   * 4-item service highlight cards linking to sections below.
3. **Brand / Client Logos Bar**:
   * Glassmorphic capsule displaying partner company names or SVG logos.
4. **Behind the Quality / About**:
   * Asymmetric 2-column grid with bold headline and philosophy statement.
5. **Services I Provide**:
   * 6-card grid with custom SVG icon badges, numerical IDs (`#01` to `#06`), bulleted checkmarks, and technology pills.
6. **Project Leadership & Financial Scale Spotlight**:
   * Executive banner highlighting quantifiable metrics (Hours managed, project budget volume, accountability rate).
7. **Interactive Project Showcase**:
   * Category filter tabs (`All Work`, `AI & Automation`, etc.).
   * Dual view toggle: **Slider Mode** (horizontal drag/wheel scroll with numerical tracker `01 / 07`) and **Grid Mode** (bento-style cards).
   * Shuffle action button (`shuffleArray`).
8. **Experience, Skills, Certifications & Education**:
   * Timeline card layouts with period badges.
   * Matrix skill cards with icon badges and rounded skill pills.
9. **Contact & Footer**:
   * Centered call-to-action with stacked email/social pill buttons.

### Step 5: Headless Sanity.io CMS Dynamic Hydration
1. Set up a Sanity project (`projectId`, dataset: `production`).
2. Implement [sanity-client.js](./resources/sanity-client-template.js):
   * Queries GROQ for `siteSettings`, `projects`, `services`, `experience`, `skills`, `certifications`, `education`, `companies`.
   * **Graceful Fallback**: If the API is unreachable, offline, or returns empty arrays, the initial HTML remains 100% intact.
3. Store the write token safely in `.env` (never expose `sk...` tokens to client-side bundles).
4. Authorize client domains in Sanity CORS settings (`http://localhost:5173`, production URL).
   * Use [scripts/sanity-manage.js](./resources/sanity-manage.js) to view and manage CORS origins and inspect content.
* For schema definitions and GROQ queries, see [references/sanity_schema.md](./references/sanity_schema.md).

### Step 6: Production Deployment on Vercel
1. Configure `vercel.json` for static sequence hosting:
   * Match all assets: `{ "src": "**", "use": "@vercel/static" }`.
   * Serve filesystem first: `{ "handle": "filesystem" }`.
   * Set immutable headers for frame sequences:
     ```json
     {
       "source": "/(.*)\\.(jpg|jpeg|png|webp|avif|gif|svg|ico)",
       "headers": [
         {
           "key": "Cache-Control",
           "value": "public, max-age=31536000, immutable"
         }
       ]
     }
     ```
2. Verify local build using the static server:
   ```bash
   node server.js
   ```
* For complete deployment instructions, see [references/vercel_deployment.md](./references/vercel_deployment.md).

---

## 3. Bundled Utilities & Reference Files

* **[references/canvas_engine.md](./references/canvas_engine.md)**: Deep dive into the high-DPI canvas cover math, LERP dampening, and preloading queue.
* **[references/design_tokens.md](./references/design_tokens.md)**: Color palette, typography scale, glassmorphic styling, and media query breakpoints.
* **[references/sanity_schema.md](./references/sanity_schema.md)**: Sanity document types and dynamic hydration code.
* **[references/vercel_deployment.md](./references/vercel_deployment.md)**: Vercel static configuration and caching headers.
* **[resources/server.js](./resources/server.js)**: Zero-dependency local Node server with MIME handling.
* **[resources/convert_frames.py](./resources/convert_frames.py)**: Python script for sequence image optimization.
* **[resources/vercel.json](./resources/vercel.json)**: Production deployment config.
* **[resources/sanity-client-template.js](./resources/sanity-client-template.js)**: Standalone Sanity hydration script.
