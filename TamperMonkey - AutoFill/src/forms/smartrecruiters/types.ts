/**
 * Toutes ces interfaces decrivent uniquement la FORME des donnees. Aucune
 * valeur reelle (nom, email, telephone...) ne doit exister dans ce depot :
 * elles sont fournies a l'execution par le script Tampermonkey local de
 * chaque utilisateur, via SmartRecruiters.init(config).
 */

export interface SmartRecruitersProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneDisplay: string;
  phoneInternational: string;
  /** Code pays ISO2 pour le selecteur telephone, ex. 'FR'. Defaut : 'FR'. */
  phoneCountryCode?: string;
  country: string;
  city: string;
  /** Libelle complet attendu par l'autocomplete localisation, ex. "Ville, Region, Pays". */
  location: string;
  linkedIn?: string;
  github?: string;
  website?: string;
  /** Message libre envoye au recruteur, si le formulaire propose ce champ. */
  hiringMessage?: string;
  /** Reponse a la question RQTH, si posee par le formulaire. */
  rqthAnswer?: string;
  /** Reponse a "Comment avez-vous connu cette offre ?", si posee. */
  sourceAnswer?: string;
  sourceDetailAnswer?: string;
}

export interface LocationFix {
  city: string;
  country: string;
  location: string;
}

export interface ExperienceEntry extends LocationFix {
  title: string;
  company: string;
  /** Format attendu par le champ date SmartRecruiters, ex. 'MM/YYYY'. */
  dateFrom: string;
  dateTo?: string;
  current: boolean;
  description: string;
}

export interface EducationEntry extends LocationFix {
  institution: string;
  major: string;
  degree: string;
  dateFrom: string;
  dateTo?: string;
  current: boolean;
  description?: string;
}

export interface SmartRecruitersConfig {
  profile: SmartRecruitersProfile;
  /** Dans l'ordre d'affichage des blocs "Experience" du formulaire. */
  experiences?: ExperienceEntry[];
  /** Dans l'ordre d'affichage des blocs "Formation" du formulaire. */
  educations?: EducationEntry[];
  /** Cliquer sur le bouton "Enregistrer" apres chaque bloc experience/formation. Defaut : false. */
  saveAfterExperienceEducationFill?: boolean;
  /** Libelle du bouton flottant. Defaut : "Remplir candidature". */
  buttonLabel?: string;
}

/** Element de composant web SmartRecruiters (spl-input, spl-select, ...). */
export interface SplComponentElement extends HTMLElement {
  value?: unknown;
}
