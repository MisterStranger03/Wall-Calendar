# Wall Calendar

An interactive wall calendar web app built with **React 18 + Vite**, faithfully recreating the look and feel of a physical spiral-bound wall calendar — and extending it with modern digital features.

---

## Why these choices

### React 18 + Vite
React was chosen because the calendar has many pieces of interactive state (selected range, hovered date, open modals, theme, events, notes) that need to flow cleanly between components. Vite was chosen over Create React App because it starts in under a second, hot-reloads instantly on save, and produces smaller production bundles with zero configuration.

### No external UI or calendar library
All date logic (`getDaysInMonth`, `getWeekDays`, range detection) is written from scratch in `constants.js`. This avoids pulling in a heavy library (react-big-calendar, FullCalendar) for what is essentially a display grid, and gives total control over the visual output.

### Plain CSS with custom properties — no Tailwind, no CSS modules
The design needs pixel-precise control over the diagonal SVG shapes, the lined sidebar, and the range highlight rounding. Plain CSS with CSS custom properties (`--tp`, `--ta`, `--tl`, `--tt`) gives that control. Theme switching works by calling `document.documentElement.style.setProperty` — this updates every element instantly, including SVG fills and inline styles, without a React re-render cycle.

### localStorage for persistence
All notes, events, theme preference, and month memos are serialised to JSON and stored under four localStorage keys. No network requests, no auth, works offline.

### Playfair Display + DM Sans
Playfair Display (serif, heavy) for the month name on the hero section gives the editorial, print-like quality of a real wall calendar. DM Sans (geometric sans) for the rest keeps the UI clean and readable. Both are loaded from Google Fonts.

### Unsplash CDN for hero images
Twelve curated landscape photographs one per month — are loaded directly from Unsplash with `?w=900&q=80` for a good balance of quality and load speed. Each photo was selected to match the season (January → frozen snowfield, April → cherry blossom, July → fireworks, October → pumpkins, etc.).

### Tabular numerals on the clock
The live clock (`HH:MM:SS`) uses `font-variant-numeric: tabular-nums` and `font-feature-settings: "tnum" 1` so every digit occupies identical width. Without this, the seconds ticking would shift the search bar and theme dots slightly on every tick. A `min-width` on the clock container locks the box size as a second layer of defence.

### Design principle — additive, not destructive
The original physical wall calendar layout (white card, hero photo, diagonal coloured shape, lined notes sidebar, day grid) is preserved exactly in `#calendar-card`. All new features — the top bar with clock/search/themes, and the four feature cards below — are added outside that card. Nothing inside the card was changed from the original reference design.

---

## Prerequisites

- **Node.js 18 or higher** — https://nodejs.org (LTS version recommended)
- **npm 9 or higher** — comes bundled with Node
- A modern browser — Chrome 100+, Firefox 100+, Safari 16+, Edge 100+

Check your versions:

```bash
node --version   # v18.x.x or higher
npm --version    # 9.x.x or higher
```

---

## Running locally

1. **Clone the repository**

```bash
git clone https://github.com/MisterStranger03/Wall-Calendar.git
```

2. **Navigate to the project directory**

```bash
cd Wall-Calendar
```

**3. Install dependencies**

```bash
npm install
```

This installs React 18, ReactDOM 18, and the Vite build tool into `node_modules/`. Takes about 10–20 seconds.

**4. Start the development server**

```bash
npm run dev
```

Vite starts a local server. Open **http://localhost:5173** in your browser. The page hot-reloads automatically whenever you save a file, no manual refresh needed.

---

## Other commands

```bash
npm run build      # Compiles optimised production bundle → dist/
npm run preview    # Serves the production build at http://localhost:4173
```

---


## Project structure

```
wallcal/
├── index.html              Entry point — loads Google Fonts, mounts <div id="root">
├── vite.config.js          Vite config (just the React plugin)
├── package.json            Dependencies and npm scripts
└── src/
    ├── main.jsx            React 18 createRoot entry
    ├── App.jsx             All state, layout, navigation, modals
    ├── index.css           All styles — CSS variables, animations, responsive
    ├── constants.js        Hero images, themes, holidays, weather, helpers
    └── components/
        ├── DayCell.jsx     Single calendar day — ripple, tooltip, range states
        ├── EventModal.jsx  Create / edit event form
        └── NoteModal.jsx   Create / edit day or range note
```


---

## localStorage keys

| Key | What it stores |
|---|---|
| `wc-theme` | Active theme name string |
| `wc-notes` | `{ "YYYY-MM-DD": "note text" }` |
| `wc-mnotes` | `{ "YYYY-M": "monthly memo" }` |
| `wc-events` | Array of event objects |

To reset all data: open DevTools → Application → Local Storage → delete the four `wc-*` keys.

---

## Features at a glance

| Area | Features |
|---|---|
| Calendar card | Hero photo per month, diagonal SVG shape overlay, lined notes sidebar, day grid Mon–Sun, today ring, weekend colour, holiday ★ markers |
| Range selection | Click start → click end, hover preview, rounded row-boundary caps, note/event shortcuts for the selection |
| Notes | Monthly memo, per-day note, per-range note, day note chips in sidebar, localStorage persistence |
| Events | Full create/edit/delete, title + date + time + category + colour + description, all-day toggle, colour bars on day cells |
| Top bar | Live tabular clock, event search, 6 colour themes, date jumper (month + year selects), Today · Hide weekends · Focus mode · + Event |
| Feature cards | This Week strip, Month Highlights agenda, Year at a Glance (12 mini months), Weather + Stats counters |


---

⭐️ If you like this project, please give it a star on GitHub!

**Made with ❤️ by Raman**
