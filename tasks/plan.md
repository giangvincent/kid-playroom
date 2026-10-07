# Plan: Children's Concentration Playroom — Sprint 1

Derived from `SPEC.md` (approved). This is the Phase 2 artifact: the technical approach,
dependency order, verification checkpoints, and risks. The task list lives in `tasks/todo.md`.

## Strategy

Build a shared foundation once, then thin, isolated game modules on top of it. Ship an
end-to-end vertical slice early (engine + Matching + Child shell + exit gate) so the risky
parts — fullscreen, touch locking, the parent gate — are proven on a real tablet before the
remaining five games are written. PWA/offline is last because it wraps a working app.

## Components & Dependencies

```
Foundation
  T1 Scaffold ──────────────► everything
  T2 Theme + globals + cx ──► T5, all UI
  T3 Pixel sprites ─────────► T5 (PixelSprite), all games
  T4 Config/storage/store ──► T6, T9, T10, all games
  T5 UI primitives ─────────► T6, T8, T9, T10, all games
  T6 Audio cues ────────────► all games

Vertical slice
  T7 Engine + route + shell ◄─ T2,T3,T4,T5,T6 ──► T8, all games
  T8 Matching game          ◄─ T7
  T9 Child home + grid      ◄─ T7,T8
  T10 Exit gate/fullscreen/PIN ◄─ T4,T5,T8,T9
  T11 Parent Mode + PIN setup  ◄─ T4,T5,T10

Remaining games (independent of each other; each needs only T7)
  T12 Color   T13 Animal   T14 Size   T15 Drawing   T16 Memory

PWA + hardening
  T17 Manifest + icons      ◄─ T1
  T18 Service worker + register ◄─ T17, T9
  T19 Polish + device verification ◄─ all
```

## Implementation Order

Foundation T1→T6, then the slice T7→T11, then games T12→T16 in any order, then PWA T17→T18,
then T19. Games T12–T16 are the only truly parallelizable block.

## Verification Checkpoints

- **CP1 — Foundation (after T6):** `npm run dev` renders a styled page containing a scaled
  `PixelSprite`; `typecheck`, `lint`, `test` all green.
- **CP2 — Vertical slice (after T11):** launch Child Mode, play Matching to completion, exit
  via long-press → PIN, manage settings in Parent Mode. `npm run build` green.
- **CP3 — All games (after T16):** all six reachable from the grid and playable.
- **CP4 — PWA (after T19):** installable on iPad + Android; airplane-mode relaunch plays
  every game; all `SPEC.md` success criteria checked on device.

## Risks (from SPEC §11)

- iOS fullscreen quirks → manifest `display` + full-viewport CSS; Fullscreen API optional.
- iOS jettisons PWAs → all state in `localStorage`, clean restore. **Mitigated in T4.**
- Next hashed asset caching → SW runtime caching, not build paths. **T18.**
- iOS canvas touch → Pointer Events, `touch-action: none` on canvas only. **T15.**
- Child discovers the gate → PIN required + hidden zone + long-press threshold. **T10.**
- Six-game scope creep → shared engine first; each game is a small isolated module.

## Out of Scope (Sprint 1)

Backend/accounts, cross-device sync, drawings persistence (IndexedDB), scoring/leaderboards,
localization, parent difficulty sliders, custom uploaded sprites, analytics/ads.

---

# Sprint 2 Plan — Parent Controls, Fullscreen Lock, Spoken Guidance

Derived from `SPEC.md` §13. Adds a shared parent gate + fullscreen control, and Vietnamese
speech to the games. Task list in `tasks/todo.md`.

## Strategy

Build the two primitives first — Vietnamese labels (`lib/labels.ts`) and speech
(`lib/speech.ts`) — then the shared parent gate and fullscreen control, wire them once in the
play layout, then let the five games consume them. Games are thin, so they change little. Docs
and verification last. The risky parts (audio unlock, fullscreen gesture, gate reuse) are all
proven at checkpoint CP-S2 before the games are touched.

## Components & Dependencies

