import { norm } from '../../../shared';

/**
 * Les libelles du formulaire SuccessFactors dependent de la locale du site
 * carriere (rcm_site_locale). On matche donc chaque champ/section contre une
 * liste de synonymes EN + FR, en comparaison floue (norm).
 */
export type LabelSynonyms = readonly string[];

export const SECTION_LABELS = {
  profile: ['profile information', 'informations du profil', 'informations personnelles'],
  employment: ['employment history', 'historique professionnel', "historique d'emploi", 'experience professionnelle'],
  education: ['education', 'formation'],
  languages: ['language skills', 'competences linguistiques', 'langues'],
} as const;

export const FIELD_LABELS = {
  firstName: ['first name', 'prenom'],
  lastName: ['last name', 'nom'],
  email: ['email', 'e-mail', 'courriel'],
  phone: ['phone', 'telephone'],
  address1: ['address 1', 'adresse 1'],
  address2: ['address 2', 'adresse 2'],
  city: ['city', 'ville'],
  stateProvince: ['state / province', 'etat / province', 'region'],
  zip: ['zip code', 'code postal'],
  employer: ['employer name', "nom de l'employeur", 'employeur'],
  jobTitle: ['job title', 'intitule du poste', 'titre du poste'],
  schoolOther: ['if other, please specify', 'si autre, veuillez preciser'],
} as const;

export const COMBO_TITLES = {
  gender: ['gender', 'genre', 'sexe'],
  civility: ['title', 'civilite'],
  country: ['country', 'pays'],
  nationality: ['nationality', 'nationalite'],
  preferredContact: ['preferred way of contact', 'moyen de contact prefere'],
  industry: ['industry', 'secteur'],
  school: ['school / college / university', 'ecole / universite', 'etablissement'],
  highestLevel: ['highest level of education', "niveau d'etudes le plus eleve", 'niveau de formation'],
  yearOfDegree: ['year of degree', "annee d'obtention", 'annee du diplome'],
  areaOfStudy: ['area of study', "domaine d'etudes", 'domaine d etude'],
  language: ['language', 'langue'],
  proficiency: ['proficiency', 'niveau de maitrise', 'maitrise'],
  howDidYouHear: ['how did you hear about this position', 'comment avez-vous entendu parler de ce poste'],
} as const;

export const DATE_TITLES = {
  from: ['from', 'du', 'de'],
  to: ['to', 'au', 'a'],
  dateOfDegree: ['date of highest level of education', "date du niveau d'etudes le plus eleve", 'date du diplome'],
} as const;

/** Vrai si le texte (normalise) contient ou egale l'un des synonymes. */
export function matchesLabel(text: string | null | undefined, synonyms: LabelSynonyms): boolean {
  const t = norm(text);
  if (!t) return false;
  return synonyms.some((syn) => t === norm(syn) || t.includes(norm(syn)));
}

/** Variante stricte : egalite apres normalisation (pour les titres courts type "From"/"To"). */
export function equalsLabel(text: string | null | undefined, synonyms: LabelSynonyms): boolean {
  const t = norm(text);
  if (!t) return false;
  return synonyms.some((syn) => t === norm(syn));
}
