# Taste

## Workflow

- Invokes a `/spec-driven-development` workflow: expects a written spec first, then a plan, then a task list, with explicit approval gates before any code is written. Prefers front-loading requirements, priorities, architecture, and boundaries into a detailed spec document (e.g. `SPEC.md`, `tasks/plan.md`, `tasks/todo.md`) rather than ad-hoc implementation. Confidence: 0.85
- Keeps the repo clean after verification: deletes test artifacts (browser screenshots like `vi-*.png`, temp logs, `.playwright-mcp`), stops background servers, and confirms `git status` is tidy before wrapping up. Confidence: 0.65
- Verifies user-facing changes end-to-end in a real browser on a production build — plays through flows and captures screenshots — rather than relying on typecheck/lint/tests alone. Confidence: 0.6
- Architecture appetite is minimal: when offered a configurable option (e.g. i18n library + language toggle) vs. a single-locale in-place translation, chose the simplest path that fits current needs. Confidence: 0.5

## Localization & Audience

- Vietnamese speaker building products for Vietnamese-speaking children. Prefers user-facing UI text in Vietnamese — explicitly asked for Vietnamese as the main language of a kids' game app (titles, prompts, labels, metadata, `<html lang>`). Confidence: 0.7
