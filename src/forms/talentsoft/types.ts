/**
 * Toutes ces interfaces decrivent uniquement la FORME des donnees. Aucune
 * valeur reelle (nom, email, telephone...) ne doit exister dans ce depot :
 * elles sont fournies a l'execution par le script Tampermonkey local de
 * chaque utilisateur, via Talentsoft.init(config).
 *
 * Plateforme : Cegid Talentsoft (ex-Talentsoft) Recruiting, le formulaire
 * "candidature" (wizard multi-etapes, classe form--stepN) des sites carriere
 * heberges par cet ATS (ex. careers.totalenergies.com, et de nombreuses
 * autres entreprises francaises/europeennes). Cette page ne couvre que la
 * PREMIERE etape du wizard (profil, fichiers, experience, formation,
 * competences, langues, contact) : les etapes suivantes varient trop d'un
 * site a l'autre pour etre generalisees ici.
 */

export interface TalentsoftProfile {
  firstName: string;
  lastName: string;
  email: string;
  /** Libelle exact d'une option du groupe de radio "Sexe" (ex. 'Homme' / 'Femme' / 'Préfère ne pas répondre'). */
  gender?: string;
  /** Libelle d'une option du combo "Pays" (adresse), ex. 'France'. Souvent deja preselectionne par le site. */
  country?: string;
  /** Combo "J'ai un handicap (reconnu officiellement ou non)" : true -> 'Oui', false -> 'Non'. */
  hasDisability?: boolean;
  /** Libelle exact d'une option du combo "Années d'expérience (au total)", ex. '4 – 7 ans'. */
  yearsOfExperience?: string;
  /** Combo "Expérience internationale" : true coche 'Oui' (seule option reelle du combo). */
  hasInternationalExperience?: boolean;
  /**
   * Pays de la liste multi-select avec recherche "Dans quels pays avez-vous
   * une expérience professionnelle internationale ?". Chaque libelle est
   * recherche puis choisi un par un dans le picker.
   */
  internationalExperienceCountries?: string[];
}

export interface TalentsoftExperienceEntry {
  /** Champ texte "Société employeur". */
  employer: string;
  /** Champ texte "Intitulé du poste". */
  jobTitle: string;
  /** Date "Date de début", format ISO 'YYYY-MM-DD' (input date natif). */
  dateFrom?: string;
  /** Date "Date de fin", format ISO 'YYYY-MM-DD'. */
  dateTo?: string;
  /** Zone de texte "Responsabilités". */
  responsibilities?: string;
}

export interface TalentsoftEducationEntry {
  /** Champ texte "Nom de l'école". */
  schoolName: string;
  /** Date "Année du diplôme", format ISO 'YYYY-MM-DD' (input date natif). */
  graduationDate?: string;
  /** Champ texte "Domaine principal d'étude(s)". */
  fieldOfStudy: string;
  /** Libelle d'une option du combo "Niveau d'études", ex. 'Bac + 5'. */
  level?: string;
  /** Champ texte "Moyenne scolaire". */
  averageGrade?: string;
}

export interface TalentsoftSkillEntry {
  /**
   * Nom de la competence : recherche dans un combo autocomplete (liste
   * alimentee par le serveur), le libelle doit donc correspondre a une
   * entree existante de la taxonomie du site (ex. 'Agile', 'React').
   */
  name: string;
  /** Libelle d'une option du combo "Niveau de maitrise", ex. 'Avancé'. */
  level?: string;
}

export interface TalentsoftLanguageEntry {
  /** Libelle d'une option du combo "Langue", ex. 'Français'. */
  language: string;
  /** Libelle d'une option du combo "Niveau linguistique" (CECRL), ex. 'C1'. */
  level?: string;
}

export interface TalentsoftConfig {
  profile: TalentsoftProfile;
  /** Dans l'ordre d'affichage des blocs "Expérience professionnelle". Des lignes sont ajoutees automatiquement (bouton "ajouter") si besoin. */
  experiences?: TalentsoftExperienceEntry[];
  /** Dans l'ordre d'affichage des blocs "Parcours académique". */
  educations?: TalentsoftEducationEntry[];
  /** Chaque competence declenche un clic sur "ajouter" avant d'etre saisie. */
  skills?: TalentsoftSkillEntry[];
  /** Chaque langue declenche un clic sur "ajouter" avant d'etre saisie. */
  languages?: TalentsoftLanguageEntry[];
  /** Combo "Langue préférée pour les futurs contacts". */
  preferredContactLanguage?: string;
  /** Combo "Comment avez-vous entendu parler de cette offre ?". */
  howDidYouHear?: string;
  /** Champ texte conditionnel affiche si howDidYouHear vaut 'Autre'. */
  howDidYouHearOther?: string;
  /** Case a cocher "J'accepte" (politique de confidentialite). Defaut : false (jamais coche automatiquement sans consentement explicite). */
  acceptPrivacyPolicy?: boolean;
  /** Libelle du bouton flottant. Defaut : "Remplir candidature". */
  buttonLabel?: string;
}
