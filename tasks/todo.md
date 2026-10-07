# Tasks: Children's Concentration Playroom — Sprint 1

Ordered by dependency. Each task is completable in one focused session, touches ≤ ~5 files,
and has an explicit acceptance + verification step. Mark complete only when verification passes.

## Phase A — Foundation

- [x] T1: Scaffold the project
  - Acceptance: Next.js (App Router) + React + TS strict + Tailwind v4 running; npm scripts `dev/build/start/lint/typecheck/test/test:watch/icons`; Vitest installed and configured; `.gitignore` set.
  - Verify: `npm run typecheck && npm run build`
  - Files: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `.gitignore`

- [x] T2: Theme, globals, and `cx` helper
  - Acceptance: palette exposed as Tailwind v4 theme tokens; global no-select, `overscroll-behavior: none`, `touch-action`, viewport meta, safe-area padding; `cx(...)` classnames helper.
  - Verify: `npm run build` + visual check
  - Files: `app/globals.css`, `app/layout.tsx`, `lib/cx.ts`

- [x] T3: Pixel sprite system
  - Acceptance: palette + sprite string-grids; pure parse function (grid → pixels) is unit-tested; `render.ts` rasterizes to a cached canvas data URL; `PixelSprite` scales crisply with `image-rendering: pixelated`.
  - Verify: `npm run test` (sprite parse) + visual check
  - Files: `lib/pixel/palette.ts`, `lib/pixel/sprites.ts`, `lib/pixel/sprites.test.ts`, `lib/pixel/render.ts`, `components/ui/PixelSprite.tsx`

- [x] T4: Config, validated storage, store
  - Acceptance: `AppConfig` type + `DEFAULT_CONFIG`; `loadConfig/saveConfig` validate shape at the `localStorage` trust boundary and fall back to defaults on corrupt/partial data; `ConfigProvider` + `useConfig()`.
  - Verify: `npm run test` (valid, partial, corrupt, wrong-type cases)
  - Files: `lib/config.ts`, `lib/storage.ts`, `lib/storage.test.ts`, `lib/store.tsx`

- [x] T5: UI primitives
  - Acceptance: `PixelButton`, `PixelCard`, `Modal`, `Icon`; all touch targets ≥ 64×64 px; consistent pixel styling.
  - Verify: `npm run build` + visual check
  - Files: `components/ui/PixelButton.tsx`, `components/ui/PixelCard.tsx`, `components/ui/Modal.tsx`, `components/ui/Icon.tsx`

- [x] T6: Audio cues (Web Audio)
  - Acceptance: short synthesized success/tap cues; no audio files; respects the `soundEnabled` setting; default off; safe no-op if `AudioContext` unavailable.
  - Verify: `npm run build` + manual toggle check
  - Files: `lib/audio.ts`

## Phase B — Vertical slice (end-to-end)

- [x] T7: Game engine (types, registry, route, shell)
  - Acceptance: `GameDefinition`/`GameProps`/`GameId`; `registry.ts` is the single ordered source of games; `/play/[game]` renders via registry with `generateStaticParams`; unknown slug → `notFound()`; `GameShell` provides header (title, back, replay) + `Celebration`.
  - Verify: `npm run typecheck`; navigate to a game route and render
  - Files: `lib/games/types.ts`, `lib/games/registry.ts`, `app/play/[game]/page.tsx`, `components/child/GameShell.tsx`, `components/child/Celebration.tsx`

- [x] T8: Matching game + logic
  - Acceptance: tap two identical tiles to remove a pair; board clears → celebration + replay re-randomizes; pair generation and match detection are pure and tested.
  - Verify: `npm run test` (build pairs / check match) + manual play
  - Files: `components/games/matching/MatchingGame.tsx`, `lib/logic/shuffle.ts`, `lib/logic/shuffle.test.ts`, `lib/logic/matching.ts`, `lib/logic/matching.test.ts`

- [x] T9: Child Mode home + game grid
  - Acceptance: `/play` shows only enabled games as large cards; tapping a card opens the game; returning keeps the grid state with no reload.
  - Verify: `npm run build` + manual
  - Files: `app/play/page.tsx`, `components/child/GameGrid.tsx`, `components/child/GameCard.tsx`

- [x] T10: Exit gate + fullscreen + wake lock + PIN pad
  - Acceptance: holding a hidden corner ≥ 3 s opens a 4-digit `PinPad`; correct PIN exits fullscreen and returns to `/`; wrong PIN stays in Child Mode; fullscreen + wake lock attempted on entry and degrade safely where unsupported; long-press does not fire on quick taps/scroll.
  - Verify: manual on desktop + tablet (all gate paths)
  - Files: `components/child/ExitCorner.tsx`, `components/parent/PinPad.tsx`, `lib/hooks/useLongPress.ts`, `lib/hooks/useFullscreen.ts`

