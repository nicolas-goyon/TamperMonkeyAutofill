/**
 * Point d'entree public du formulaire SmartRecruiters.
 *
 * Ce module ne contient et n'importe AUCUNE donnee personnelle : le profil,
 * les experiences et les formations sont fournis par l'appelant (le script
 * Tampermonkey local de chaque utilisateur) via SmartRecruiters.init(config).
 *
 * Bundle esbuild -> dist/smartrecruiters.js, expose sur
 * window.TMAutofillSmartrecruiters (voir scripts/build.mjs).
 */
export * from './types';

import { installSmartRecruitersButton } from './ui';
import { fillAll } from './fill/fillAll';
import type { SmartRecruitersConfig } from './types';

/** A appeler depuis le script Tampermonkey local, avec le profil de l'utilisateur. */
export function init(config: SmartRecruitersConfig): void {
  installSmartRecruitersButton(config);
}

/** Declenche un remplissage immediat, sans passer par le bouton flottant. */
export const run = fillAll;
