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

---

# Sprint 4

- [x] Task P1: Reliable tile input (useTap)
  - Acceptance: lib/hooks/useTap.ts runs the action on pointerup for every
    pointer (a second finger registers while the first rests on screen),
    ignores palm-sized contact areas, drops the derived click so nothing
    double-fires, and passes keyboard clicks; isPalm/isFreshClick are pure
    and tested.
  - Verify: npm run test
  - Files: lib/hooks/useTap.ts, lib/hooks/useTap.test.ts
- [x] Task P2: Responsive boards
  - Acceptance: .board-tile (min(24vmin, 16rem)) on Animal/Matching/Memory
    tiles; Color target/options and Size steps clamp to the viewport so both
    width and height bound them; SIZE_STEPS are relative weights; tap targets
    stay >= 64 px with no board overflow; touch-none on every game root.
  - Verify: npm run typecheck && npm run test && visual smoke
  - Files: app/globals.css, 5 game components, lib/logic/size.ts
- [x] Task P3: Playful goal phrasing
  - Acceptance: labels.goalPhrase builds "X ở đâu?"; the five games use it
    (Matching "Những hình giống nhau ở đâu?", Memory "Hai thẻ giống nhau ở
    đâu?"); speech-files.test.ts and scripts/gen-speech.mjs list the 18 new
    goals.
  - Verify: npm run test (slug mapping) + typecheck
  - Files: lib/labels.ts, lib/labels.test.ts, 5 game components,
    lib/speech-files.test.ts, scripts/gen-speech.mjs
- [x] Task P4: Voice clips + SW list
  - Acceptance: 18 new clips generated (vi-VN-HoaiMyNeural), 18 obsolete
    deleted, public/sw.js SPEECH_CLIPS updated, cache name bumped.
  - Verify: npm run test (clip existence) + ls public/speech
  - Files: public/speech/*, public/sw.js
- [x] Task P5: Verification
  - Acceptance: typecheck/lint/test/build pass; headless browser smoke: each
    game page renders, a tile tap through pointer events answers correctly,
    boards fill the wide viewport without scrolling.
  - Verify: npm run typecheck && npm run lint && npm run test && npm run build
  - Files: none
- [x] Task P6: Commit + push main
  - Acceptance: one commit with all Sprint 4 changes, pushed to origin main
    (explicitly requested by the parent).
  - Verify: git log -1 && git push output
  - Files: none

## Sprint 4 verification log (2026-10-07)

- Gates: typecheck / lint / test (47, +5 new) / build all pass clean.
- Audio: all 18 new "ở đâu?" clips generated with vi-VN-HoaiMyNeural, 18
  obsolete goal clips deleted, public/speech holds exactly the 40 clips the
  speech-files test expects; public/sw.js list parity checked (40/40, no
  missing/extra) and cache bumped to v5.
- Production server smoke: all six /play routes and a new goal clip return
  200; every page prerendered in the build.
- NOT yet verified (needs the parent's devices): the palm-rest + second-finger
  tap on a real touchscreen (WebKit multi-touch is the bug being fixed and has
  no desktop simulation), board proportions on the real wide tablet, and an
  airplane-mode offline run with the new SW cache.

## Sprint 5 tasks

- [x] Task S5-P1: Speech ended-callbacks + playPraise
  - Acceptance: speak/announce accept an optional ended callback; playPraise
    announces a random praise and fires onDone after the clip (or ~600 ms
    with sound off); 5 s watchdog guarantees the callback.
  - Verify: npm run typecheck
  - Files: lib/speech.ts, lib/labels.ts
- [x] Task S5-P2: Game wiring + pop CSS
  - Acceptance: correct picks pop (tile-won) in all five games; Color/Size
    lock input while praise plays; next round/goal/celebration starts only
    after praise; Animal/Memory images fill their tiles (Matching keeps the
    72% shape inset).
  - Verify: npm run typecheck && npm run lint && visual check
  - Files: app/globals.css, the five game components
- [x] Task S5-P3: Remove hidden corner exit
  - Acceptance: ExitCorner and its layout mount are gone, useLongPress
    deleted, GameShell header padding lost its corner accommodation;
    remaining exits stay PIN-gated.
  - Verify: rg finds no ExitCorner/useLongPress references; typecheck
  - Files: app/play/layout.tsx, components/child/GameShell.tsx,
    components/child/ExitCorner.tsx (deleted), lib/hooks/useLongPress.ts
    (deleted)
- [x] Task S5-P4: Praise clips + SW list + test
  - Acceptance: the three praise clips generated in the Sprint 3/4 voice and
    committed (43 total); scripts/gen-speech.mjs, public/sw.js (cache v6),
    and lib/speech-files.test.ts list them.
  - Verify: npm run test (clip existence) + ls public/speech
  - Files: public/speech/dung-roi.mp3, public/speech/con-gioi-qua.mp3,
    public/speech/tuyet-voi.mp3, scripts/gen-speech.mjs, public/sw.js,
    lib/speech-files.test.ts
- [x] Task S5-P5: Verification
  - Acceptance: full gate (typecheck/lint/test/build) passes; manual smoke:
    correct pick pops, praise plays in full, next round waits, corner gone.
  - Verify: npm run typecheck && npm run lint && npm run test && npm run build
  - Files: none

## Sprint 5 verification log (2026-10-07)

- Gates: typecheck / lint / test (47) / build all pass clean.
- Audio: the 3 praise clips generated with vi-VN-HoaiMyNeural (exact 11,232
  bytes each, MPEG layer III); speech-files test maps all 43 phrases to
  committed clips; public/sw.js precache updated and cache bumped to v6; no
  stale v5 references.
- Build smoke: "h-full w-full" and "tile-won" present in the games chunk;
  "Giữ để thoát" and "useLongPress" absent from the entire build; /play
  pages client-render after hydration (useConfig gates SSR), so live-server
  HTML probes were inconclusive — served-page status codes for the six
  routes and 3 clips remain unchecked (approval reviewer hit a 429 rate
  limit; the sandbox also denies listening sockets).
- Bugfix (parent report, 2026-10-08): the fullscreen button lost its escape
  state after game -> list -> game navigation. Root cause: isFullscreen was
  a one-shot read plus a single fullscreenchange listener, so an event
  missed around a route mount (or an engine that fires only the webkit
  variant) stuck the label for the whole session — reproduced live in the
  in-app browser. Fix: derive it with useSyncExternalStore (snapshot
  re-read at every mount/subscribe + fullscreenchange and
  webkitfullscreenchange). Gates re-run: typecheck / lint / test / build
  pass; browser check confirms the label follows enter/exit events and
  re-reads correctly on every navigation.
- NOT yet verified (needs the parent's devices): the actual praise playback
  (Sprint 6 tasks appended below)

## Sprint 6 tasks

- [x] Task S6-P1: Square imagery + new photos
  - Acceptance: fetch script gains VN-first query chains, licence filter,
    sips square crop ≤ 640 px; 6 new animal, 18 fruit/veg, 18 vehicle jpgs
    + icon-fruit/icon-vehicle svg downloaded; existing photos square-cropped;
    docs/ASSETS.md regenerated.
  - Verify: sips dims check + contact sheet eyeball
  - Files: scripts/fetch-images.mjs, public/assets/*, docs/ASSETS.md
- [x] Task S6-P2: Voice clips for every new item
  - Acceptance: 84 new clips (42 labels + 42 goals) generated in the same
    neural voice and committed.
  - Verify: ls public/speech | wc + speech-files test
  - Files: scripts/gen-speech.mjs, public/speech/*
- [x] Task S6-P3: Rau quả & Xe cộ games
  - Acceptance: assets/labels/name lists for 12 animals + 18 + 18 items;
    FruitGame/VehicleGame components reuse buildAnimalScene; registry
    entries with icons; grid + toggles pick them up.
  - Verify: npm run typecheck && npm run test
  - Files: lib/assets.ts, lib/labels.ts, lib/labels.test.ts, 2 components,
    lib/games/registry.ts, lib/speech-files.test.ts
- [x] Task S6-P4: SW precache
  - Acceptance: sw.js precaches /play/fruit, /play/vehicle, all new images
    and clips; cache bumped to v7.
  - Verify: rg counts + offline build
  - Files: public/sw.js
- [x] Task S6-P5: Verification
  - Acceptance: gates pass; browser smoke of both new games (goal speech,
    tap speech, praise, win, toggles).
  - Verify: npm run typecheck && npm run lint && npm run test && npm run build
  - Files: none
  + advance-after-praise pacing on a real screen, pop animation feel, and an
  airplane-mode run pulling the 3 new clips through the v6 cache.

## Sprint 6 verification log (2026-10-08)

- S6-P1 imagery: 48 photos (6 original + 42 new) all 1:1 and <= 640 px
  (checked with sips); 2 new Twemoji game icons; docs/ASSETS.md regenerated.
  Fixed a latent bug in scripts/fetch-images.mjs: searchPhoto() referenced an
  out-of-scope `item`, so the VN-context Commons search silently threw and
  every item fell back to the article lead image. Now takes the item.
- S6-P2 voice: 84 new clips generated with vi-VN-HoaiMyNeural (edge-tts), 127
  total; the speech-files test asserts all 127 exist on disk.
- S6-P3 code: asset map + ANIMAL_NAMES (now 12) + FRUIT_VEG_NAMES (18) +
  VEHICLE_NAMES (18); label maps + fruitVegLabel/vehicleLabel lookups;
  registry gains fruit/vehicle. Deviation from "thin clone": AnimalGame's board
  was extracted into one shared components/games/find/FindGame.tsx, so
  AnimalGame/FruitGame/VehicleGame are 5-line wrappers over it (less code than
  three near-identical copies). Behaviour of the animal game is unchanged.
- S6-P4 sw.js: precache lists regenerated from disk (63 assets, 127 clips),
  /play/fruit + /play/vehicle added, cache bumped v6 -> v7.
- S6-P5 gates: typecheck / lint / test (49) / build all pass clean; build
  prerenders 8 game routes.
- Browser smoke (production server, headless Chromium): grid lists all 8 games
  including Rau quả and Xe cộ; Parent Mode toggles list both; /play/fruit and
  /play/vehicle render 12 tiles, 3 targets, 0 broken images, and play through
  to the "Hoan hô!" celebration on pointerup; a goal clip
  (/speech/hai-the-giong-nhau-o-dau.mp3) is served 200; the animal game still
  wins with the 12-animal pool.
- NOT yet verified (needs the parent's devices): the real iPad/Android pass —
  audible voice quality, square-crop framing on a real screen, and an
  airplane-mode run through the v7 cache.
- Uncommitted stray artifacts in public/assets: manifest.json (the fetch
  script's download cache — useful if re-running the script) and
  contact-sheet.html (an S6-P1 eyeball scratch file). Neither is referenced by
  the app; decide whether to commit manifest.json or gitignore both.

## Sprint 7 tasks

- [x] Task S7-P1: Board-size model
  - Acceptance: lib/config.ts exports BOARD_SIZES (4,6,9,12,16) and
    findBoardSize (default 12); parseConfig rejects values outside the set;
    buildAnimalScene(pool, tileCount, rng) yields exactly tileCount tiles and
    max(1, round(tileCount/4)) targets, ids unique, pool-only; a pure helper
    maps a size to { cols, rows }.
  - Verify: npm run test
  - Files: lib/config.ts, lib/storage.ts, lib/storage.test.ts,
    lib/logic/animalScene.ts, lib/logic/animalScene.test.ts,
    lib/logic/boardSize.ts, lib/logic/boardSize.test.ts
- [x] Task S7-P2: FindGame wiring + board CSS
  - Acceptance: FindGame reads findBoardSize from useConfig(), passes the tile
    count to buildAnimalScene, and sets --cols/--rows on the grid; .board-tile
    sizes from those vars so 4/6/9/12/16 all fit without scrolling and stay
    >= 64 px; tap/speech/praise behaviour unchanged.
  - Verify: npm run typecheck && browser smoke at all 5 sizes
  - Files: components/games/find/FindGame.tsx, app/globals.css
- [x] Task S7-P3: Homepage blocks
  - Acceptance: GameToggles renders a block grid (icon + title + Bật/Tắt) not
    a full-width list; SettingsForm renders its actions as blocks; a new
    BoardSizeSetting block offers the 5 sizes and persists the pick; toggle,
    sound and change-PIN behaviour unchanged.
  - Verify: npm run typecheck && npm run lint && browser check
  - Files: components/parent/GameToggles.tsx, components/parent/SettingsForm.tsx,
    components/parent/BoardSizeSetting.tsx, app/page.tsx
- [x] Task S7-P4: Verification
  - Acceptance: typecheck / lint / test / build pass; browser smoke: each size
    renders and fits, the size persists across reload, toggles and settings
    still work.
  - Verify: npm run typecheck && npm run lint && npm run test && npm run build
  - Files: none

## Sprint 7 verification log (2026-10-08)

- Gates: typecheck / lint / test (57, +8) / build all pass clean.
- Unit tests: `boardSize` (offered sizes, layout per size, target mapping),
  `animalScene` at every size, and `storage` rejecting an out-of-range
  `findBoardSize`.
- Browser smoke (headless Chromium, isolated production build on :3100):
  - Parent Mode renders the games as an 8-block grid and the Cài đặt actions
    as blocks; the Số ô row offers 5 chips; clicking "9" persists it
    (localStorage 9 and aria-pressed true after reload).
  - `/play/animal` at 4/6/9/12/16 renders exactly that many tiles, columns
    2/3/3/4/4 and targets 1/2/2/3/4 (counter "0 / n" and "n / n").
  - Tiles: 108-192 px at 1280x800, 72-144 px at 390x844 — all >= 64 px; no
    vertical overflow and no board-level horizontal overflow at either size.
  - Playing each size to the win: all five boards reach "Hoan hô!" with no
    page errors.
- Deviation from the draft (recorded in SPEC.md 18.4): board tiles bound width
  and height on separate axes (`74vw` / `54dvh`) instead of `vmin`, which sized
  too conservatively on a tall narrow phone; Matching/Memory keep the original
  `.board-tile` sizing under a `.find-board` scope.
- Found, pre-existing and NOT introduced here: the GameShell header overflows
  ~163 px on a 390 px viewport (identical on the unchanged `/play/memory` and
  `/play/matching`). Out of scope for Sprint 7; flag to the parent.

