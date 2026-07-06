# TamperMonkey Autofill

A TypeScript library that pre-fills online job application forms, designed to be loaded into a [Tampermonkey](https://www.tampermonkey.net/) userscript via `@require`.

**This repository contains no personal data.** Your profile (name, email, phone, work history, education) lives exclusively in your local Tampermonkey userscript, which passes it to the library at runtime. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for details on the code/data separation and the project layout.

## Supported platforms

| Platform | Module | Notes |
|---|---|---|
| SmartRecruiters | `src/forms/smartrecruiters/` | Targets the SmartRecruiters "oneclick-ui" application flow, used by many companies (Sopra Steria, ALTEN, Devoteam, …) |

## How it works

1. This repository is public and served through the [jsDelivr](https://www.jsdelivr.com/) CDN, which serves files straight from GitHub tags — no build service or account required.
2. Your **personal** Tampermonkey userscript (which never leaves your machine) loads the library with `@require`, then passes your information to `window.TMAutofill.<Platform>.init(config)`.
3. The library installs a floating "Fill application" button on matching pages. On click, it fills the form with the data you provided and outlines any remaining invalid fields in red so you can review them. **It never submits the form automatically.**

## Installation (Tampermonkey)

1. Pick a tagged release of this repository (or of your fork) to pin.
2. Create a new Tampermonkey script from the template in [`examples/smartrecruiters.tampermonkey.example.js`](./examples/smartrecruiters.tampermonkey.example.js).
3. In the script header, adjust:
   - `@require` — the jsDelivr URL of the bundle, pinned to a tag:

     ```
     https://cdn.jsdelivr.net/gh/nicolas-goyon/TamperMonkeyAutofill@v1.0.0/dist/tampermonkey-autofill.js
     ```

     A single `@require` covers every platform in this repository, including ones added later.
   - `@match` — the application pages to target, e.g. `https://jobs.smartrecruiters.com/oneclick-ui/company/*/publication/*`
4. Fill in your information in the `window.TMAutofill.SmartRecruiters.init({ ... })` call.
5. Save. On an application page, click the floating button, then review every field before submitting.

Always pin an exact tag (`@v1.0.0`) rather than a branch or `@latest`, so an update can never change behavior without you opting in.

## Development

Requires Node.js.

```bash
npm install
npm run typecheck   # TypeScript check (tsc --noEmit)
npm run build       # bundle to dist/tampermonkey-autofill.js (esbuild)
npm run build:watch # rebuild on change
```

`npm run build` produces a single IIFE bundle containing every platform under `src/forms/*`, exposed as `window.TMAutofill.<Platform>` (e.g. `window.TMAutofill.SmartRecruiters`). New platforms are picked up automatically once re-exported from `src/index.ts` — the `@require` URL never changes.

## Releasing

Releases are manual: the built bundle is committed so jsDelivr can serve it from the tag.

```bash
npm run typecheck
npm run build
git add dist/
git commit -m "Release vX.Y.Z"
git tag vX.Y.Z
git push origin main vX.Y.Z
```

The bundle is then available at:

```
https://cdn.jsdelivr.net/gh/nicolas-goyon/TamperMonkeyAutofill@vX.Y.Z/dist/tampermonkey-autofill.js
```

## Adding a new platform

See [`ARCHITECTURE.md`](./ARCHITECTURE.md#adding-a-new-platform).

## Disclaimer

This tool only pre-fills fields with data you provide yourself; it never submits a form. Always review the content before sending an application. The selectors it relies on may break whenever the target site changes its interface.
