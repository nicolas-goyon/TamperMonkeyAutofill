/**
 * Point d'entree public du formulaire SAP SuccessFactors Recruiting (RCM),
 * utilise par de nombreux sites carriere (ex. jobs.atos.net).
 *
 * Ce module ne contient et n'importe AUCUNE donnee personnelle : le profil,
 * les experiences et les formations sont fournis par l'appelant (le script
 * Tampermonkey local de chaque utilisateur) via SuccessFactors.init(config).
 *
 * Inclus dans le bundle esbuild dist/tampermonkey-autofill.js, expose sur
 * window.TMAutofill.SuccessFactors (voir scripts/build.mjs).
 */
export * from './types';

import { installSuccessFactorsButton } from './ui';
import { fillAll } from './fill/fillAll';
import type { SuccessFactorsConfig } from './types';

/** A appeler depuis le script Tampermonkey local, avec le profil de l'utilisateur. */
export function init(config: SuccessFactorsConfig): void {
  installSuccessFactorsButton(config);
}

/** Declenche un remplissage immediat, sans passer par le bouton flottant. */
export const run = fillAll;
