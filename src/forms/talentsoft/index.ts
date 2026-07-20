/**
 * Point d'entree public du formulaire Cegid Talentsoft, utilise par de
 * nombreux sites carriere (ex. careers.totalenergies.com).
 *
 * Ce module ne contient et n'importe AUCUNE donnee personnelle : le profil,
 * les experiences et les formations sont fournis par l'appelant (le script
 * Tampermonkey local de chaque utilisateur) via Talentsoft.init(config).
 *
 * Inclus dans le bundle esbuild dist/tampermonkey-autofill.js, expose sur
 * window.TMAutofill.Talentsoft (voir scripts/build.mjs).
 */
export * from './types';

import { installTalentsoftButton } from './ui';
import { fillAll } from './fill/fillAll';
import type { TalentsoftConfig } from './types';

/** A appeler depuis le script Tampermonkey local, avec le profil de l'utilisateur. */
export function init(config: TalentsoftConfig): void {
  installTalentsoftButton(config);
}

/** Declenche un remplissage immediat, sans passer par le bouton flottant. */
export const run = fillAll;
