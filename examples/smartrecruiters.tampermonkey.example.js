// ==UserScript==
// @name         SmartRecruiters Autofill - My profile
// @namespace    local.smartrecruiters.autofill
// @version      1.0.0
// @description  Pre-fills SmartRecruiters application forms with my information. Never submits the application.
// @match        https://jobs.smartrecruiters.com/oneclick-ui/company/*/publication/*
// @run-at       document-idle
// @grant        unsafeWindow
// @require      https://cdn.jsdelivr.net/gh/nicolas-goyon/TamperMonkeyAutofill@v1.0.0/dist/tampermonkey-autofill.js
// ==/UserScript==

// TEMPLATE — copy this file into a new local Tampermonkey script.
// The copy containing your real information stays in Tampermonkey on your
// machine. Never commit it to a public repository.
//
// 1) In @require above, pin the exact release tag you want (e.g. @v1.0.0).
//    Never use @latest or a branch: an update could change behavior without
//    warning. One @require covers ALL platforms in the bundle, including
//    ones added in future releases.
// 2) Replace the placeholder values below with your information.
// 3) Extend the @match list if you target other companies using
//    SmartRecruiters (e.g. .../company/ALTEN/publication/*).

(function () {
  'use strict';

  window.TMAutofill.SmartRecruiters.init({
    profile: {
      firstName: 'FirstName',
      lastName: 'LastName',
      email: 'first.last@example.com',
      phoneDisplay: '0600000000',
      phoneInternational: '+33600000000',
      phoneCountryCode: 'FR', // ISO2 country code for the phone selector (default: 'FR')
      country: 'France',
      city: 'Paris',
      // Full label expected by the location autocomplete: "City, Region, Country".
      location: 'Paris, Ile-de-France, France',

      // Optional fields — remove any you don't want filled.
      linkedIn: 'https://www.linkedin.com/in/your-profile/',
      github: 'https://github.com/your-account',
      // website: 'https://your-site.example.com',
      hiringMessage: 'Hello,\n\nYour message to the recruiter here.\n\nBest regards,',
      rqthAnswer: 'Je ne souhaite pas repondre a cette question',
      sourceAnswer: 'Reseaux sociaux / Plateforme recrutement',
      sourceDetailAnswer: 'LinkedIn',
    },

    // In the display order of the form's "Education" sections.
    educations: [
      {
        institution: 'School name',
        major: 'Field of study',
        degree: 'Degree obtained',
        city: 'City',
        country: 'Country',
        location: 'City, Region, Country',
        dateFrom: '09/2020', // MM/YYYY, as expected by SmartRecruiters date fields
        dateTo: '06/2022',
        current: false,
        description: '',
      },
    ],

    // In the display order of the form's "Experience" sections.
    experiences: [
      {
        title: 'Job title',
        company: 'Company name',
        city: 'City',
        country: 'Country',
        location: 'City, Region, Country',
        dateFrom: '09/2024',
        dateTo: '09/2025',
        current: false,
        description: 'Description of the role.',
      },
    ],

    // Optional: click "Save" after each experience/education section. Default: false.
    saveAfterExperienceEducationFill: false,

    // Optional: label of the floating button. Default: "Remplir candidature".
    // buttonLabel: 'Fill application',
  });
})();
