# 🕹️ Retro Arcade Hub

A retro-themed, fully client-side browser arcade bundling 8 classic mini-games into a single neon-styled single-page app. No backend, no login — just press start and play.

> ▶ INSERT COIN TO PLAY ◀

## Overview

Retro Arcade Hub is a React SPA with zero backend dependencies. Scores, streaks, and achievements persist locally in the browser via `localStorage`, so there's nothing to deploy beyond static files.

- **8** playable games
- **SPA** architecture
- **0** backend
- **∞** fun

## Games

| Game | Description |
|---|---|
| 🎨 Simon Says | Async/await sequence player with a Promise-based color flash chain |
| ❌ Tic Tac Toe | Classic grid game with win-line detection and score persistence |
| 📝 Wordle | 6-row attempt grid with color-coded letter feedback |
| 🧠 Memory Match | 3D card-flip animation with match detection |
| 🎭 Mind Game | Stroop-effect timed rounds with streak tracking |
| 🐾 Animal Stop | Timing-based scoring with random cycling targets |
| 🪢 Hangman | Incremental inline SVG figure with streak persistence |
| 🐍 Snake | Classic game loop with WASD/arrow controls and speed scaling |

## Tech Stack

- **React 19** — UI rendering & component model
- **React Router v7** — Client-side routing per game
- **Vite 8** — Bundler, dev server, hot module reload
- **CSS Modules** — Scoped styles for the Home page
- **Press Start 2P** — Google Fonts pixel typeface
- **localStorage** — Score & streak persistence (no backend/database)

## Architecture

```
index.html   → Entry point
main.jsx     → React 19 mount point
App.jsx      → Route table (9 routes)
Home.jsx     → Hub / lobby
Game Pages   → 8 individual game components
```

**State & data flow:**
- `useState` / `useRef` — all in-game state stays local; there's no global store
- `useEffect` — handles side effects like keyboard listeners, game loops, and save-on-change
- `localStorage` (via `utils/storage.js`) — persists best scores, streaks, and win counts across sessions
- React Router's `navigate()` — moves the player between the hub and each game

## Visual Design

The UI leans into a CRT/neon arcade aesthetic, built entirely with custom CSS (no UI library):

- CRT scanline overlay via `body::before`
- Multi-layer text-shadow neon glow
- `clip-path` polygon angled buttons and card corners
- Radial-gradient card glow on hover
- CSS custom properties for theme colors (`--cyan`, `--magenta`, etc.)
- Custom cyan scrollbar
- HSL gradient on the Snake body, SVG grid lines in the Snake canvas

**Keyframe animations:** `flicker` (CRT neon title flicker), `float` (icon bob), `blink` (LED pulse), `pulse-glow` (breathing box-shadow), `spin` (360° rotate), `slideIn` (slide + fade).

## Home Page & Achievements

The hub (`Home.jsx`) includes:
- Hero section with a floating arcade icon and flickering title
- Live stats bar (Simon level, Tic Tac Toe wins, Wordle wins, Snake high score)
- Real-time search filter across game titles and descriptions
- A game grid of 8 cards with clip-path corners and per-card neon accents
- An achievement system with 6 unlockable trophies checked against `localStorage`
- Scoped styling via `Home.module.css` to prevent style leaks

**Achievements:**
1. 🏆 First Win — Win any game
2. 🔥 Streak Master — Hangman 5+ streak
3. 🧠 Mind Bender — Mind Game 20+ score
4. 🐍 Snake Charmer — Snake 100+ score
5. 💡 Wordle Wizard — Win Wordle in ≤ 3 tries
6. ⚡ Speed Demon — Memory Match in ≤ 20 moves

## Project Structure

```
retro-arcade-hub/
├── src/
│   ├── index.css            # Global vars, keyframes, utilities
│   ├── App.jsx               # Router with 9 routes
│   ├── main.jsx               # React 19 mount point
│   ├── pages/
│   │   ├── Home.jsx           # Lobby, search, achievements
│   │   └── Home.module.css    # Scoped hero/card styles
│   ├── games/
│   │   ├── Snake.jsx
│   │   ├── SimonSays.jsx
│   │   ├── Wordle.jsx
│   │   └── ...                # remaining game components
│   └── utils/
│       └── storage.js         # ls.get / ls.set wrapper around localStorage
├── dist/                       # Vite production build output
└── package.json                # React 19, React Router v7, Vite 8
```

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

The app is fully static once built — the `dist/` output can be deployed to any static host (no server-side code required).

## Notable Implementation Details

**Snake — game loop pattern**
- The game loop interval is stored in a `useRef` to avoid stale closure issues
- A mutable `stateRef.current` holds live game state between ticks; React state only updates to trigger re-renders
- Speed increases by 3ms per food eaten (capped at a 60ms minimum)
- Wall and self-collision are checked each tick before moving
- Mobile play is supported via a 3×3 d-pad button grid (arrow keys and WASD also work)

**Simon Says — async sequence**
- `flashColor()` returns a Promise that resolves after a delay
- `playSequence()` loops with `await` so each color waits for the previous one
- Timeouts are stored in a ref array for reliable cleanup on unmount
- A simple phase state machine drives the game: `idle → showing → input → gameover`
