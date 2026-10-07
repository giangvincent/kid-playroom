# Spec: Children's Concentration Playroom

Status: Draft — awaiting human approval before Phase 2 (Plan).
Owner: parent (private use). Audience: child ~1.5–5 y/o, used together with a parent.

## 1. Objective

A private, offline-capable, ad-free "digital playroom" of simple games that a parent
opens with a young child on a tablet. Success is a child playing happily with a finger
and a parent being able to hand over the device without the child escaping into the OS.

Skills exercised: concentration, visual observation, matching, color recognition,
size recognition, memory, hand–eye coordination, drawing, object recognition.

**Sprint 1 ships all six games**, but they are deliberately small: a shared game engine
and shell, then six focused mini-games. No backend, no accounts, no network at runtime.

### Assumptions (confirm or correct)

1. Greenfield Next.js (App Router) + React + TypeScript + Tailwind, npm.
2. Runtime is fully client-side and offline-capable; no server, no accounts.
3. Primary target is tablets (iPad + Android) held in landscape, but layout is responsive.
4. Visual language is pixel art, rendered from inline sprite data (no downloaded assets).
5. Games are single-player, non-scored (no timers, no leaderboards, no "lose" state).
6. Six games = Matching, Color, Animal, Size, Drawing, **Memory** (see Open Questions).

### Success Criteria (testable)

- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` all pass clean.
- Lighthouse "Installable" / PWA check passes; `manifest` resolves with valid icons.
- After one online load, launching from the home screen with the network off plays all
  six games (airplane-mode check on a real iPad and a real Android tablet).
- All six games are reachable from the Child Mode grid and each returns to the grid
  with no page reload and no loss of settings.
- Parent gate: holding the hidden corner ≥ 3 s opens a 4-digit PIN pad; correct PIN exits
  fullscreen and returns to Parent Mode; a wrong PIN is rejected and stays in Child Mode.
- Every interactive target is ≥ 64×64 px; no double-tap zoom, no text selection, no
  pull-to-refresh, no accidental back-navigation out of Child Mode.
- Pure logic (shuffle, match detection, size ordering, memory pair generation) is covered
  by Vitest unit tests.

## 2. Tech Stack

- Next.js 15 (App Router, `app/`), React 19, TypeScript (strict).
- Tailwind CSS v4 for layout/utility styling.
- PWA: Next.js native `app/manifest.ts` + a small hand-written service worker (`public/sw.js`).
  Rationale: avoid a PWA plugin dependency; caching needs are modest (app shell + hashed static).
  Ceiling: hand-rolled SW → migrate to Serwist/next-pwa only if caching complexity grows.
- Persistence: `localStorage` only (settings + parent PIN). No IndexedDB in Sprint 1.
- Icons: generated at build-setup time by `scripts/gen-icons.mjs` using Node's built-in
  `zlib` (dependency-free PNG encoder). No image libraries.
- Unit tests: Vitest (Node environment). No component/e2e tests in Sprint 1; touch UX is
  validated by hand on device.

No backend. No Laravel/MySQL. No analytics. No ads. No runtime network calls.

## 3. Commands

```
Install:     npm install
Dev:         npm run dev
Build:       npm run build
Start:       npm start
Typecheck:   npm run typecheck      # tsc --noEmit
Lint:        npm run lint           # next lint
Test:        npm run test           # vitest run
Test watch:  npm run test:watch     # vitest
Icons:       npm run icons          # node scripts/gen-icons.mjs
```

## 4. Project Structure

```
app/
  layout.tsx            Root layout: fonts, viewport, PWA register, no-select shell
  page.tsx              Parent Mode (settings + "Start Play")
  play/page.tsx         Child Mode home: game grid
  play/[game]/page.tsx  Renders one game via the engine (static params from registry)
  manifest.ts           Next.js native web manifest route
  globals.css           Tailwind entry + pixel/no-select/overscroll globals
  icon.svg, apple-icon.png
components/
  ui/                   PixelButton, PixelCard, PixelSprite, Modal, Icon
  parent/               PinPad, PinSetup, PinGate, SettingsForm, GameToggles
  child/                GameShell, GameGrid, GameCard, ExitCorner, Celebration
  games/                One folder per game: matching/ color/ animal/ size/ memory/ drawing/