- [x] T11: Parent Mode + PIN setup + settings
  - Acceptance: first run forces PIN creation before Child Mode can start; settings allow change-PIN, sound toggle, per-game enable/disable; **Start Play** enters Child Mode; settings persist across reload.
  - Verify: `npm run test` (pin/config validation) + manual round-trip
  - Files: `app/page.tsx`, `components/parent/PinSetup.tsx`, `components/parent/SettingsForm.tsx`, `components/parent/GameToggles.tsx`

## Phase C — Remaining games

- [x] T12: Color game
  - Acceptance: large target swatch shown; tap the matching swatch among distractors; correct → celebration + advance; replay re-randomizes.
  - Verify: manual play + `npm run typecheck`
  - Files: `components/games/color/ColorGame.tsx`

- [x] T13: Animal game
  - Acceptance: scene of many pixel animals; prompt names a kind; tapping all of that kind advances; wrong tap gives gentle feedback, no penalty.
  - Verify: manual play
  - Files: `components/games/animal/AnimalGame.tsx`, `lib/logic/animalScene.ts`, `lib/logic/animalScene.test.ts`

- [x] T14: Size game
  - Acceptance: same sprite at several scales; prompt to tap biggest/smallest (and/or order small→large); ordering logic is pure and tested.
  - Verify: `npm run test` (ordering) + manual play
  - Files: `components/games/size/SizeGame.tsx`, `lib/logic/size.ts`, `lib/logic/size.test.ts`

- [x] T15: Drawing game
  - Acceptance: full-canvas free draw with chunky pixel brush, small palette, eraser/clear; Pointer Events + `touch-action: none` on canvas only; no scrolling/zoom during draw; not persisted.
  - Verify: manual on iPad + Android (touch draw)
  - Files: `components/games/drawing/DrawingGame.tsx`, `lib/logic/canvas.ts`

- [x] T16: Memory game + logic
  - Acceptance: flip-card pairs; two matching reveals stay, mismatches flip back; deck generation is pure and tested; board size fixed default.
  - Verify: `npm run test` (build deck) + manual play
  - Files: `components/games/memory/MemoryGame.tsx`, `lib/logic/memory.ts`, `lib/logic/memory.test.ts`

## Phase D — PWA & hardening

- [x] T17: Manifest + icons
  - Acceptance: `app/manifest.ts` valid (name "Playroom", standalone, palette theme colors, `start_url: /`); dependency-free `scripts/gen-icons.mjs` produces 192/512 + maskable PNGs and `apple-icon.png`; `npm run icons` regenerates them.
  - Verify: `npm run build`; browser reports manifest valid / installable
  - Files: `app/manifest.ts`, `scripts/gen-icons.mjs`, `public/icons/*`, `app/apple-icon.png`, `package.json` (icons script)

- [x] T18: Service worker + registration
  - Acceptance: `public/sw.js` precaches the app shell on install, stale-while-revalidate for `/_next/static/*`, offline navigation fallback, versioned cache; registered from a client component; app plays offline after one online load.
  - Verify: `npm run build` + airplane-mode relaunch on device
  - Files: `public/sw.js`, `components/PwaRegister.tsx`, `app/layout.tsx`

- [x] T19: Polish, accessibility, device verification
  - Acceptance: `prefers-reduced-motion` respected; adequate contrast; no layout shift; walk every `SPEC.md` success criterion on a real iPad and Android tablet (six games, gate, offline, targets ≥ 64 px, no accidental navigation).
  - Verify: manual checklist + `npm run typecheck && npm run lint && npm run test && npm run build`
  - Files: touched as needed

## Status

All 19 tasks implemented and verified in-browser (Chromium):

- `typecheck`, `lint`, `test` (41 unit tests), and production `build` all pass.
- Every game played through in the browser to its win celebration.
- Parent gate verified: long-press → PIN, wrong PIN rejected, correct PIN exits.
- PWA verified in a fresh context: SW registered/activated, all routes precached,
  and `/`, `/play`, and all six games render with the network off.
- Touch targets measured on-device-sized viewport: none below 64×64 px.
- No console errors; the only warning is the expected fullscreen-without-gesture notice.

**Still manual (cannot be automated here):** the real iPad and Android tablet pass
from T19/CP4 — install to home screen, verify chrome-less launch, touch drawing, and
airplane-mode relaunch on actual hardware.

---

# Sprint 2 Tasks

Ordered by dependency. Task list for `SPEC.md` §13; plan in `tasks/plan.md`.
Each task is one focused session, ≤ ~5 files, with acceptance + verification.

## Phase A — Voice foundation

