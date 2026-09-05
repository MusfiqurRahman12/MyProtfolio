# Canvas Scrubbing Engine & Preloading Architecture

This reference documents the complete scroll-driven image sequence rendering engine, the mathematical cover calculations, LERP smoothing loop, and preloading queue.

---

## 1. Engine Core Pipeline

```
Window Scroll / Touchmove
         │
         ▼
  updateScrollProgress()  ──────► Calculates targetProgress (0.0 to 1.0)
         │                         & triggers prioritizeNear(frameIndex)
         ▼
     renderLoop()         ──────► LERP dampening: currentProgress += (target - current) * 0.12
         │
         ▼
     drawFrame()          ──────► High-DPI Cover transform + Nearest-Neighbor Fallback
         │
         ▼
 Canvas 2D Context Render
```

---

## 2. Complete Reusable JavaScript Implementation

```javascript
(function initCanvasEngine() {
  'use strict';

  const TOTAL_FRAMES = 300;
  const canvas = document.getElementById('animation-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });

  // Array of Image objects & load states (0=unloaded, 1=loading, 2=loaded, -1=error)
  const images = new Array(TOTAL_FRAMES);
  const loadingState = new Int8Array(TOTAL_FRAMES);

  // Dynamic progress trackers
  let targetProgress = 0;
  let currentProgress = 0;
  let lastRenderedFrame = -1;

  // Frame URL constructor: e.g. protfolio-images/ezgif-frame-001.jpg
  function getFrameSrc(index) {
    const padIndex = String(index + 1).padStart(3, '0');
    return `protfolio-images/ezgif-frame-${padIndex}.jpg`;
  }

  // Load a single frame with callback
  function requestFrame(index, callback) {
    if (index < 0 || index >= TOTAL_FRAMES) return;
    if (loadingState[index] === 2) {
      if (callback) callback(images[index]);
      return;
    }
    if (loadingState[index] === 1) return;

    loadingState[index] = 1;
    const img = new Image();
    img.src = getFrameSrc(index);
    img.onload = () => {
      loadingState[index] = 2;
      images[index] = img;
      if (callback) callback(img);
    };
    img.onerror = () => {
      loadingState[index] = -1;
    };
  }

  // Window scroll & touch tracking
  function updateScrollProgress() {
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    targetProgress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
    
    // Prioritize frames surrounding current active scroll position
    const activeFrame = Math.round(targetProgress * (TOTAL_FRAMES - 1));
    for (let r = 1; r <= 8; r++) {
      requestFrame(activeFrame + r);
      requestFrame(activeFrame - r);
    }
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('touchmove', updateScrollProgress, { passive: true });

  // High-DPI Sizing & Mobile Stability Guard
  let canvasW = 0;
  let canvasH = 0;
  let dpr = 1;
  let lastW = 0;
  let lastH = 0;

  function resize() {
    const newW = window.innerWidth;
    const newH = window.innerHeight;

    // Guard: ignore small URL bar collapses (<120px) on mobile swipe
    const isFirstRun = canvasW === 0;
    const isWidthChange = newW !== lastW;
    const isMajorHeightChange = Math.abs(newH - lastH) > 120;

    if (isFirstRun || isWidthChange || isMajorHeightChange) {
      lastW = newW;
      lastH = newH;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasW = newW;
      canvasH = newH;

      canvas.width = Math.floor(canvasW * dpr);
      canvas.height = Math.floor(canvasH * dpr);
      canvas.style.width = canvasW + 'px';
      canvas.style.height = canvasH + 'px';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    updateScrollProgress();
    drawFrame(Math.round(currentProgress * (TOTAL_FRAMES - 1)));
  }

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 120));

  // Cover calculation with nearest loaded frame fallback
  function drawFrame(frameIndex) {
    const clampedIndex = Math.min(Math.max(frameIndex, 0), TOTAL_FRAMES - 1);
    let img = images[clampedIndex];

    // Fallback search to closest loaded frame
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const before = clampedIndex - offset;
        const after = clampedIndex + offset;
        if (before >= 0 && images[before] && images[before].complete && images[before].naturalWidth > 0) {
          img = images[before];
          break;
        }
        if (after < TOTAL_FRAMES && images[after] && images[after].complete && images[after].naturalWidth > 0) {
          img = images[after];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasW / canvasH;

    let renderW, renderH, renderX, renderY;

    if (canvasRatio > imgRatio) {
      renderW = canvasW;
      renderH = canvasW / imgRatio;
      renderX = 0;
      renderY = (canvasH - renderH) / 2;
    } else {
      renderH = canvasH;
      renderW = canvasH * imgRatio;
      renderX = (canvasW - renderW) / 2;
      renderY = 0;
    }

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.drawImage(img, renderX, renderY, renderW, renderH);
  }

  // LERP render loop
  function renderLoop() {
    const diff = targetProgress - currentProgress;
    if (Math.abs(diff) > 0.0001) {
      currentProgress += diff * 0.12;
    } else {
      currentProgress = targetProgress;
    }

    const frameIndex = Math.round(currentProgress * (TOTAL_FRAMES - 1));
    if (frameIndex !== lastRenderedFrame) {
      drawFrame(frameIndex);
      lastRenderedFrame = frameIndex;
    }

    requestAnimationFrame(renderLoop);
  }

  // Preload initialization
  function startEngine() {
    resize();
    // Load frame 0 immediately
    requestFrame(0, () => drawFrame(0));

    // Load keyframes for initial scrub capability
    const keyframes = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 299];
    let loadedKeyframes = 0;
    keyframes.forEach(k => {
      requestFrame(k, () => {
        loadedKeyframes++;
        if (loadedKeyframes === keyframes.length) {
          // Preloader done; start low-priority background pump
          pumpRemainingFrames();
        }
      });
    });

    renderLoop();
  }

  function pumpRemainingFrames() {
    let index = 0;
    function pump() {
      let active = 0;
      while (active < 4 && index < TOTAL_FRAMES) {
        if (loadingState[index] === 0) {
          active++;
          requestFrame(index, () => {
            active--;
            pump();
          });
        }
        index++;
      }
    }
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(pump, { timeout: 1000 });
    } else {
      setTimeout(pump, 200);
    }
  }

  startEngine();
})();
```
