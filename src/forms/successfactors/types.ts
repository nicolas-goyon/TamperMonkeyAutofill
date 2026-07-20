/**
 * Toutes ces interfaces decrivent uniquement la FORME des donnees. Aucune
 * valeur reelle (nom, email, telephone...) ne doit exister dans ce depot :
 * elles sont fournies a l'execution par le script Tampermonkey local de
 * chaque utilisateur, via SuccessFactors.init(config).
 *
 * Plateforme : SAP SuccessFactors Recruiting (RCM), le formulaire "Career
 * Opportunities > Apply" des sites carriere heberges (ex. jobs.atos.net,
 * careers.<company>.com bases sur rmk/jobs2web).
 */

export interface SuccessFactorsProfile {
  firstName: string;
  lastName: string;
  email: string;
  /** Telephone au format attendu par le site (champ texte libre). */
  phone: string;
  /** Libelle exact d'une option du combo "Gender", ex. 'Male' / 'Female'. */
  gender?: string;
  /** Libelle d'une option du combo "Title" (civilite), ex. 'Mr.' / 'Mrs.'. */
  title?: string;
  address1?: string;
  address2?: string;
  city?: string;
  stateProvince?: string;
  zip?: string;
  /** Libelle d'une option du combo "Country", ex. 'France'. */
  country?: string;
  /** Libelle d'une option du combo "Nationality". */
  nationality?: string;
  /** Libelle d'une option du combo "Preferred Way of Contact". */
  preferredContact?: string;
}

export interface SuccessFactorsExperienceEntry {
  /** Champ texte "Employer Name". */
  employer: string;
  /** Champ texte "Job Title". */
  jobTitle: string;
  /**
   * Date "From" au format affiche par le date picker du site (depend de la
   * locale du site carriere, ex. 'MM/DD/YYYY' en en_US).
   */
  dateFrom: string;
  /** Date "To", vide/absente si poste en cours. */
  dateTo?: string;
  /** Libelle d'une option du combo "Industry". */
  industry?: string;
  /** Libelle d'une option du combo "Country". */
  country?: string;
}

export interface SuccessFactorsEducationEntry {
  /**
   * Libelle d'une option du combo "Country". A renseigner en premier : le
   * combo "School / College / University" est en cascade et reste desactive
   * tant que le pays n'est pas choisi.
   */
  country?: string;
  /** Libelle d'une option du combo "School / College / University". */
  school?: string;
  /** Champ texte "If other, please specify" (si l'ecole n'est pas listee). */
  schoolOther?: string;
  /** Libelle d'une option du combo "Highest Level of Education". */
  highestLevel?: string;
  /** Libelle d'une option du combo "Year of Degree", ex. '2020'. */
  yearOfDegree?: string;
  /** Date "Date of Highest Level of Education", meme format que les autres dates. */
  dateOfDegree?: string;
  /** Libelle d'une option du combo "Area of Study". */
  areaOfStudy?: string;
}

export interface SuccessFactorsLanguageEntry {
  /** Libelle d'une option du combo "Language". */
  language: string;
  /** Libelle d'une option du combo "Proficiency". */
  proficiency?: string;
}

export interface SuccessFactorsConfig {
  profile: SuccessFactorsProfile;
  /** Dans l'ordre d'affichage des blocs "Employment History" du formulaire. */
  experiences?: SuccessFactorsExperienceEntry[];
  /** Dans l'ordre d'affichage des blocs "Education" du formulaire. */
  educations?: SuccessFactorsEducationEntry[];
  /** Dans l'ordre d'affichage des blocs "Language Skills" du formulaire. */
  languages?: SuccessFactorsLanguageEntry[];
  /** Reponse au combo "How did you hear about this position?". */
  howDidYouHear?: string;
  /** Second niveau du picklist en cascade, si le site en affiche un. */
  howDidYouHearDetail?: string;
  /** Libelle du bouton flottant. Defaut : "Remplir candidature". */
  buttonLabel?: string;
}
