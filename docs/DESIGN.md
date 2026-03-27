# Design: KSB Shaker Challenge

## Design Principles

1. **Brand-first, high-energy**: KSB navy (#003F7F) and orange (#E8500A) dominate; no neutral grays
2. **Real-time urgency**: Countdown ring changes colour and text to build tension as measurement approaches
3. **Screen-state clarity**: Three distinct states (Idle → Waiting → Result) with unambiguous visual cues
4. **Touch-first**: Large tap targets, rounded corners, press animations — no hover-only states
5. **Minimal chrome**: No navigation, no menus; single-scroll experience optimised for booth display
6. **Readable at distance**: Extra-large type (`text-7xl` score, `text-5xl` headline) for booth monitors

---

## Component Library & Conventions

### Layouts
```
max-w-lg mx-auto px-4        // Fixed max width, centered, responsive gutters
flex flex-col items-center   // Vertical stack, center-aligned
gap-6 / gap-8                // Consistent section spacing
```

### Buttons
```
Primary CTA:    bg-ksb-orange hover:bg-ksb-lightorange text-white font-black text-xl rounded-xl py-4 active:scale-95
Secondary/link: text-white/30 hover:text-white/60 text-sm transition-colors
Disabled:       disabled:opacity-50
```

### Cards & Containers
```
Neutral:        bg-white/5 rounded-2xl px-5 py-4
Highlighted:    bg-ksb-orange/30 ring-2 ring-ksb-orange
Info (blue):    bg-ksb-lightblue/15 border border-ksb-lightblue/30 rounded-2xl
```

### Form Elements
```
Input:  rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30
        px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-ksb-orange
Label:  text-sm font-semibold text-white/70 uppercase tracking-wide
Error:  text-red-400 text-sm
```

### SVG Components
- **`MeasurementCountdown`**: 140px ring; stroke-dasharray countdown; colour state machine (see below)
- **`CountdownRing`**: 120px ring (built but currently unused — candidate for consolidation)
- **`VibrationGauge`**: 280px arc gauge with colour zones (built but not in main flow — candidate for result screen)

---

## Styling Approach

**Tailwind CSS** — utility-first, no CSS-in-JS runtime, PostCSS build pipeline.

All custom tokens are defined in `tailwind.config.js`:

```js
colors: {
  ksb: {
    blue:        '#003F7F',  // primary background
    lightblue:   '#0066CC',  // highlights, borders
    orange:      '#E8500A',  // CTAs, urgency, brand accent
    lightorange: '#FF6B2B',  // hover states, score metric
    gray:        '#F5F5F5',  // defined but unused
  }
}
```

Heavy use of `white/{opacity}` variants for visual hierarchy instead of additional named colours:
- `text-white/70` — labels
- `text-white/60` — secondary text
- `text-white/50` — muted / timestamps
- `bg-white/5` — card backgrounds
- `bg-white/10` — inputs, hover states

---

## Typography & Colour Tokens

### Font
- **Family**: Inter (Google Fonts, loaded in `index.html`)
- **Weights**: 400, 600, 700, 900

### Scale in Use
| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Labels, timestamps |
| `text-sm` | 14px | Body copy, instructions |
| `text-lg` | 18px | Input text |
| `text-3xl` | 30px | Player name in waiting state |
| `text-4xl` | 36px | Player name in result state |
| `text-5xl` | 48px | "SHAKER CHALLENGE" headline |
| `text-7xl` | 72px | Score display |

### Colour Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `ksb-blue` | `#003F7F` | App background |
| `ksb-lightblue` | `#0066CC` | Borders, ring glow |
| `ksb-orange` | `#E8500A` | CTAs, urgency |
| `ksb-lightorange` | `#FF6B2B` | Score metric, hover |
| Green | `#22c55e` | Countdown > 15s |
| Orange | `#f97316` | Countdown 5–15s |
| Red | `#ef4444` | Countdown < 5s |
| `white/70` | rgba(255,255,255,0.7) | Labels |
| `white/50` | rgba(255,255,255,0.5) | Muted text |

---

## Countdown Ring Colour State Machine

```
msUntilMeasurement:
  > 15,000ms  → stroke: #22c55e  (green)
  5,000–15,000ms → stroke: #f97316 (orange)
  < 5,000ms   → stroke: #ef4444  (red) + "SHAKE NOW!" text pulse
```

---

## Animations

Defined in `src/index.css`:

| Name | Effect | Used on |
|------|--------|---------|
| `pulse-ring` | Scale 1→1.08→1, opacity fade | Idle sensor icon |
| `shake-anim` | Translate ±4px + rotate ±1° | Sensor icon when imminent |
| `score-pop` | Scale 0.5→1.1→1 + fade in | Score number on result screen |
| `countdown-ring` | CSS transition on stroke-dashoffset | Measurement countdown ring |

---

## Dark / Light Mode
**Not implemented.** Hard-coded dark theme (navy background, white text). No `prefers-color-scheme` media query. Appropriate for trade fair booth context.

---

## Accessibility Patterns

### Current
- White on `#003F7F` navy — passes WCAG AA for normal text, AAA for large text
- Touch targets ≥ 44px (buttons: `py-3` or `py-4`)
- Large type for booth readability
- Icon + text buttons (e.g., "🎯 START CHALLENGE")

### Known Gaps [unknown — add manually if required]
- No ARIA labels or roles
- No `aria-live` regions for real-time score/countdown updates
- No keyboard navigation / focus indicators
- No `prefers-reduced-motion` support
- No screen reader testing performed

---

## Figma
No Figma file linked or found in the codebase. Design was implemented directly in code.
[unknown — add Figma link manually if a design file exists]
