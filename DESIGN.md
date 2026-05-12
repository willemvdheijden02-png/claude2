# Design System — AgencyHQ

Premium, donker-default, Linear × Vercel hybride. Geen ruis, dichte info, hoog vertrouwen.

## Designprincipes

1. **Donker is default.** Light mode bestaat maar is secundair. Dark mode is "premium signal" voor SaaS in 2026.
2. **Eén accentkleur.** Per-agency configureerbaar. Default emerald-500. Geen rainbow UI.
3. **Subtiele borders, geen schaduwen.** 1px lijnen op 8% opacity. Schaduwen voelen "Bootstrap" en cheap.
4. **Tabular nums voor cijfers.** Alle KPIs in `font-variant-numeric: tabular-nums`.
5. **Generous whitespace.** Padding minimaal 24px in cards. 48px tussen secties.
6. **Hover = glow, niet shadow.** Subtiele box-shadow met accentkleur op 8% opacity.
7. **Geen emoji in UI.** Lucide icons enkel.
8. **Snelheid voelt premium.** Skeleton loaders, optimistic updates, geen spinners op buttons (gebruik subtle pulse).

## Design Tokens (CSS vars)

```css
:root[data-theme="dark"] {
  /* Surfaces */
  --bg-canvas:        #0a0a0a;   /* page bg */
  --bg-surface:       #111111;   /* card bg */
  --bg-surface-2:     #161616;   /* nested card */
  --bg-surface-hover: #1a1a1a;

  /* Borders */
  --border-default: rgba(255, 255, 255, 0.08);
  --border-strong:  rgba(255, 255, 255, 0.12);
  --border-focus:   var(--accent-500);

  /* Text */
  --text-primary:   rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.65);
  --text-tertiary:  rgba(255, 255, 255, 0.40);
  --text-disabled:  rgba(255, 255, 255, 0.25);

  /* Accent — agency overschrijft deze runtime */
  --accent-50:  #ecfdf5;
  --accent-500: #10b981;
  --accent-600: #059669;
  --accent-glow: rgba(16, 185, 129, 0.15);

  /* Status colors */
  --status-success: #10b981;
  --status-warning: #f59e0b;
  --status-danger:  #ef4444;
  --status-info:    #3b82f6;

  /* Effects */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Transitions */
  --transition-fast: 120ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

:root[data-theme="light"] {
  --bg-canvas:        #fafafa;
  --bg-surface:       #ffffff;
  --bg-surface-2:     #f5f5f5;
  --bg-surface-hover: #f0f0f0;
  --border-default:   rgba(0, 0, 0, 0.08);
  --border-strong:    rgba(0, 0, 0, 0.12);
  --text-primary:     rgba(0, 0, 0, 0.92);
  --text-secondary:   rgba(0, 0, 0, 0.62);
  --text-tertiary:    rgba(0, 0, 0, 0.42);
  /* accent ongewijzigd */
}
```

## Typografie

**Font:** Geist (Vercel's variable font). Fallback: Inter, system-ui.

```css
--font-sans: 'Geist', 'Inter', system-ui, sans-serif;
--font-mono: 'Geist Mono', 'JetBrains Mono', monospace;
--font-display: 'Geist', sans-serif; /* zelfde als sans, maar tighter tracking */
```

**Schaal:**

| Token | Size | Line-height | Use |
|---|---|---|---|
| `text-xs` | 12px | 16px | labels, badges |
| `text-sm` | 13px | 18px | body, table cells |
| `text-base` | 14px | 20px | default UI |
| `text-md` | 15px | 22px | paragrafen |
| `text-lg` | 18px | 26px | card titles |
| `text-xl` | 22px | 30px | page subtitle |
| `text-2xl` | 28px | 36px | page title |
| `text-3xl` | 36px | 44px | hero |

**Tracking:** display sizes `-0.02em`, body 0.

## Spacing

8px grid. Tokens: `space-1` (4) → `space-12` (96).

## Component patterns

### Card
```
bg: --bg-surface
border: 1px solid --border-default
border-radius: --radius-lg (12px)
padding: 24px
hover: bg --bg-surface-hover, border --border-strong
transition: --transition-base
```

### Button (primary)
```
bg: --accent-500
text: white
height: 36px
padding: 0 14px
border-radius: --radius-md
font-weight: 500
hover: bg --accent-600 + glow shadow
focus: 2px ring --accent-glow
```

### Button (secondary)
```
bg: transparent
border: 1px solid --border-strong
text: --text-primary
hover: bg --bg-surface-hover
```

### Input
```
bg: --bg-surface-2
border: 1px solid --border-default
height: 36px
focus: border --accent-500, ring --accent-glow
```

### Status pill
```
inline-flex, height 22px, padding 0 8px
border-radius: 4px
font-size: 11px, font-weight: 500, uppercase
tracking: 0.04em
bg: status-color @ 12% opacity
text: status-color
```

### Data table
```
header: bg --bg-surface-2, text --text-tertiary, uppercase, 11px
rows: bg --bg-surface, border-bottom --border-default
hover: bg --bg-surface-hover
numbers: tabular-nums, text-right, --text-primary
```

## Layout

### Operator cockpit
```
┌────────────────────────────────────────────────┐
│ Topbar (48px) — logo, search, user menu        │
├──────┬─────────────────────────────────────────┤
│      │                                          │
│ Side │  Page content                            │
│ nav  │                                          │
│ 240px│                                          │
│      │                                          │
└──────┴─────────────────────────────────────────┘
```

### Agency portal
Identieke layout, maar topbar toont agency-logo (uit `agencies.logo_url`) i.p.v. AgencyHQ-logo. Sidebar items zijn anders (zie PAGES.md).

## Sidebar nav items (operator)

- Overview (home icon)
- Agencies (building icon)
- Clients (users icon)
- Queue (inbox icon, badge met pending count)
- Services (sparkles icon)
- Reports (file-text icon)
- Billing (credit-card icon)
- Settings (cog icon)

## Sidebar nav items (agency portal)

- Overview
- Clients
- Service Catalog
- Active Requests (badge met in_progress count)
- Reports Archive
- Settings (account + branding)

## Micro-interactions

- **Hover op een card** → border 8%→12% opacity + 200ms transition
- **Skeleton loaders** voor alle async content (3 grijze blokken pulserend)
- **Toast notifications** rechts-onder, slide-in van rechts, 4s auto-dismiss
- **Command palette** (Cmd+K) — Linear-stijl, fuzzy search over alles
- **Keyboard shortcuts** — `g a` ga naar agencies, `g c` clients, etc. (Linear-stijl)

## Accessibility minimum

- Contrast WCAG AA (alle text-secondary ≥ 4.5:1)
- Focus-rings altijd zichtbaar
- Keyboard-nav volledig werkend
- aria-labels op alle icon-only buttons