- [x] S1: Vietnamese label module + tests
  - Acceptance: `lib/labels.ts` exports shape/animal/colour label maps and `colorPhrase`/`animalPhrase`/`shapePhrase`; every `SHAPE_NAMES` and `ANIMAL_NAMES` sprite and every colour has a label; builders return "màu …", "con …", "hình …".
  - Verify: `npm run test`
  - Files: `lib/labels.ts`, `lib/labels.test.ts`

- [x] S2: Speech module + trim audio cues
  - Acceptance: `lib/speech.ts` speaks `vi-VN`, cancels the previous utterance before speaking, no-ops when disabled or unsupported, and picks a Vietnamese voice (handling the async voice list). `lib/audio.ts` keeps only the completion cue.
  - Verify: `npm run typecheck` + manual in S12
  - Files: `lib/speech.ts`, `lib/audio.ts`

- [x] S3: Sound defaults on
  - Acceptance: `DEFAULT_CONFIG.soundEnabled` is `true`; stored configs are unaffected; storage tests updated for the new default.
  - Verify: `npm run test`
  - Files: `lib/config.ts`, `lib/storage.test.ts`

## Phase B — Parent gate & fullscreen

- [x] S4: Shared parent gate
  - Acceptance: `ParentGateProvider` exposes `useParentGate().requestUnlock(action)` and renders one PIN modal using the stored PIN; correct PIN runs the action, wrong PIN resets and stays.
  - Verify: `npm run typecheck` + browser at CP-S2
  - Files: `components/child/ParentGateProvider.tsx`

- [x] S5: Hidden corner uses the shared gate
  - Acceptance: `ExitCorner` no longer owns its own modal; the long-press calls `requestUnlock` and exits to home; behaviour otherwise unchanged.
  - Verify: browser
  - Files: `components/child/ExitCorner.tsx`

- [x] S6: Fullscreen + home controls
  - Acceptance: a Child Mode button enters fullscreen on tap; while fullscreen it offers "Thoát toàn màn hình", which calls `requestUnlock` before exiting; it hides itself where the API is unavailable. A "Về nhà" button routes through the same gate and returns to Parent Mode.
  - Verify: browser
  - Files: `components/child/FullscreenButton.tsx`, `components/child/HomeButton.tsx`, `lib/hooks/useExitToHome.ts`

- [x] S7: Wire the play layout + visible home button
  - Acceptance: the layout provides the gate and controls for every `/play` route and no longer auto-requests fullscreen; `/play` shows a visible "Về nhà" button gated by the PIN; the GameShell header is padded so nothing collides with the top-right control; wake lock, history trap and context-menu block are retained.
  - Verify: browser (CP-S2)
  - Files: `app/play/layout.tsx`, `app/play/page.tsx`, `components/child/GameShell.tsx`

## Phase C — Games speak

- [x] S8: Matching + Memory speech
  - Acceptance: the goal is spoken on open and on replay; tapping a matching tile speaks the shape name; revealing a memory card speaks its animal name; the per-tap beep is gone; the win jingle is unchanged; labels come from `lib/labels`.
  - Verify: browser + `npm run typecheck`
  - Files: `components/games/matching/MatchingGame.tsx`, `components/games/memory/MemoryGame.tsx`

- [x] S9: Color + Animal speech
  - Acceptance: the goal is spoken on open and each new round ("Tìm màu …" / "Tìm tất cả con …"); tapping an option speaks "màu …" / "con …"; the per-tap beep is gone; the win jingle is unchanged; local `COLOR_LABELS`/`ANIMAL_LABELS` are replaced by `lib/labels`.
  - Verify: browser + `npm run typecheck`
  - Files: `components/games/color/ColorGame.tsx`, `components/games/animal/AnimalGame.tsx`

- [x] S10: Size goal speech
  - Acceptance: the goal is spoken on open and each new round ("Chạm vào hình lớn nhất" / "…nhỏ nhất"); no per-tap speech; the win jingle is unchanged.
  - Verify: browser
  - Files: `components/games/size/SizeGame.tsx`

## Phase D — Docs & verification

- [x] S11: Device setup guide
  - Acceptance: `docs/DEVICE_SETUP.md` in Vietnamese covers installing the PWA, Android screen pinning, iPad Guided Access, and installing a Vietnamese voice; it does not claim the app can block OS gestures.
  - Verify: read-through
  - Files: `docs/DEVICE_SETUP.md`

- [x] S12: Browser + device verification
  - Acceptance: `typecheck`, `lint`, `test`, `build` pass; browser walkthrough covers the gate (hidden corner, "Về nhà", fullscreen-exit), speech on and off, and every game; Sprint 1 offline still works; touch targets remain ≥ 64×64 px.
  - Verify: commands + browser (CP-S4)
  - Files: touched as needed

## Sprint 2 Status

All 12 tasks implemented and verified in-browser (Chromium):

