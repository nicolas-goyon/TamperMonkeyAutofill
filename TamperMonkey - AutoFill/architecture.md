# Architecture

## Objectif

Ce depot fournit, par site de recrutement, une bibliotheque TypeScript qui sait
preremplir un formulaire de candidature dans le navigateur. Il est concu pour
etre :

- **public** : heberge sur GitHub, distribue via un CDN (jsdelivr) et charge
  dans un script Tampermonkey via `@require`. Aucune donnee personnelle
  (nom, email, telephone, experiences...) ne doit jamais s'y trouver.
- **prive** cote utilisateur : chaque utilisateur ecrit un petit script
  Tampermonkey local qui `@require` la bibliotheque puis lui fournit ses
  propres informations via un objet de configuration passe a `init(...)`.
  Ce script local n'est jamais commite dans ce depot.

## Separation code / donnees

```
Depot public (GitHub -> jsdelivr)          Poste de l'utilisateur (Tampermonkey)
------------------------------------       -------------------------------------
src/forms/smartrecruiters/*.ts       -->   // ==UserScript==
src/forms/<autre-form>/*.ts          -->   // @require https://cdn.jsdelivr.net/.../tampermonkey-autofill.js
  - logique de remplissage                 // ==/UserScript==
  - selecteurs, autocomplete, etc.
  - AUCUNE donnee personnelle              window.TMAutofill.SmartRecruiters.init({
                                              profile: { firstName: 'Nicolas', ... },
dist/tampermonkey-autofill.js (bundle) -->   experiences: [...],
  publie via un tag/release Git              educations: [...],
  regroupe TOUS les formulaires              });
```

Un seul `@require` pointe vers ce bundle unique : chaque nouveau formulaire
ajoute dans `src/forms/` est automatiquement inclus dedans et exposee comme
une nouvelle propriete de `window.TMAutofill` (ex. `TMAutofill.SmartRecruiters`,
plus tard `TMAutofill.<AutreForm>`), sans changer l'URL `@require`.

Le fichier `examples/smartrecruiters.tampermonkey.example.js` montre la forme
exacte de ce script local (avec des valeurs d'exemple, pas de vraies
donnees). C'est ce fichier qu'un utilisateur copie dans un nouveau script
Tampermonkey puis personnalise.

## Arborescence

```
src/
  global.d.ts              Types globaux (ex. `unsafeWindow` fourni par Tampermonkey)
  index.ts                 Barrel racine -> dist/tampermonkey-autofill.js (window.TMAutofill)

  shared/                  Utilitaires generiques, reutilisables par tous les formulaires
    async.ts                 sleep(ms)
    text.ts                  norm() (comparaison floue sans accents), textOf()
    dom/
      root.ts                 getRootWindow() (unsafeWindow || window)
      events.ts                dispatchAll(), makeEvent(), keyboard()
      query.ts                  deepQuery()/deepQueryAll() : traversee recursive du DOM + shadow DOM
      value.ts                   nativeSetValue(), humanTypeIntoFocusable(), clickElement()
    ui/
      notify.ts                createNotifier(), installAutofillButton(), observeAndReinstallButton()

  forms/
    <nom-du-formulaire>/    Un sous-dossier par site/plateforme de recrutement
      types.ts                Formes des donnees attendues (Profile, Experience, ...) -- pas de valeurs
      utils/                  Fonctions utilitaires SPECIFIQUES a ce formulaire
                               (selecteurs data-test, composants web du site, autocomplete, etc.)
      fill/                   Logique de remplissage a proprement parler
                               (une fonction par bloc de formulaire + fillAll)
      ui.ts                   Installation du bouton flottant propre a ce formulaire
      index.ts                Point d'entree public : init(config) / run(config)
```

Aujourd'hui, un seul formulaire existe : `src/forms/smartrecruiters/`. Il gere
en realite toute la plateforme SmartRecruiters "oneclick-ui" (utilisee par
plusieurs entreprises : Sopra Steria, ALTEN, Devoteam...), pas une entreprise
en particulier -- la liste des entreprises ciblees vit dans les `@match` du
script Tampermonkey local, pas dans ce depot.

### Pourquoi `utils/` et `fill/` sont separes

- `utils/` : "comment interagir avec un champ du site" (trouver un element,
  poser une valeur dans un composant web, choisir une option d'autocomplete,
  gerer une case a cocher, une date, un numero de telephone...). Ce sont des
  briques bas niveau, sans notion d'ordre de remplissage.
- `fill/` : "quoi remplir, dans quel ordre, avec quelles donnees" pour un
  bloc de formulaire donne (infos personnelles, une experience, une
  formation), puis l'orchestration globale (`fillAll`).

Cette separation permet, pour un futur formulaire, de retrouver rapidement
soit "comment ce site gere ses champs" (`utils/`), soit "que fait-on
concretement au clic sur le bouton" (`fill/`).

## API publique d'un formulaire

Chaque `src/forms/<form>/index.ts` expose au minimum :

```ts
export interface <Form>Config { profile: ...; /* ... */ }

export function init(config: <Form>Config): void; // installe le bouton flottant
export const run: (config: <Form>Config) => Promise<void>; // remplissage direct, sans bouton
```

`init(config)` est ce que le script Tampermonkey local appelle. Aucune
fonction du depot ne lit de variable globale contenant des donnees
personnelles : tout transite explicitement par `config`.

## Build et distribution

- Le code source est en TypeScript (`src/**/*.ts`), verifie avec
  `npm run typecheck` (`tsc --noEmit`).
- `npm run build` (voir `scripts/build.mjs`) utilise esbuild pour produire un
  **unique** bundle IIFE dans `dist/tampermonkey-autofill.js`, a partir de
  `src/index.ts` qui reexporte chaque `src/forms/<form>`. Ce bundle expose
  `window.TMAutofill.<Form>` pour chaque formulaire (ex.
  `TMAutofill.SmartRecruiters`). Un seul `@require` couvre donc tous les
  formulaires, y compris ceux ajoutes ulterieurement.
- `dist/` n'est pas committe (voir `.gitignore`) : il est genere a la demande,
  ou via une release/CI, puis pousse sur une branche/tag servi par jsdelivr,
  par exemple :
  `https://cdn.jsdelivr.net/gh/<utilisateur>/<depot>@<tag>/dist/tampermonkey-autofill.js`
- Toujours pointer `@require` vers un **tag/commit fige** plutot que vers une
  branche (`@main`), pour eviter qu'une mise a jour casse un script en place
  sans prevenir.

## Ajouter un nouveau formulaire

1. Creer `src/forms/<nouveau-site>/` avec la structure `types.ts`,
   `utils/`, `fill/`, `ui.ts`, `index.ts` (s'inspirer de `smartrecruiters/`).
2. Reutiliser au maximum `src/shared/*` (DOM profond, evenements, notifier,
   bouton flottant) plutot que de dupliquer ces briques.
3. Ne jamais inclure de donnees personnelles ni de nom d'entreprise cible
   dans le code : tout passe par la `Config` fournie a `init()`. Aucune
   modification de `scripts/build.mjs` n'est necessaire : le nouveau
   formulaire est inclus automatiquement dans `dist/tampermonkey-autofill.js`
   des lors qu'il est reexporte depuis `src/index.ts`.
4. Ajouter un exemple dans `examples/<nouveau-site>.tampermonkey.example.js`.
5. Mettre a jour le README (liste des formulaires supportes).
