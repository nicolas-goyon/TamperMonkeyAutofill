// ==UserScript==
// @name         SmartRecruiters Autofill - Mon profil
// @namespace    local.smartrecruiters.autofill
// @version      1.0.0
// @description  Preremplit les formulaires SmartRecruiters avec mes informations, sans soumettre la candidature.
// @match        https://jobs.smartrecruiters.com/oneclick-ui/company/*/publication/*
// @run-at       document-idle
// @grant        unsafeWindow
// @require      https://cdn.jsdelivr.net/gh/<utilisateur>/<depot>@<tag-ou-version>/dist/tampermonkey-autofill.js
// ==/UserScript==

// CECI EST UN EXEMPLE A COPIER DANS UN NOUVEAU SCRIPT TAMPERMONKEY LOCAL.
// Ce fichier ne fait PAS partie du depot public : il reste sur votre poste,
// dans Tampermonkey, et contient vos informations personnelles.
//
// 1) Remplacez l'URL @require ci-dessus par celle de votre fork/depot et du
//    tag de version que vous voulez figer (recommande, plutot que @latest).
//    Ce meme fichier regroupe TOUS les formulaires disponibles : un seul
//    @require suffit, meme si d'autres formulaires sont ajoutes plus tard.
// 2) Remplissez les informations ci-dessous.
// 3) Ajustez la liste @match si vous ciblez d'autres entreprises utilisant
//    SmartRecruiters (ex. .../company/ALTEN/publication/*).

(function () {
  'use strict';

  window.TMAutofill.SmartRecruiters.init({
    profile: {
      firstName: 'Prenom',
      lastName: 'Nom',
      email: 'prenom.nom@example.com',
      phoneDisplay: '0600000000',
      phoneInternational: '+33600000000',
      phoneCountryCode: 'FR',
      country: 'France',
      city: 'Paris',
      location: 'Paris, Ile-de-France, France',
      linkedIn: 'https://www.linkedin.com/in/votre-profil/',
      github: 'https://github.com/votre-compte',
      hiringMessage: 'Bonjour,\n\nVotre message de motivation ici.\n\nCordialement,',
      rqthAnswer: 'Je ne souhaite pas repondre a cette question',
      sourceAnswer: 'Reseaux sociaux / Plateforme recrutement',
      sourceDetailAnswer: 'LinkedIn',
    },

    // Dans l'ordre d'affichage des blocs "Formation" du formulaire.
    educations: [
      {
        institution: 'Nom de l\'etablissement',
        major: 'Intitule de la formation',
        degree: 'Diplome obtenu',
        city: 'Ville',
        country: 'Pays',
        location: 'Ville, Region, Pays',
        dateFrom: '09/2020',
        dateTo: '06/2022',
        current: false,
        description: '',
      },
    ],

    // Dans l'ordre d'affichage des blocs "Experience" du formulaire.
    experiences: [
      {
        title: 'Intitule du poste',
        company: 'Nom de l\'entreprise',
        city: 'Ville',
        country: 'Pays',
        location: 'Ville, Region, Pays',
        dateFrom: '09/2024',
        dateTo: '09/2025',
        current: false,
        description: 'Description de la mission.',
      },
    ],

    // Optionnel : cliquer sur "Enregistrer" apres chaque bloc. Defaut : false.
    saveAfterExperienceEducationFill: false,
  });
})();