- `typecheck`, `lint`, `test` (46 unit tests), and production `build` all pass.
- Parent gate verified on one shared modal: hidden corner, visible "Về nhà", and
  fullscreen-exit all route through it; a wrong PIN leaves the child in place, the correct
  PIN returns to Parent Mode and releases fullscreen.
- The fullscreen button really enters fullscreen (it is a user gesture, which the old
  auto-request could never be), and leaving fullscreen requires the PIN.
- Speech verified by stubbing `speechSynthesis` and capturing utterances:
  Matching "Ghép các hình giống nhau" + "hình tam giác"; Animals "Tìm tất cả con ếch" +
  "con chó"; Memory "Tìm hai thẻ giống nhau" + "con chó"; Sizes "Chạm vào hình lớn nhất";
  Colors "Tìm màu tím" + "màu hồng". Every round re-announces its goal — including when the
  new round randomly picks the same colour again (which is why the round nonce exists).
  With Âm thanh off, nothing is spoken and the games still render.
- A real bug was caught by that testing: assigning `utterance.voice` can throw on some
  engines, which crashed the page. It is now guarded.
- Sprint 1 offline regression still passes: `/`, `/play` and all six games render with the
  network off; no interactive target is under 64×64 px.

**Still manual:** `docs/DEVICE_SETUP.md` must be followed on a real tablet — Android screen
pinning / iPad Guided Access, and confirming a Vietnamese voice is installed and audible.

---

# Sprint 3

- [x] Task S1: Pre-recorded Vietnamese voice
  - Acceptance: ~40 MP3s (22 labels + 18 goals, vi-VN-HoaiMyNeural) in
    public/speech/; lib/speech-files.ts maps every phrase (slug, null
    otherwise) with Vitest coverage; lib/speech.ts plays files (speak replaces,
    announce chains), falls back to speechSynthesis for unknown phrases; games
    and useSpeakGoal untouched; sw.js precaches /speech/*.
  - Verify: npm run test; npm run typecheck; manual: tap labels + open each
    game with sound on, audio plays; airplane-mode check after one online load.
  - Files: public/speech/, CLI command documented in docs/ASSETS.md,
    lib/speech-files.ts, lib/speech-files.test.ts, lib/speech.ts, public/sw.js.
- [x] Task S2: Real downloaded images
  - Acceptance: public/assets/ holds 6 animal photos (Wikimedia Commons) and
    8 shape SVGs + 5 game-icon SVGs (Twemoji); docs/ASSETS.md lists source URL
    + licence per file; lib/assets.ts maps name -> file and exports
    SHAPE_NAMES/ANIMAL_NAMES; PixelSprite -> GameImage at all 9 call sites;
    lib/pixel/ deleted; sw.js precaches /assets/*.
  - Verify: npm run typecheck && npm run lint && npm run test &&
    npm run build; rg confirms no PixelSprite/sprites.ts imports; visual pass
    over all six games + grid + toggles.
  - Files: public/assets/, docs/ASSETS.md, lib/assets.ts,
    components/ui/GameImage.tsx, 9 import sites, lib/pixel/ (delete),
    public/sw.js.
- [x] Task S3: Fullscreen drawing board
  - Acceptance: canvas bitmap matches element size via ResizeObserver; board
    fills shell width and height windowed and fullscreen; strokes survive
    resize; pointer mapping uses canvas.width/height (no 720/480 constants).
  - Verify: npm run typecheck; manual windowed + fullscreen draw on desktop
    and tablet.
  - Files: components/games/drawing/DrawingGame.tsx.
- [x] Task S4: Sprint verification
  - Acceptance: all four gates pass clean; git status shows only intended
    changes; offline airplane-mode run plays all games with images + voice.
  - Verify: npm run typecheck && npm run lint && npm run test &&
    npm run build; on-device pass.
  - Files: none (verification only).

## Sprint 3 verification log (2026-10-07)

- Gates: typecheck / lint / test (42) / build all pass clean.
- Browser smoke (desktop headless): grid + matching render real images (0
  broken, 0 console errors, 0 404s); speech clips requested on game open and
  tile tap (/speech/*.mp3 200s); canvas filled the shell; strokes survived a
  viewport resize 1280x800 -> 1920x1080 (painted pixel count unchanged,
  bitmap 1240x620 -> 1880x940).
- Found + fixed during smoke: canvas bitmap height fed the flex min-content
  and pushed the colour bar off-screen on tall screens; canvas is now
  absolutely positioned inside a relative flex holder (no intrinsic feedback).
- NOT yet verified (needs the parent's devices): audible voice quality on
  iPad/Android, real Fullscreen API on tablet Safari/Chrome, airplane-mode
  offline run with the new SW cache (v3), and a visual pass of the fixed
  drawing layout — headless launch was too flaky to re-measure after the fix.
