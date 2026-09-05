# Design Tokens & Styling Architecture

This reference documents the design system, CSS variables, glassmorphic card recipes, typography scale, and responsive layout queries for the luxury cinematic portfolio.

---

## 1. CSS Custom Properties (:root)

```css
:root {
  /* Color Palette */
  --accent: #FF5E3A;                          /* High-energy vibrant red-orange */
  --accent-hover: #FF7252;
  --bg: #000000;                              /* Pure true black */
  --text-main: #FFFFFF;
  --text-muted: rgba(255, 255, 255, 0.65);
  --text-dim: rgba(255, 255, 255, 0.45);

  /* Glassmorphism Formulas */
  --glass-bg: rgba(18, 18, 18, 0.65);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-hover: rgba(255, 255, 255, 0.12);
  --glass-hover-accent: rgba(255, 94, 58, 0.25);

  /* Typography */
  --font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

---

## 2. Dynamic Ambient Contrast Overlay

Always place this overlay immediately above the `<canvas>` (z-index 1) and behind `#page-content` (z-index 10):

```css
#ambient-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100vh;
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

---

## 3. Glassmorphic Card Standard

```css
.card-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: 28px;
  padding: 38px 32px;
  position: relative;
  overflow: hidden;
  transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1),
              border-color 0.35s ease,
              box-shadow 0.35s ease;
}

/* Subtle top gradient glow line on hover */
.card-glass::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 94, 58, 0.4), transparent);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.card-glass:hover {
  transform: translateY(-8px);
  border-color: var(--glass-hover-accent);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.7), 0 0 35px rgba(255, 94, 58, 0.08);
}

.card-glass:hover::before {
  opacity: 1;
}
```

---

## 4. Pill Buttons

### Primary White Pill with Orange Icon Circle
```css
.btn-pill-white {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  color: #0d0d0d;
  text-decoration: none;
  padding: 6px 6px 6px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}
.btn-pill-white:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.25);
}
.btn-pill-white .arrow-icon-circle {
  width: 28px;
  height: 28px;
  background: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: transform 0.2s ease;
}
.btn-pill-white:hover .arrow-icon-circle {
  transform: rotate(45deg);
}
```

### High-Impact Orange Action Pill
```css
.btn-pill-orange {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: var(--accent);
  color: #ffffff;
  text-decoration: none;
  padding: 7px 8px 7px 22px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(255, 94, 58, 0.35);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn-pill-orange:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(255, 94, 58, 0.5);
}
```

---

## 5. Responsive Breakpoint Standards

* **`> 1024px`** (Desktop): Full multi-column grid, horizontal navbar, spacious paddings.
* **`861px – 1024px`** (Small Desktop / Tablet Landscape): 2-column grids, `#page-content` padding `0 28px`.
* **`641px – 860px`** (Tablet Portrait): Desktop `.nav-links` hides; `.mobile-nav-toggle` activates; showcase cards adapt to 16:11.
* **`441px – 640px`** (Mobile Portrait): 1-column cards, headline `clamp(36px, 9.2vw, 52px)`, 2x2 impact stats, full-width touch buttons.
* **`<= 440px`** (Compact Mobile / Foldables): Padding `0 16px`, compact icon CTA, single-column impact stats.