```
Voice foundation
  S1 labels + tests ──► S8,S9,S10 (games), S2 (speech phrases)
  S2 speech + trim cues ──► S8,S9,S10
  S3 default sound on (config)

Parent gate & fullscreen
  S4 ParentGateProvider ◄─ PinPad (existing) ──► S5, S6, S7
  S5 ExitCorner onto the gate ◄─ S4
  S6 HomeButton + FullscreenButton ◄─ S4
  S7 play layout + home button + header pad ◄─ S4,S5,S6

Games speak
  S8 Matching + Memory ◄─ S1,S2
  S9 Color + Animal   ◄─ S1,S2
  S10 Size goal speech ◄─ S1,S2

  S11 docs/DEVICE_SETUP.md (independent)
  S12 browser + device verification ◄─ all
```

## Implementation Order

S1 → S2 → S3 → S4 → S5 → S6 → S7 → S8 → S9 → S10 → S11 → S12. S11 is independent and can
land any time; S8–S10 are independent of each other once S1/S2 exist.

## Verification Checkpoints

- **CP-S1 (after S3):** label tests green; speech module compiles; new installs default to
  sound on.
- **CP-S2 (after S7):** in the browser — hidden corner, visible "Về nhà", and fullscreen-exit
  all pass the same PIN gate; the fullscreen button actually enters fullscreen; wrong PIN
  leaves the child in place.
- **CP-S3 (after S10):** with sound on, every speaking game announces its goal on open and on
  each new round, and names the tapped item; with sound off there is silence.
- **CP-S4 (after S12):** `typecheck`, `lint`, `test`, `build` pass; Sprint 1 behaviour
  (offline, gate, targets) still holds; device guide reviewed.

## Risks & Mitigations

- **No Vietnamese voice on the device** → speech falls back to the device's default voice, or
  stays silent if there is none. The device guide explains how to install a Vietnamese voice;
  the app degrades quietly, never to broken audio.
- **Speech blocked before a user gesture** → games are always entered by a tap, so it is
  unlocked; if still blocked, it fails quietly.
- **iPad Safari fullscreen limits** → the button works where supported; installed-PWA
  `display: standalone` covers the rest.
- **Overlapping audio** → cancel-before-speak, and the per-tap beep is dropped.
- **Top-right fullscreen button colliding with GameShell's "Chơi lại"** → pad the header.

## Out of Scope (Sprint 2)

Per-game difficulty, drawing persistence, English/second language, analytics, backend,
recorded audio assets, and any OS-level gesture blocking.

---

# Sprint 3 Plan — Real Imagery, Fullscreen Drawing, Human Voice

Derived from SPEC.md section 14 (pending approval). Tasks live in tasks/todo.md.

## Strategy

Three independent seams, orderable by risk: the voice swap is the one users
hear (do it first), the image swap is the widest mechanical diff (second, it
is mostly rename), the drawing board is a small self-contained fix (last).
Asset downloads need network escalation; everything else is local.

## Components & Dependencies

    S1 Voice files + player   (public/speech/*.mp3, lib/speech-files.ts, lib/speech.ts, sw.js)
    S2 Real images            (public/assets/*, lib/assets.ts, GameImage, delete lib/pixel, sw.js)
    S3 Drawing board fill     (DrawingGame.tsx only)
    S4 Verification           (gates + offline + on-device)

S1 and S2 are independent; S3 is independent. sw.js is touched by S1 and S2 —
one combined precache list update per task, merged trivially.

## Order & checkpoints

1. S1 -> checkpoint: audio plays locally in dev, mapping test green.
2. S2 -> checkpoint: gates pass, sprites fully gone (rg finds no importer).
3. S3 -> checkpoint: manual windowed + fullscreen draw, strokes survive resize.
4. S4 -> full gates + airplane-mode run + tablet audio/draw pass.

## Risks

- **Asset licensing** -> only CC0/CC BY/CC BY-SA sources; docs/ASSETS.md lists
  every file + source URL. CC BY-SA files are acceptable for a private,
  non-distributed app but are flagged in the doc.
- **edge-tts availability** (network, endpoint drift) -> generate once, commit
  MP3s; the documented CLI command in docs/ASSETS.md allows regeneration; if
  edge-tts fails, fall back to any neural vi voice the parent prefers.
- **Twemoji shapes too cartoonish for "real"** -> flagged as open question;
  swap source later touches only the files, not code (name -> file map).
- **Drawing resize loops** -> ResizeObserver writes only when the element size
  actually differs from the bitmap; no state, no re-render.
