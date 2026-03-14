# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Type-check with `tsc -b` then build with Vite
- `npm run lint` — Run ESLint
- `npm run preview` — Preview production build

## Tech Stack

- React 19 + TypeScript 5.9 + Vite 8
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin, no `tailwind.config` — uses CSS-first configuration)
- No routing library, no state management library — single-page app with local React state

## Architecture

This is a browser-based typing game ("ネコハラタイピング") where players type work-related English phrases while managing a needy black cat's satisfaction via mouse petting.

### Game flow (3 states)

`title` → `playing` (120s timer, 10 tasks) → `result` — managed by `useReducer` in `useGame`.

### Core mechanic

- **Typing (keyboard)**: Type displayed English work phrases to complete tasks
- **Cat petting (mouse)**: Click and drag on the cat to increase satisfaction gauge
- **Tension**: Cat satisfaction decays over time; if it hits 0, cat shuts down the laptop (game over)

### Key modules

- **`src/hooks/useGame.ts`** — Core game logic via `useReducer`: timer, keydown handling, cat satisfaction decay/recovery, scoring, game over conditions. Exports `GameScreen`, `CatMood`, `GameStats` types.
- **`src/hooks/useSound.ts`** — Web Audio API sound synthesizer: type click, miss beep, meow, purr, hiss, shutdown sounds.
- **`src/lib/workTasks.ts`** — Pool of 30 work-related English phrases with labels. `selectTasks(count)` picks random subset.
- **`src/lib/ranks.ts`** — 7-tier rank evaluation system based on score.
- **`src/lib/highscore.ts`** — localStorage persistence for high scores.
- **`src/components/Cat.tsx`** — Interactive cat component: emoji-based visuals, mood-dependent position/size/animation, mouse petting events, speech bubbles, floating hearts.
- **`src/components/CatPaw.tsx`** — SVG cat paw used for keyboard interference animation.
- **`src/App.tsx`** — Main component rendering all 3 screens with laptop-frame UI. Inline `<style>` defines CSS keyframe animations.

### Design spec

Detailed game specification lives in `docs/design.md` — consult it for UI behavior, scoring rules, cat mood system, and animation details.
