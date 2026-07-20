import { norm } from '../../../shared';

/**
 * Talentsoft est utilise par de nombreuses entreprises, chacune configurant
 * ses propres identifiants de champ (ids numeriques type "10609", "162"...)
 * dans son back-office. Ces ids ne sont donc PAS portables d'un site a
 * l'autre : on localise systematiquement les champs par le TEXTE de leur
 * libelle (comparaison floue via norm), en FR (locale principale de ce
 * depot) avec quelques synonymes EN en secours.
 */
export type LabelSynonyms = readonly string[];

export const SECTION_LABELS = {
  personal: ['informations personnelles', 'personal information'],
  files: ['ajouter des fichiers', 'documents', 'files'],
  professionalBackground: ['parcours professionnel', 'professional background', 'experience professionnelle'],
  // NB: pas de synonyme "formation" seul : c'est une sous-chaine de
  // "informations personnelles", ce qui ferait matcher la mauvaise Section.
  academicBackground: ['parcours academique', 'formation academique', 'cursus scolaire', 'education', 'academic background'],
  languages: ['langues', 'languages'],
  contact: ['langue preferee pour les futurs contacts', 'preferred contact language'],
} as const;

export const FIELD_LABELS = {
  firstName: ['prenom', 'first name'],
  lastName: ['nom de famille', 'last name'],
  email: ['e-mail', 'email', 'courriel'],
  gender: ['sexe', 'genre', 'gender'],
  addressCountry: ['pays'],
  disability: ["j'ai un handicap", 'handicap', 'disability'],
  yearsOfExperience: ["annees d'experience", 'years of experience'],
  internationalExperience: ['experience internationale', 'international experience'],
  internationalExperienceCountries: [
    'avez-vous une experience professionnelle internationale',
    'countries with international',
  ],
  cv: ['ajouter un cv', 'cv', 'resume'],
  coverLetter: ['lettre de motivation', 'cover letter'],
  otherFiles: ['autres fichiers', 'other files'],

  employer: ['societe employeur', 'employer'],
  jobTitle: ['intitule du poste', 'job title'],
  dateFrom: ['date de debut', 'start date'],
  dateTo: ['date de fin', 'end date'],
  responsibilities: ['responsabilites', 'responsibilities'],
  experienceDataset: ['experience professionnelle'],

  schoolName: ["nom de l'ecole", 'school name'],
  graduationDate: ['annee du diplome', 'year of degree', 'graduation'],
  fieldOfStudy: ["domaine principal d'etude", 'field of study'],
  educationLevel: ["niveau d'etudes", 'level of education'],
  averageGrade: ['moyenne scolaire', 'average grade', 'gpa'],

  skillsDataset: ['liste des competences', 'list of skills'],
  skillLevel: ['niveau de maitrise', 'proficiency'],

  languageLevel: ['niveau linguistique', 'language level'],

  preferredContactLanguage: ['langue preferee pour les futurs contacts', 'preferred contact language'],
  howDidYouHear: ['comment avez-vous entendu parler', 'how did you hear'],
  howDidYouHearOther: ['autre (merci de preciser)', 'other, please specify'],
  acceptPrivacyPolicy: ["j'accepte", 'i accept', 'politique de confidentialite', 'privacy policy'],
} as const;

/** Vrai si le texte (normalise) contient ou egale l'un des synonymes. */
export function matchesLabel(text: string | null | undefined, synonyms: LabelSynonyms): boolean {
  const t = norm(text);
  if (!t) return false;
  return synonyms.some((syn) => t === norm(syn) || t.includes(norm(syn)));
}

/** Variante stricte : egalite apres normalisation. */
export function equalsLabel(text: string | null | undefined, synonyms: LabelSynonyms): boolean {
  const t = norm(text);
  if (!t) return false;
  return synonyms.some((syn) => t === norm(syn));
}