lib/
  config.ts             AppConfig type, DEFAULT_CONFIG, APP_NAME
  storage.ts            Typed localStorage load/save with runtime validation (trust boundary)
  store.tsx             ConfigProvider + useConfig() context
  games/
    types.ts            GameDefinition, GameProps, GameId
    registry.ts         Ordered list of all six games (metadata + component + static params)
  pixel/
    palette.ts          Fixed retro color palette
    sprites.ts          Sprite maps (string-grid + palette indices) for shapes/animals/icons
    render.ts           sprite → canvas → cached data URL (image-rendering: pixelated)
  logic/                Pure, testable helpers (shuffle, sample, orderBySize, memoryPairs)
    *.test.ts           Colocated Vitest unit tests for logic/ and games
public/
  sw.js                 Service worker (app-shell + stale-while-revalidate)
scripts/
  gen-icons.mjs         Dependency-free PNG icon generator
tasks/
  plan.md, todo.md      Phase 2 / Phase 3 artifacts
SPEC.md                 This document
```

## 5. Code Style

```tsx
// components/ui/PixelButton.tsx
type PixelButtonProps = {
  label: string
  onPress: () => void
  tone?: "primary" | "danger"
}

export function PixelButton({ label, onPress, tone = "primary" }: PixelButtonProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={tone === "danger" ? "pixel-btn pixel-btn--danger" : "pixel-btn"}
    >
      {label}
    </button>
  )
}
```

Conventions:

- TypeScript `strict`; prefer `type` aliases; no `any`; no non-null assertions on DOM.
- Component files `PascalCase.tsx`; lib modules and utilities `camelCase.ts`.
- Named exports everywhere except Next.js pages/layouts (which are default exports).
- Object parameters for functions with 2+ related arguments.
- Class names via a tiny `cx(...)` helper (no `clsx` dependency).
- No comments unless the logic is non-obvious; no `console.log` in shipped code.
- Pure logic lives in `lib/logic` / `lib/games` so it can be unit-tested without React.

## 6. Testing Strategy

- Framework: **Vitest**, Node environment, colocated `*.test.ts` next to pure modules.
- Scope: pure functions only — `shuffle`, `sample`, `buildMatchingPairs`,
  `checkMatch`, `orderBySize`, `buildMemoryDeck`, and config validation in `storage`.
- Not covered in Sprint 1: React components, service worker, touch gestures (manual,
  on-device). Interactive behavior is verified by hand on iPad + Android tablet.
- Requirement: every non-trivial pure logic module ships at least one test.
- Run gate: tests must pass before a task is considered done (`npm run test`).

## 7. Boundaries

- **Always:** run `typecheck` + `lint` + `test` before declaring a task done; validate
  every `localStorage` read against the expected shape; keep tap targets ≥ 64 px;
  keep audio optional and default-off; keep a working parent exit at all times.
- **Ask first:** adding any dependency; changing the parent-gate mechanism or PIN policy;
  changing the service-worker caching strategy; adding a backend, database, or network call;
  adding analytics, ads, or third-party scripts; changing app name/branding.
- **Never:** ship ads, trackers, or runtime network calls; introduce a backend in Sprint 1;
  commit secrets; use `dangerouslySetInnerHTML` with untrusted data; remove the ability to
  exit Child Mode; break offline playback.

## 8. Game Definitions (Sprint 1)

Shared conventions: tap-first (drag is a bonus, never required); no failure state; a
correct action triggers a celebration and the round auto-advances; a "replay" control
re-randomizes; all use `PixelSprite` and the fixed palette.

1. **Matching** (`matching`) — Tap two identical tiles to remove a pair. A small board
   (e.g. 8–12 tiles) of pixel shapes/animals. Trains visual observation + matching.
2. **Color** (`color`) — A large target swatch is shown; tap the matching swatch among a
   few options. Trains color recognition. Difficulty = number + similarity of options.
3. **Animal** (`animal`) — A scene of many pixel animals; tap every one of the prompted
   kind (e.g. "find all the cats"). Trains object recognition + attention.
4. **Size** (`size`) — Same sprite at several scales; tap the biggest/smallest, or drag to
   order smallest→largest. Trains size recognition.
5. **Drawing** (`drawing`) — Full-canvas free draw with a chunky pixel brush, a small color
   palette, and an eraser/clear. Trains hand–eye coordination. Not persisted in Sprint 1.
6. **Memory** (`memory`) — Classic flip-card pairs; match two revealed cards. Trains
   concentration + memory. Board size scales with a difficulty setting.

## 9. Parent Mode & Child Mode

**Parent Mode (`/`)** — day-to-day entry point.
- First run: forces PIN creation before Child Mode can start.
- Settings: change PIN, toggle sound, enable/disable individual games, reset.
- Large **Start Play** action → enters Child Mode (triggers fullscreen request + wake lock).

**Child Mode (`/play`)** — the locked playroom.
- Game grid of enabled games, each a large pixel card.
- Chrome locked down: no text selection, no context menu, no pull-to-refresh,
  no double-tap zoom, fixed viewport, `overscroll-behavior: none`.
- **Exit gate:** a hidden corner zone; hold ≥ 3 s → 4-digit `PinPad` modal. Correct PIN
  exits fullscreen and returns to Parent Mode; wrong PIN dismisses and stays put.
- Fullscreen is progressive enhancement: when launched from the home screen the manifest
  `display` already gives a chrome-less window; the Fullscreen API is attempted on entry
  and its absence is non-fatal. Screen Wake Lock requested while playing (graceful no-op
  where unsupported).

## 10. PWA / Offline

- `app/manifest.ts`: name, short_name, `display: "standalone"` (fullscreen where safe),
  `background_color`/`theme_color` from palette, 192/512 + maskable icons, `start_url: /`.
- `public/sw.js`: precache the app shell on install; stale-while-revalidate for
  `/_next/static/*`; offline navigation fallback. Cache versioned by a build constant.
- Registration: `components/PwaRegister.tsx` (client) registers the SW and surfaces an
  "update available" path. Settings survive iOS PWA state jettison via `localStorage`.

## 11. Risks & Mitigations

- **iOS fullscreen limitations** → rely on manifest `display` + full-viewport CSS; treat the
  Fullscreen API as optional. Verify on iPad Safari, not just desktop.
- **iOS jettisons backgrounded PWAs** → all state in `localStorage`; app restores cleanly.
- **Next hashed asset caching** → SW uses runtime caching keyed on request, not build paths.
- **Canvas + touch on iOS** → Pointer Events, `touch-action: none` on the canvas only.
- **Child finds the exit gesture** → PIN required; long-press threshold and hidden zone.
- **Scope creep across six games** → shared engine first; each game is a thin, isolated module.

## 12. Resolved Decisions

1. **Sixth game: Memory** (flip-card pairs) — confirmed.
2. **Sound: synthesized Web Audio cues**, no audio files, default off — confirmed.
3. **App name: "Phòng Chơi"** — confirmed (manifest + icon + titles). Originally "Playroom".
4. **PIN policy:** 4 digits, created on first run, stored in `localStorage`. Explicitly
   lightweight protection, not real security — accepted.
5. **Difficulty:** fixed sensible defaults per game for Sprint 1 (no parent difficulty
   sliders). Parents may only enable/disable a game. Revisit after first playtesting.
6. **Language: Vietnamese only** — the app's sole UI language. `APP_NAME`, metadata,
   manifest, and every visible string are Vietnamese; `<html lang="vi">`. No locale
   switch or i18n library (a single locale does not justify the abstraction). The pixel
   font stack renders Vietnamese diacritics correctly, verified in-browser.

No open questions remain for Sprint 1.

---

## 13. Sprint 2 — Parent Controls, Fullscreen Lock, and Spoken Guidance

Approved direction (parent). Three changes to the shipped Sprint 1 app.

### 13.1 Objective

1. **Parent exit from the Child Mode grid.** `/play` is currently a dead end for the parent
   (only the hidden long-press corner exits). Add a visible **"Về nhà"** button, gated by the
   parent PIN, that returns to Parent Mode (`/`). Keep the hidden corner as a backup.
2. **Explicit fullscreen control.** Fullscreen is currently requested automatically, which
   browsers reject without a user gesture. Add a real **fullscreen button** (a gesture, so it
   works). Leaving fullscreen is **parent-only through the PIN gate** — the child cannot drop
   out of fullscreen.
3. **Spoken guidance (Vietnamese TTS).** Announce the goal when a game opens and again on each
   new round; speak the Vietnamese name of any item the child taps.

### 13.2 Success Criteria (testable)

- A visible "Về nhà" button on `/play` opens the PIN pad; correct PIN → `/`; wrong PIN → stays.
- The fullscreen button enters fullscreen on tap; while fullscreen, leaving it succeeds only
  after the correct PIN.
- With Âm thanh ON: opening a game speaks its goal; each new round/replay speaks the goal;
  tapping a colour speaks "màu …", an animal "con …", a shape "hình …", a revealed memory card
  its animal name; Matching speaks the shape name on tap.
- With Âm thanh OFF: no speech, no cues.
- Speech is Vietnamese (`lang: "vi-VN"`); each new utterance cancels the previous one so rapid
  taps never build a backlog.
- No in-app escape from Child Mode (back gesture trapped, context menu blocked, no select/zoom)
  — Sprint 1 behaviour preserved.
- Offline, PWA install, and all Sprint 1 checks still pass.

### 13.3 Design

**Parent gate (shared).** One PIN modal owned by the play layout and exposed through context
(`useParentGate()`), so the hidden corner, the visible "Về nhà" button, and the
fullscreen-exit all reuse the same gate instead of duplicating PIN logic.

**Fullscreen.** A fixed control in Child Mode requests
`documentElement.requestFullscreen()`. While `document.fullscreenElement` is set it offers
"Thoát toàn màn hình", which routes through the PIN gate before `exitFullscreen()`.

**Voice.** Device speech synthesis (`window.speechSynthesis`), no audio files. A small
`lib/speech.ts` picks a Vietnamese voice (prefers `vi-VN`), uses a slightly slow rate for
children, and cancels the previous utterance before speaking. Requires a prior user gesture;
entering a game is always a tap, so it is unlocked.

**Labels.** Vietnamese names for colours, animals, and shapes move out of the individual games
into one `lib/labels.ts`, because four games now need them for both speech and aria.

**Cues vs speech.** The per-tap beep is removed (it clashes with speech); the completion jingle
stays. Speech carries the content, the jingle marks progress.

**Default sound.** `soundEnabled` now defaults to **on** so spoken guidance works out of the
box; existing stored settings are untouched and the parent can turn it off in Cài đặt.

**Device lock (outside the app).** A web page cannot block the OS home gesture. A short
Vietnamese guide covers Android **screen pinning** and iPad **Guided Access** so the parent can
lock the tablet after launching the installed PWA.

### 13.4 Files

- New: `lib/speech.ts`, `lib/labels.ts`, `lib/labels.test.ts`,
  `lib/hooks/useExitToHome.ts`, `components/child/ParentGateProvider.tsx`,
  `components/child/HomeButton.tsx`, `components/child/FullscreenButton.tsx`,
  `docs/DEVICE_SETUP.md`
- Changed: `app/play/layout.tsx`, `app/play/page.tsx`, `components/child/ExitCorner.tsx`,
  `components/child/GameShell.tsx`, `lib/config.ts`, and the five games that speak
  (matching, color, animal, memory, size).

### 13.5 Testing Strategy

Vitest remains the level for pure logic. New tests cover `lib/labels.ts`: every shape, animal,
and colour has a Vietnamese label, and the phrase builders produce "màu …", "con …", "hình …".
Speech, fullscreen, and the PIN gate are verified by hand in the browser, and on a real device
for fullscreen.

### 13.6 Boundaries (delta)

- **Always:** gate every Child Mode exit (home, fullscreen-out) behind the PIN; keep speech
  behind the Âm thanh setting; keep screen-reader labels Vietnamese.
- **Ask first:** adding any dependency (none expected — speech, fullscreen, and the PIN gate
  reuse the platform and existing code).
- **Never:** play speech when the parent has sound off; ship recorded audio assets; claim the
  app can block OS-level gestures.

### 13.7 Out of Scope

Per-game difficulty, drawing persistence, English/second language, analytics, and any backend
remain out of scope.

### 13.8 Open Questions

None — all four decisions were confirmed before this spec.

---

## 14. Sprint 3 — Real-World Imagery, Fullscreen Drawing Board, Human Voice

Requested by the parent. Three upgrades to the shipped Sprint 2 app.

### 14.1 Objective

1. **Real-world imagery.** Replace the hand-coded pixel sprites with real
   images downloaded from the internet (not AI-generated): real animal photos
   and clean, colourful shape/icon SVGs a 1.5–5 year old recognises from real
   life.
2. **Fullscreen drawing board.** The drawing canvas is a fixed 720×480 bitmap
   capped at max-w-3xl; in fullscreen it stays a small rectangle. The board
   must fill the available screen (width and height), windowed and fullscreen.
3. **Human-sounding Vietnamese voice.** Device speechSynthesis picks whatever
   vi-VN voice the device ships — often a robotic fallback, sometimes none, so
   words get mangled. Spoken words must come from pre-recorded neural TTS
   audio, female Vietnamese voice, committed to the repo (the app stays
   offline-first).

### 14.2 Assumptions (confirm or correct)

1. **Animal photos:** downloaded from Wikimedia Commons (real photographs,
   CC0 / CC BY / CC BY-SA, attributed in docs/ASSETS.md).
2. **Shapes and game icons:** flat, child-friendly SVGs from Twemoji
   (CC-BY 4.0) — abstract shapes have no meaningful "real photo", and Twemoji
   SVGs are downloaded internet assets, not generated ones.
3. **Voice:** Microsoft Edge neural voice vi-VN-HoaiMyNeural (female),
   generated once with the edge-tts CLI; ~40 small MP3s committed under
   public/speech/. This reverses the Sprint 2 rule "never ship recorded audio
   assets": that rule assumed open-ended speech; the vocabulary is a closed
   set of ~40 short phrases, so files win.
4. PWA app icons (192/512) stay as they are (branding, not game content).
5. speechSynthesis remains only as fallback for a phrase with no audio file
   (preferring a female vi voice there too).

### 14.3 Success Criteria (testable)

- Every animal, shape, and game icon is a real downloaded asset under
  public/assets/; no inline pixel grids and no AI-generated images remain in
  games. docs/ASSETS.md lists every file with source URL and licence.
- Drawing board fills the available width AND height of the shell in windowed
  mode and fullscreen; existing strokes survive resize (entering fullscreen
  does not wipe the drawing); no 720/480 constants left in the pointer
  mapping.
- With Âm thanh ON: every spoken label and goal plays the pre-recorded female
  Vietnamese audio; a new spoken word cancels the previous one (no overlap,
  no backlog); a round goal plays after the current clip finishes.
- With Âm thanh OFF: no audio.
- Offline: after one online visit, images and speech clips play with the
  network off (SW precache covers public/assets/* and public/speech/*).
- npm run typecheck, lint, test, build all pass.

### 14.4 Design

**Imagery.** One asset map lib/assets.ts: sprite name → /assets/… file, plus
the SHAPE_NAMES / ANIMAL_NAMES lists moved out of lib/pixel/sprites.ts.
PixelSprite becomes GameImage — same props, but a plain <img src> instead of
the pixel-data-URL renderer. lib/pixel/ is deleted once nothing imports it.
Tap targets, layout, and game logic are untouched.

**Drawing board.** The canvas sizes its bitmap from its element: a
ResizeObserver sets canvas.width/height to the element CSS size; on resize
the old bitmap is snapshotted and redrawn onto the new one, so entering
fullscreen preserves strokes. Pointer mapping uses canvas.width/height
directly instead of constants.

**Voice.** lib/speech.ts keeps its exported API (speak, announce,
stopSpeaking, primeSpeech) so games and useSpeakGoal do not change.
Internally: a pure speechFile(text) maps the ~40 known phrases to
/speech/<slug>.mp3; the player replaces or chains a tiny queue (speak =
replace, announce = append) and falls back to the old speechSynthesis path
for unknown phrases. public/sw.js precaches the new asset and speech files.

### 14.5 Files

- New: lib/assets.ts, components/ui/GameImage.tsx, docs/ASSETS.md,
  public/assets/* (~19 files), public/speech/*.mp3 (~40 files),
  lib/speech-files.ts + test.
- Changed: lib/speech.ts, components/games/drawing/DrawingGame.tsx,
  public/sw.js, and the nine PixelSprite import sites (mechanical rename).
- Deleted: lib/pixel/sprites.ts, lib/pixel/render.ts, lib/pixel/sprite.ts.

### 14.6 Testing & Verification

- Vitest: speechFile mapping covers every game phrase (each label, each goal,
  unknown phrase → null).
- Manual: fullscreen draw (strokes survive), audio on tablet, airplane-mode
  offline run. Existing gates unchanged: typecheck / lint / test / build.

### 14.7 Boundaries (delta)

- **Always:** attribute every downloaded asset in docs/ASSETS.md; keep the
  app offline-capable after committing assets.
- **Ask first:** replacing PWA app icons; adding any npm dependency (none
  expected — voice files are generated once with a CLI, not shipped as a
  dependency).
- **Never:** ship AI-generated images for game content; fetch images or audio
  at runtime (all assets are committed).

### 14.8 Open Questions

1. Twemoji SVGs for shapes/icons + Commons photos for animals — acceptable
   split? (All-photo is not meaningful for abstract shapes.)
2. vi-VN-HoaiMyNeural female voice OK, or try vi-VN-NamMinhNeural (male) for
   comparison first?
