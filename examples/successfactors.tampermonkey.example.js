// ==UserScript==
// @name         SuccessFactors Autofill - My profile
// @namespace    local.successfactors.autofill
// @version      1.0.0
// @description  Pre-fills SAP SuccessFactors (RCM) application forms with my information. Never submits the application.
// @match        https://jobs.atos.net/*
// @match        https://career*.successfactors.com/*
// @match        https://career*.successfactors.eu/*
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
//    using SAP SuccessFactors Recruiting: jobs.<company>.com, etc.).
//
// Notes specific to SuccessFactors:
// - Dropdown values (gender, country, industry, degree, ...) must match the
//   option labels displayed by the site, in the site's locale.
// - Dates use the format displayed by the site's date pickers
//   (e.g. 'MM/DD/YYYY' on en_US sites).
// - The form pre-renders a fixed number of experience/education blocks:
//   entries beyond the displayed blocks are skipped (add blocks manually,
//   then click the button again).

(function () {
  'use strict';

  window.TMAutofill.SuccessFactors.init({
    profile: {
      firstName: 'FirstName',
      lastName: 'LastName',
      email: 'first.last@example.com',
      phone: '0600000000',

      // Optional fields — remove any you don't want filled.
      gender: 'Male',
      title: 'Mr.',
      address1: '1 Example Street',
      address2: '',
      city: 'Paris',
      stateProvince: 'Ile-de-France',
      zip: '75001',
      country: 'France',
      nationality: 'French',
      // preferredContact: 'Email',
    },

    // In the display order of the "Employment History" blocks.
    experiences: [
      {
        employer: 'Company A',
        jobTitle: 'Job Title A',
        dateFrom: '01/01/2024', // format displayed by the site's date picker
        dateTo: '12/31/2025', // omit if current position
        industry: 'Information Technology',
        country: 'France',
      },
    ],

    // In the display order of the "Education" blocks.
    // Country FIRST: the School dropdown stays disabled until it is set.
    educations: [
      {
        country: 'France',
        school: 'Other', // pick a listed school, or 'Other' + schoolOther
        schoolOther: 'My School Name',
        highestLevel: "Master's Degree",
        yearOfDegree: '2023',
        // dateOfDegree: '06/30/2023',
        areaOfStudy: 'Computer Science',
      },
    ],

    languages: [
      { language: 'French', proficiency: 'Native' },
      { language: 'English', proficiency: 'Fluent' },
    ],

    howDidYouHear: 'Job Board',
    // howDidYouHearDetail: 'LinkedIn',
  });
})();
