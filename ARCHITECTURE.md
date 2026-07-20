# Architecture

## Goals

This repository provides, per recruiting platform, a TypeScript library that knows how to pre-fill a job application form in the browser. It is designed to be:

- **Public** — hosted on GitHub, served through the jsDelivr CDN, and loaded into a Tampermonkey userscript via `@require`. No personal data (name, email, phone, work history, …) must ever appear in this repository.
- **Private on the user side** — each user writes a small local Tampermonkey userscript that `@require`s the library, then supplies their own information through a configuration object passed to `init(...)`. That local script is never committed here.

## Code/data separation

```
Public repository (GitHub -> jsDelivr)      User's machine (Tampermonkey)
------------------------------------        -------------------------------------
src/forms/smartrecruiters/*.ts       -->    // ==UserScript==
src/forms/<other-platform>/*.ts      -->    // @require https://cdn.jsdelivr.net/.../tampermonkey-autofill.js
  - fill logic                              // ==/UserScript==
  - selectors, autocomplete, etc.
  - NO personal data                        window.TMAutofill.SmartRecruiters.init({
                                              profile: { firstName: '...', ... },
dist/tampermonkey-autofill.js (bundle) -->    experiences: [...],
  published on a git tag                      educations: [...],
  bundles ALL platforms                     });
```

A single `@require` points at the one bundle: every new platform added under `src/forms/` is automatically included and exposed as a new property of `window.TMAutofill` (e.g. `TMAutofill.SmartRecruiters`, later `TMAutofill.<OtherPlatform>`), without changing the `@require` URL.

The file `examples/smartrecruiters.tampermonkey.example.js` shows the exact shape of that local userscript, with placeholder values only. It is the template a user copies into a new Tampermonkey script and personalizes.

## Project layout

```
src/
  global.d.ts              Global types (e.g. `unsafeWindow` provided by Tampermonkey)
  index.ts                 Root barrel -> dist/tampermonkey-autofill.js (window.TMAutofill)

  shared/                  Generic utilities, reusable across all platforms
    async.ts                 sleep(ms)
    text.ts                  norm() (accent-insensitive fuzzy comparison), textOf()
    dom/
      root.ts                getRootWindow() (unsafeWindow || window)
      events.ts              dispatchAll(), makeEvent(), keyboard()
      query.ts               deepQuery()/deepQueryAll(): recursive DOM + shadow DOM traversal
      value.ts               nativeSetValue(), humanTypeIntoFocusable(), clickElement()
    ui/
      notify.ts              createNotifier(), installAutofillButton(), observeAndReinstallButton()

  forms/
    <platform-name>/       One subfolder per recruiting site/platform
      types.ts               Shape of the expected data (Profile, Experience, ...) — no values
      utils/                 Utilities SPECIFIC to this platform
                             (data-test selectors, the site's web components, autocomplete, ...)
      fill/                  The actual fill logic
                             (one function per form section, plus fillAll)
      ui.ts                  Installation of the platform's floating button
      index.ts               Public entry point: init(config) / run(config)
```

Each platform under `src/forms/` covers one recruiting ATS (SmartRecruiters, SAP SuccessFactors, Cegid Talentsoft, …), not one specific company — the list of targeted companies lives in the `@match` rules of the user's local userscript, not in this repository.

### Why `utils/` and `fill/` are separate

- `utils/` — "how to interact with a field on this site": finding an element, setting a value inside a web component, picking an autocomplete option, handling a checkbox, a date, a phone number. Low-level building blocks with no notion of fill order.
- `fill/` — "what to fill, in which order, with which data" for a given form section (personal information, one experience, one education), plus the overall orchestration (`fillAll`).

For a future platform, this split makes it easy to find either "how this site handles its fields" (`utils/`) or "what happens when the button is clicked" (`fill/`).

## Public API of a platform

Each `src/forms/<platform>/index.ts` exposes at minimum:

```ts
export interface <Platform>Config { profile: ...; /* ... */ }

export function init(config: <Platform>Config): void;          // installs the floating button
export const run: (config: <Platform>Config) => Promise<void>; // fills immediately, no button
```

`init(config)` is what the local Tampermonkey userscript calls. No function in this repository reads personal data from a global variable: everything flows explicitly through `config`.

## Build and distribution

- The source is TypeScript (`src/**/*.ts`), checked with `npm run typecheck` (`tsc --noEmit`).
- `npm run build` (see `scripts/build.mjs`) uses esbuild to produce a **single** IIFE bundle at `dist/tampermonkey-autofill.js`, from `src/index.ts` which re-exports each `src/forms/<platform>`. The bundle exposes `window.TMAutofill.<Platform>` for each platform. One `@require` therefore covers every platform, including future ones.
- Releases are manual: the bundle is rebuilt, committed, and tagged (see the [Releasing](./README.md#releasing) section of the README), then served by jsDelivr from the tag.
- Always point `@require` at a **pinned tag or commit** rather than a branch (`@main`), so an update can never silently change the behavior of an installed userscript.

## Adding a new platform

1. Create `src/forms/<new-platform>/` with the structure `types.ts`, `utils/`, `fill/`, `ui.ts`, `index.ts` (use `smartrecruiters/` as a reference).
2. Reuse `src/shared/*` (deep DOM traversal, events, notifier, floating button) rather than duplicating those building blocks.
3. Never include personal data or a target company name in the code: everything goes through the `Config` object passed to `init()`. No change to `scripts/build.mjs` is needed — the new platform is included in `dist/tampermonkey-autofill.js` automatically once it is re-exported from `src/index.ts`.
4. Add a template in `examples/<new-platform>.tampermonkey.example.js`.
5. Update the README (supported platforms table).
