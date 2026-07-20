// ==UserScript==
// @name         Talentsoft Autofill - My profile
// @namespace    local.talentsoft.autofill
// @version      1.0.0
// @description  Pre-fills Cegid Talentsoft career-site application forms with my information. Never submits the application.
// @match        https://careers.totalenergies.com/*
// @match        https://*.talent-soft.com/*
// @match        https://*.talentsoft.com/*
// @run-at       document-idle
// @grant        unsafeWindow
// @require      https://cdn.jsdelivr.net/gh/nicolas-goyon/TamperMonkeyAutofill@v1.1.0/dist/tampermonkey-autofill.js
// ==/UserScript==

// TEMPLATE — copy this file into a new local Tampermonkey script.
// The copy containing your real information stays in Tampermonkey on your
// machine. Never commit it to a public repository.
//
// 1) In @require above, pin the exact release tag you want. Never use
//    @latest or a branch. One @require covers ALL platforms in the bundle.
// 2) Replace the placeholder values below with your information.
// 3) Extend the @match list with the career sites you target (any company
//    using Cegid Talentsoft: careers.<company>.com, etc.).
//
// Notes specific to Talentsoft:
// - Only step 1 of the wizard is covered (profile, files, experience,
//   education, skills, languages, contact preferences). Later steps vary
//   too much between sites to generalize.
// - Dropdown values (gender, country, years of experience, degree level,
//   skill proficiency, language level, ...) must match the option labels
//   displayed by the site, in the site's locale (this template uses French,
//   the locale of most Talentsoft sites in France).
// - Dates use ISO format 'YYYY-MM-DD' (native <input type="date">).
// - Skills and languages each require clicking an "ajouter" (add) button
//   before they can be filled in — the library does this automatically,
//   once per entry.
// - CV / cover letter / other files CANNOT be attached automatically
//   (browsers block scripted file uploads for security) — attach them by
//   hand, the status box will remind you if any are still empty.

(function () {
  'use strict';

  window.TMAutofill.Talentsoft.init({
    profile: {
      firstName: 'FirstName',
      lastName: 'LastName',
      email: 'first.last@example.com',

      // Optional fields — remove any you don't want filled.
      gender: 'Homme', // 'Homme' / 'Femme' / 'Préfère ne pas répondre'
      country: 'France',
      hasDisability: false,
      yearsOfExperience: '< 1 an', // must match a listed option, e.g. '1 – 3 ans', '4 – 7 ans', ...
      hasInternationalExperience: false,
      // internationalExperienceCountries: ['Royaume-Uni', 'Allemagne'],
    },

    // In the display order of the "Expérience professionnelle" blocks.
    // The form pre-renders a few empty rows; more are added automatically
    // (clicking "ajouter") if you provide more entries than displayed.
    experiences: [
      {
        employer: 'Company A',
        jobTitle: 'Job Title A',
        dateFrom: '2024-01-01', // ISO format
        dateTo: '2025-12-31', // omit if current position
        responsibilities: 'Brief description of the role.',
      },
    ],

    // In the display order of the "Parcours académique" blocks.
    educations: [
      {
        schoolName: 'My School Name',
        graduationDate: '2023-06-30', // ISO format
        fieldOfStudy: 'Computer Science',
        level: 'Bac + 5', // must match a listed option
        // averageGrade: '15/20',
      },
    ],

    // Each skill/language clicks "ajouter" once before being filled — you
    // don't need to pre-add rows on the page yourself.
    skills: [
      { name: 'Agile', level: 'Avancé' },
      { name: 'React', level: 'Intermédiaire' },
    ],

    languages: [
      { language: 'Français', level: 'C2' },
      { language: 'Anglais', level: 'B2' },
    ],

    preferredContactLanguage: 'Français',
    howDidYouHear: 'LinkedIn',
    // howDidYouHearOther: 'Precise here if "Autre" is the closest match above',

    // Never set to true without actually having read the privacy policy.
    acceptPrivacyPolicy: false,
  });
})();
