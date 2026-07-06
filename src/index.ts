/**
 * Barrel racine, bundle esbuild -> dist/tampermonkey-autofill.js, expose sur
 * window.TMAutofill (voir scripts/build.mjs). Regroupe tous les formulaires
 * disponibles derriere un seul @require.
 */
import * as SmartRecruiters from './forms/smartrecruiters';

export { SmartRecruiters };
