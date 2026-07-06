# TamperMonkey AutoFill

Bibliotheque TypeScript pour preremplir automatiquement des formulaires de
candidature en ligne, pensee pour etre chargee dans un script Tampermonkey
via `@require`. **Ce depot ne contient aucune information personnelle** :
vos donnees (nom, email, telephone, experiences, formations...) restent
uniquement dans votre script Tampermonkey local, jamais dans le code
publie/versionne ici.

Voir [`architecture.md`](./architecture.md) pour le detail de l'organisation
du code et le fonctionnement precis de la separation code / donnees.

## Formulaires supportes

| Formulaire | Dossier | Description |
|---|---|---|
| SmartRecruiters | `src/forms/smartrecruiters/` | Plateforme "oneclick-ui" de SmartRecruiters (utilisee par de nombreuses entreprises : Sopra Steria, ALTEN, Devoteam...) |

## Principe de fonctionnement

1. Ce depot est public sur GitHub et distribue via un CDN comme
   [jsdelivr](https://www.jsdelivr.com/) (pas de build ni de compte requis
   cote CDN : jsdelivr sert directement les fichiers d'un depot GitHub).
2. Votre script Tampermonkey **personnel** (qui reste sur votre poste)
   charge la bibliotheque avec `@require`, puis lui passe vos informations
   via une fonction `init(config)`.
3. La bibliotheque installe un bouton flottant "Remplir candidature" sur la
   page ; au clic, elle remplit le formulaire avec les donnees fournies puis
   entoure en rouge les champs restes invalides, pour verification avant
   envoi. **Elle ne soumet jamais le formulaire automatiquement.**

## Installation cote utilisateur (Tampermonkey)

1. Choisissez un tag/commit de ce depot (ou de votre fork) a figer.
2. Creez un nouveau script dans Tampermonkey a partir du modele
   [`examples/smartrecruiters.tampermonkey.example.js`](./examples/smartrecruiters.tampermonkey.example.js).
3. Dans l'en-tete du script, adaptez :
   - `@require` : URL jsdelivr vers `dist/tampermonkey-autofill.js`, par
     exemple
     `https://cdn.jsdelivr.net/gh/<utilisateur>/<depot>@<tag>/dist/tampermonkey-autofill.js`
     — un seul `@require` suffit pour tous les formulaires disponibles dans
     ce depot, y compris ceux ajoutes plus tard.
   - `@match` : les pages SmartRecruiters ciblees, ex.
     `https://jobs.smartrecruiters.com/oneclick-ui/company/*/publication/*`
4. Renseignez vos informations dans l'appel a
   `window.TMAutofill.SmartRecruiters.init({ profile: {...}, experiences: [...], educations: [...] })`.
5. Sauvegardez. Sur une page de candidature SmartRecruiters, cliquez sur le
   bouton flottant puis verifiez les champs avant d'envoyer.

## Developpement de la bibliotheque

Prerequis : Node.js.

```bash
npm install
npm run typecheck   # verification TypeScript (tsc --noEmit)
npm run build       # genere dist/tampermonkey-autofill.js (esbuild)
npm run build:watch # reconstruit a chaque changement
```

`npm run build` produit un unique bundle regroupant tous les formulaires de
`src/forms/*` :

- `dist/tampermonkey-autofill.js` -> `window.TMAutofill.<Form>.init(config)`
  (ex. `window.TMAutofill.SmartRecruiters.init(...)`)

Un seul fichier a `@require`, meme quand de nouveaux formulaires sont
ajoutes : ils apparaissent automatiquement comme une nouvelle propriete de
`window.TMAutofill`.

Le dossier `dist/` n'est pas versionne sur `main` (voir `.gitignore`) : il
est genere puis publie par la CI **sur chaque tag** (voir ci-dessous), pour
etre servi par jsdelivr.

## Publier une version (CI GitHub Actions)

La construction et la publication sont automatisees par
[`.github/workflows/release.yml`](./.github/workflows/release.yml). Le
workflow se declenche a chaque push d'un tag `vX.Y.Z` : il lance le
typecheck, le build, verifie que le bundle n'est pas vide, commite `dist/`
puis **repositionne le tag** sur le commit de build. Ainsi le tag contient
le bundle et jsdelivr peut le servir de maniere figee.

Publier une version :

```bash
git tag v1.0.0
git push origin v1.0.0     # declenche la CI
```

Une fois la CI terminee, l'URL a mettre dans le `@require` Tampermonkey :

```
https://cdn.jsdelivr.net/gh/<utilisateur>/<depot>@v1.0.0/dist/tampermonkey-autofill.js
```

On peut aussi relancer manuellement un build depuis l'onglet **Actions**
(evenement `workflow_dispatch`, en fournissant le tag). Epinglez toujours un
tag precis (`@v1.0.0`) plutot que `@latest` cote Tampermonkey, pour eviter
qu'une mise a jour ne change le comportement sans verification.

## Ajouter un nouveau formulaire

Voir la section correspondante dans [`architecture.md`](./architecture.md#ajouter-un-nouveau-formulaire).

## Avertissement

Cet outil ne fait que preremplir des champs a partir de donnees que vous
fournissez vous-meme ; il ne soumet jamais de formulaire automatiquement.
Verifiez toujours le contenu avant d'envoyer une candidature. Les selecteurs
utilises peuvent casser si le site cible change son interface.
