"use strict";
var TMAutofill = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    SmartRecruiters: () => smartrecruiters_exports,
    SuccessFactors: () => successfactors_exports,
    Talentsoft: () => talentsoft_exports
  });

  // src/forms/smartrecruiters/index.ts
  var smartrecruiters_exports = {};
  __export(smartrecruiters_exports, {
    init: () => init,
    run: () => run
  });

  // src/shared/ui/notify.ts
  function createNotifier(options = {}) {
    const id = options.id ?? "tm-autofill-status";
    return function notify4(message) {
      let box = document.getElementById(id);
      if (!box) {
        box = document.createElement("div");
        box.id = id;
        box.style.cssText = [
          "position:fixed",
          "right:16px",
          "bottom:78px",
          "z-index:2147483647",
          "max-width:460px",
          "padding:12px 14px",
          "background:#111827",
          "color:white",
          "border-radius:10px",
          "font:13px/1.35 system-ui,-apple-system,Segoe UI,sans-serif",
          "box-shadow:0 6px 24px rgba(0,0,0,.25)"
        ].join(";");
        document.body.appendChild(box);
      }
      box.textContent = message;
    };
  }
  function installAutofillButton(options) {
    const id = options.id ?? "tm-autofill-button";
    if (document.getElementById(id)) return;
    const button = document.createElement("button");
    button.id = id;
    button.type = "button";
    button.textContent = options.label ?? "Remplir candidature";
    button.style.cssText = [
      "position:fixed",
      "right:16px",
      "bottom:16px",
      "z-index:2147483647",
      "padding:12px 16px",
      "border-radius:999px",
      "border:0",
      "background:#08698A",
      "color:white",
      "font:600 14px system-ui,-apple-system,Segoe UI,sans-serif",
      "box-shadow:0 6px 20px rgba(0,0,0,.28)",
      "cursor:pointer"
    ].join(";");
    button.addEventListener("click", () => {
      void options.onClick();
    });
    document.body.appendChild(button);
  }
  function observeAndReinstallButton(install) {
    const observer = new MutationObserver(() => install());
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    return observer;
  }

  // src/shared/async.ts
  var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // src/shared/dom/query.ts
  function openShadowRoot(el) {
    try {
      return el?.shadowRoot ?? null;
    } catch {
      return null;
    }
  }
  function deepQueryAll(selector, root = document) {
    const results = /* @__PURE__ */ new Set();
    const visited = /* @__PURE__ */ new Set();
    function scan(node) {
      if (!node || visited.has(node)) return;
      visited.add(node);
      const el = node;
      try {
        if (el.matches?.(selector)) {
          results.add(el);
        }
      } catch {
      }
      try {
        if (el.querySelectorAll) {
          for (const found of el.querySelectorAll(selector)) {
            results.add(found);
          }
        }
      } catch {
      }
      try {
        if (el.shadowRoot) {
          scan(el.shadowRoot);
        }
      } catch {
      }
      let children = [];
      try {
        children = el.children ? [...el.children] : [];
      } catch {
        children = [];
      }
      for (const child of children) {
        scan(child);
      }
      try {
        if (el.querySelectorAll) {
          for (const child of el.querySelectorAll("*")) {
            try {
              if (child.shadowRoot) scan(child.shadowRoot);
            } catch {
            }
          }
        }
      } catch {
      }
    }
    scan(root);
    return [...results];
  }
  function deepQuery(selector, root = document) {
    return deepQueryAll(selector, root)[0] ?? null;
  }

  // src/shared/text.ts
  var COMBINING_DIACRITICS_START = 768;
  var COMBINING_DIACRITICS_END = 879;
  function stripDiacritics(value) {
    let result = "";
    for (const char of value) {
      const code = char.codePointAt(0) ?? 0;
      if (code >= COMBINING_DIACRITICS_START && code <= COMBINING_DIACRITICS_END) {
        continue;
      }
      result += char;
    }
    return result;
  }
  var norm = (value) => stripDiacritics(String(value ?? "").normalize("NFD")).replace(/[‘’ʼ]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();
  var TEXT_ATTRIBUTES = ["label", "aria-label", "placeholder", "value", "data-test", "id"];
  function textOf(el) {
    if (!el) return "";
    let text = el.textContent || "";
    for (const node of deepQueryAll("*", el)) {
      for (const attr of TEXT_ATTRIBUTES) {
        const value = node.getAttribute?.(attr);
        if (value) text += ` ${value}`;
      }
    }
    return text;
  }

  // src/shared/dom/root.ts
  function getRootWindow() {
    return typeof unsafeWindow !== "undefined" && unsafeWindow ? unsafeWindow : window;
  }

  // src/shared/dom/events.ts
  function eventOpts() {
    return { bubbles: true, cancelable: true, composed: true };
  }
  function makeEvent(type, extra = {}) {
    const W = getRootWindow();
    try {
      if (type === "input" && "InputEvent" in W) {
        return new W.InputEvent("input", {
          ...eventOpts(),
          inputType: "insertText",
          data: extra.data ?? null
        });
      }
      return new W.Event(type, eventOpts());
    } catch {
      return new Event(type, eventOpts());
    }
  }
  var DISPATCHED_EVENT_TYPES = [
    "focus",
    "keydown",
    "keypress",
    "beforeinput",
    "input",
    "keyup",
    "change",
    "blur"
  ];
  function dispatchAll(el) {
    if (!el) return;
    for (const type of DISPATCHED_EVENT_TYPES) {
      try {
        el.dispatchEvent(makeEvent(type));
      } catch {
        try {
          el.dispatchEvent(new Event(type, eventOpts()));
        } catch {
        }
      }
    }
  }
  function keyboard(el, key) {
    if (!el) return;
    const W = getRootWindow();
    for (const type of ["keydown", "keyup"]) {
      try {
        el.dispatchEvent(
          new W.KeyboardEvent(type, {
            ...eventOpts(),
            key,
            code: key
          })
        );
      } catch {
      }
    }
  }

  // src/shared/dom/value.ts
  function nativeSetValue(el, value) {
    if (!el) return false;
    const W = getRootWindow();
    const proto = el instanceof W.HTMLTextAreaElement ? W.HTMLTextAreaElement.prototype : W.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    try {
      if (descriptor?.set) descriptor.set.call(el, value);
      else el.value = value;
    } catch {
      el.value = value;
    }
    dispatchAll(el);
    return true;
  }
  async function humanTypeIntoFocusable(target, value) {
    if (!target) return false;
    const W = getRootWindow();
    try {
      target.scrollIntoView({ block: "center", inline: "nearest" });
    } catch {
    }
    try {
      target.click();
    } catch {
    }
    try {
      target.focus();
    } catch {
    }
    await sleep(80);
    try {
      W.document.execCommand("selectAll", false);
      await sleep(30);
      const ok = W.document.execCommand("insertText", false, value);
      dispatchAll(target);
      if (ok) return true;
    } catch {
    }
    return false;
  }
  async function clickElement(el) {
    if (!el) return false;
    const W = getRootWindow();
    try {
      el.scrollIntoView({ block: "center", inline: "nearest" });
    } catch {
    }
    await sleep(80);
    try {
      el.click();
    } catch {
    }
    try {
      el.dispatchEvent(new W.MouseEvent("mousedown", eventOpts()));
      el.dispatchEvent(new W.MouseEvent("mouseup", eventOpts()));
      el.dispatchEvent(new W.MouseEvent("click", eventOpts()));
    } catch {
    }
    dispatchAll(el);
    return true;
  }

  // src/forms/smartrecruiters/utils/debug.ts
  function markInvalids() {
    const invalids = deepQueryAll('[aria-invalid="true"], .ng-invalid');
    console.log("Invalid Elements");
    console.log(invalids);
    for (const el of invalids) {
      if (el instanceof HTMLElement) {
        el.style.outline = "2px solid #d00000";
        el.style.outlineOffset = "2px";
      }
    }
    return invalids.length;
  }
  function debugShadowRoots() {
    const spl = [
      ...document.querySelectorAll(
        "spl-input, spl-select, spl-phone-field, spl-textarea, spl-autocomplete"
      )
    ];
    const summary = spl.map((el) => ({
      tag: el.tagName.toLowerCase(),
      id: el.id || "",
      dataTest: el.getAttribute("data-test") || "",
      hasShadowRoot: Boolean(el.shadowRoot),
      text: norm(textOf(el)).slice(0, 80)
    }));
    console.table(summary);
    return summary;
  }

  // src/forms/smartrecruiters/utils/component.ts
  var COMPONENT_SELECTOR = "spl-input, spl-textarea, spl-autocomplete, spl-phone-field, spl-select";
  function getAutocompleteHost(container) {
    if (!container) return null;
    if (container.matches?.("spl-autocomplete")) return container;
    return deepQuery("spl-autocomplete", container);
  }
  function getNativeInputFromComponent(component) {
    if (!component) return null;
    return deepQuery('input:not([type="file"]), textarea', component) ?? deepQuery(
      'input:not([type="file"]), textarea',
      component.shadowRoot ?? component
    );
  }
  async function setComponentValue(componentOrContainer, value) {
    if (!componentOrContainer) return false;
    const component = componentOrContainer.matches?.(COMPONENT_SELECTOR) ? componentOrContainer : deepQuery(COMPONENT_SELECTOR, componentOrContainer);
    const target = component ?? componentOrContainer;
    const shadow = openShadowRoot(target);
    if (shadow) {
      const inner = deepQuery('input:not([type="file"]), textarea', shadow);
      if (inner) {
        inner.focus();
        nativeSetValue(inner, value);
        try {
          target.value = value;
        } catch {
        }
        try {
          target.setAttribute("value", value);
        } catch {
        }
        dispatchAll(target);
        return true;
      }
    }
    const lightInput = deepQuery('input:not([type="file"]), textarea', target);
    if (lightInput) {
      lightInput.focus();
      nativeSetValue(lightInput, value);
      try {
        target.value = value;
      } catch {
      }
      dispatchAll(target);
      return true;
    }
    const humanOk = await humanTypeIntoFocusable(target, value);
    try {
      target.value = value;
    } catch {
    }
    try {
      target.setAttribute("value", value);
    } catch {
    }
    dispatchAll(target);
    return humanOk;
  }

  // src/forms/smartrecruiters/utils/dataTest.ts
  function findByDataTest(dataTest) {
    return deepQuery(`[data-test="${CSS.escape(dataTest)}"]`);
  }
  function scopedDataTest(root, dataTest) {
    const escaped = CSS.escape(dataTest);
    return root.querySelector?.(`[data-test="${escaped}"]`) ?? deepQuery(`[data-test="${escaped}"]`, root);
  }

  // src/forms/smartrecruiters/utils/autocomplete.ts
  function autocompleteOptionText(option) {
    if (!option) return "";
    return [
      option.getAttribute?.("label"),
      option.getAttribute?.("value"),
      option.getAttribute?.("aria-label"),
      textOf(option)
    ].filter(Boolean).join(" ");
  }
  var OPTION_SELECTOR = [
    "spl-dropdown-item",
    "spl-select-option",
    '[role="option"]',
    '[data-test*="option"]',
    '[data-test*="result"]',
    "li",
    "button"
  ].join(",");
  var OPTION_SELECTOR_STRICT = [
    "spl-dropdown-item",
    "spl-select-option",
    '[role="option"]',
    '[data-test*="option"]',
    '[data-test*="result"]'
  ].join(",");
  var NOISE_WORDS = ["effacer", "clear", "recherche"];
  function getAutocompleteOptions(autocomplete) {
    const localOptions = deepQueryAll(OPTION_SELECTOR, autocomplete ?? document);
    const filteredLocal = localOptions.filter((option) => {
      const text = norm(autocompleteOptionText(option));
      if (!text) return false;
      return !NOISE_WORDS.some((word) => text.includes(word));
    });
    if (filteredLocal.length > 0) {
      return filteredLocal;
    }
    return deepQueryAll(OPTION_SELECTOR_STRICT).filter((option) => {
      const text = norm(autocompleteOptionText(option));
      if (!text) return false;
      const rect = option.getBoundingClientRect?.();
      return !rect || rect.width > 0 || rect.height > 0;
    });
  }
  async function waitForAutocompleteOptions(autocomplete, timeoutMs = 2500) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const options = getAutocompleteOptions(autocomplete);
      if (options.length > 0) return options;
      await sleep(100);
    }
    return [];
  }
  function scoreAutocompleteOption(option, expectedValue) {
    const optionText = norm(autocompleteOptionText(option));
    const expected = norm(expectedValue);
    if (!optionText) return -1;
    if (optionText === expected) return 100;
    if (optionText.includes(expected)) return 90;
    if (expected.includes(optionText)) return 70;
    const expectedWords = expected.split(" ").filter((w) => w.length >= 3);
    const matchedWords = expectedWords.filter((w) => optionText.includes(w));
    return matchedWords.length;
  }
  async function clickAutocompleteOption(autocomplete, expectedValue) {
    const options = await waitForAutocompleteOptions(autocomplete);
    if (options.length === 0) {
      console.warn("[Autofill] Aucune option autocomplete trouvee pour :", expectedValue);
      return false;
    }
    const ranked = options.map((option) => ({
      option,
      score: scoreAutocompleteOption(option, expectedValue),
      text: autocompleteOptionText(option)
    })).sort((a, b) => b.score - a.score);
    console.table(
      ranked.slice(0, 5).map((x) => ({
        score: x.score,
        text: norm(x.text).slice(0, 120)
      }))
    );
    const best = ranked[0];
    if (!best || best.score < 0) {
      console.warn("[Autofill] Aucune option exploitable pour :", expectedValue);
      return false;
    }
    const chosen = best.score > 0 ? best.option : options[0];
    await clickElement(chosen);
    await sleep(250);
    dispatchAll(chosen);
    dispatchAll(autocomplete);
    console.log("[Autofill] Option autocomplete selectionnee :", autocompleteOptionText(chosen));
    return true;
  }
  async function setAutocompleteValueAndSelect(container, value) {
    const autocomplete = getAutocompleteHost(container);
    if (!autocomplete) {
      return setComponentValue(container, value);
    }
    const input = getNativeInputFromComponent(autocomplete);
    if (!input) {
      console.warn("[Autofill] Input natif introuvable dans autocomplete :", container);
      return setComponentValue(container, value);
    }
    try {
      autocomplete.scrollIntoView({ block: "center", inline: "nearest" });
    } catch {
    }
    await sleep(80);
    try {
      autocomplete.click();
      input.click();
      input.focus();
    } catch {
    }
    await sleep(100);
    nativeSetValue(input, "");
    dispatchAll(input);
    dispatchAll(autocomplete);
    await sleep(100);
    nativeSetValue(input, value);
    dispatchAll(input);
    dispatchAll(autocomplete);
    await sleep(600);
    let selected = await clickAutocompleteOption(autocomplete, value);
    if (!selected) {
      try {
        input.focus();
        keyboard(input, "ArrowDown");
        await sleep(120);
        keyboard(input, "Enter");
        await sleep(200);
        selected = true;
      } catch {
      }
    }
    dispatchAll(input);
    dispatchAll(autocomplete);
    try {
      input.blur();
    } catch {
    }
    await sleep(150);
    return selected;
  }
  async function setScopedAutocompleteField(root, dataTest, value) {
    const field = scopedDataTest(root, dataTest);
    if (!field) {
      console.warn(`[Autofill] Autocomplete introuvable dans le formulaire : ${dataTest}`);
      return false;
    }
    const ok = await setAutocompleteValueAndSelect(field, value);
    console.log(`[Autofill] ${dataTest} autocomplete ->`, ok ? "OK" : "tentative partielle", value);
    return ok;
  }

  // src/forms/smartrecruiters/utils/field.ts
  async function setFieldByDataTest(dataTest, value) {
    const container = findByDataTest(dataTest);
    if (!container) {
      console.warn(`[Autofill] Champ introuvable : ${dataTest}`);
      return false;
    }
    const ok = await setComponentValue(container, value);
    console.log(`[Autofill] ${dataTest} ->`, ok ? "OK" : "tentative partielle");
    return ok;
  }
  async function setScopedField(root, dataTest, value) {
    const field = scopedDataTest(root, dataTest);
    if (!field) {
      console.warn(`[Autofill] Champ introuvable dans le formulaire : ${dataTest}`);
      return false;
    }
    if (getAutocompleteHost(field)) {
      return setAutocompleteValueAndSelect(field, value);
    }
    return setComponentValue(field, value);
  }

  // src/forms/smartrecruiters/utils/location.ts
  function findButtonByText(root, expectedText) {
    const expected = norm(expectedText);
    return deepQueryAll('button, spl-button, [role="button"]', root).find(
      (el) => norm(textOf(el)).includes(expected)
    );
  }
  async function switchLocationToAutocompleteIfNeeded(locationWrapper) {
    if (!locationWrapper) return false;
    const existingAutocomplete = scopedDataTest(locationWrapper, "location-autocomplete") ?? deepQuery('spl-autocomplete[data-test="location-autocomplete"]', locationWrapper) ?? deepQuery('spl-autocomplete[data-sr-id*="location-autocomplete"]', locationWrapper);
    if (existingAutocomplete) return true;
    const switchButton = scopedDataTest(locationWrapper, "manual-location-switch-to-autocomplete") ?? findButtonByText(locationWrapper, "Utiliser la recherche") ?? findButtonByText(locationWrapper, "recherche");
    if (!switchButton) {
      console.warn("[Autofill] Bouton de bascule vers recherche localisation introuvable");
      return false;
    }
    await clickElement(switchButton);
    await sleep(500);
    return true;
  }
  function getLocationAutocomplete(locationWrapper) {
    if (!locationWrapper) return null;
    return scopedDataTest(locationWrapper, "location-autocomplete") ?? deepQuery('spl-autocomplete[data-test="location-autocomplete"]', locationWrapper) ?? deepQuery('spl-autocomplete[data-sr-id*="location-autocomplete"]', locationWrapper) ?? deepQuery("spl-autocomplete", locationWrapper);
  }
  async function setLocationAutocomplete(locationWrapper, locationValue) {
    if (!locationWrapper || !locationValue) return false;
    await switchLocationToAutocompleteIfNeeded(locationWrapper);
    await sleep(300);
    const locationAutocomplete = getLocationAutocomplete(locationWrapper);
    if (!locationAutocomplete) {
      console.warn("[Autofill] Autocomplete localisation introuvable apres bascule");
      return false;
    }
    const ok = await setAutocompleteValueAndSelect(locationAutocomplete, locationValue);
    await sleep(500);
    dispatchAll(locationAutocomplete);
    dispatchAll(locationWrapper);
    console.log("[Autofill] Localisation autocomplete ->", ok ? "OK" : "tentative partielle", locationValue);
    return ok;
  }
  async function fillPersonalLocationAutocomplete(profile) {
    const personalLocation = findByDataTest("personal-info-location");
    if (!personalLocation) {
      console.warn("[Autofill] Bloc localisation personnelle introuvable");
      return false;
    }
    const ok = await setLocationAutocomplete(personalLocation, profile.location);
    if (ok) return true;
    console.warn("[Autofill] Fallback localisation personnelle en mode manuel");
    const countryField = scopedDataTest(personalLocation, "manual-location-country");
    const cityField = scopedDataTest(personalLocation, "manual-location-city");
    if (countryField) {
      await setAutocompleteValueAndSelect(countryField, profile.country);
    }
    if (cityField) {
      await setComponentValue(cityField, profile.city);
    }
    return Boolean(countryField || cityField);
  }
  async function fillLocationScoped(root, locationDataTest, fix) {
    const locationWrapper = scopedDataTest(root, locationDataTest);
    if (!locationWrapper) {
      console.warn(`[Autofill] Bloc localisation introuvable : ${locationDataTest}`);
      return false;
    }
    const ok = await setLocationAutocomplete(locationWrapper, fix.location);
    if (ok) return true;
    console.warn(`[Autofill] Fallback localisation manuel pour : ${locationDataTest}`);
    const countryField = scopedDataTest(locationWrapper, "manual-location-country");
    const cityField = scopedDataTest(locationWrapper, "manual-location-city");
    if (countryField) {
      await setAutocompleteValueAndSelect(countryField, fix.country);
      dispatchAll(countryField);
    }
    if (cityField) {
      await setComponentValue(cityField, fix.city);
      dispatchAll(cityField);
    }
    return Boolean(countryField || cityField);
  }

  // src/forms/smartrecruiters/utils/phone.ts
  async function fillPhoneField(profile) {
    const phoneField = deepQuery("spl-phone-field");
    if (!phoneField) {
      console.warn("[Autofill] spl-phone-field introuvable");
      return false;
    }
    console.log("[Autofill] spl-phone-field trouve :", phoneField);
    const countryCode = profile.phoneCountryCode ?? "FR";
    const phoneValue = {
      value: profile.phoneDisplay,
      country: countryCode,
      internationalFormat: profile.phoneInternational
    };
    const countrySelect = deepQuery("spl-select.c-spl-phone-field-select", phoneField) ?? deepQuery(".c-spl-phone-field-select", phoneField) ?? deepQuery("spl-select", phoneField);
    if (countrySelect) {
      try {
        countrySelect.value = countryCode;
      } catch {
      }
      try {
        countrySelect.setAttribute("value", countryCode);
      } catch {
      }
      dispatchAll(countrySelect);
      console.log("[Autofill] Selecteur pays telephone trouve :", countrySelect);
    } else {
      console.warn("[Autofill] Selecteur pays telephone introuvable");
    }
    await sleep(150);
    const phoneSplInput = deepQuery("spl-input.c-spl-phone-field-input", phoneField) ?? deepQuery(".c-spl-phone-field-input", phoneField);
    if (!phoneSplInput) {
      console.warn("[Autofill] spl-input.c-spl-phone-field-input introuvable");
      console.log(
        "[Autofill] Diagnostic inputs dans spl-phone-field :",
        deepQueryAll("spl-input, input", phoneField).map((el) => ({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          autocomplete: el.getAttribute?.("autocomplete"),
          ariaLabel: el.getAttribute?.("aria-label"),
          placeholder: el.getAttribute?.("placeholder")
        }))
      );
      return false;
    }
    console.log("[Autofill] spl-input telephone trouve :", phoneSplInput);
    const phoneNativeInput = deepQuery('input:not([type="file"])', phoneSplInput) ?? deepQuery('input:not([type="file"])', phoneField);
    if (!phoneNativeInput) {
      console.warn("[Autofill] input natif du telephone introuvable");
      return false;
    }
    console.log("[Autofill] input natif telephone trouve :", phoneNativeInput);
    const nationalPhone = profile.phoneDisplay;
    const W = getRootWindow();
    try {
      phoneNativeInput.scrollIntoView({ block: "center", inline: "nearest" });
    } catch {
    }
    try {
      phoneNativeInput.click();
      phoneNativeInput.focus();
    } catch {
    }
    await sleep(100);
    nativeSetValue(phoneNativeInput, "");
    dispatchAll(phoneNativeInput);
    dispatchAll(phoneSplInput);
    dispatchAll(phoneField);
    await sleep(80);
    nativeSetValue(phoneNativeInput, nationalPhone);
    await sleep(150);
    try {
      phoneNativeInput.focus();
      phoneNativeInput.select?.();
      W.document.execCommand("insertText", false, nationalPhone);
    } catch {
    }
    await sleep(150);
    try {
      phoneSplInput.value = nationalPhone;
    } catch {
    }
    try {
      phoneSplInput.setAttribute("value", nationalPhone);
    } catch {
    }
    dispatchAll(phoneNativeInput);
    dispatchAll(phoneSplInput);
    await sleep(150);
    try {
      phoneField.value = phoneValue;
    } catch {
    }
    try {
      phoneField.setAttribute("value", JSON.stringify(phoneValue));
    } catch {
    }
    dispatchAll(phoneField);
    await sleep(200);
    console.log("[Autofill] Telephone rempli. Valeur input :", phoneNativeInput.value);
    return true;
  }

  // src/forms/smartrecruiters/fill/fillTextFields.ts
  async function fillTextFields(profile) {
    await setFieldByDataTest("personal-info-first-name-input", profile.firstName);
    await setFieldByDataTest("personal-info-last-name-input", profile.lastName);
    await setFieldByDataTest("personal-info-email-input", profile.email);
    await setFieldByDataTest("personal-info-email-confirm-input", profile.email);
    await fillPersonalLocationAutocomplete(profile);
    await fillPhoneField(profile);
    if (profile.linkedIn) {
      await setFieldByDataTest("web-profiles-linkedin", profile.linkedIn);
    }
    const website = profile.website ?? profile.github;
    if (website) {
      await setFieldByDataTest("web-profiles-website", website);
    }
    if (profile.hiringMessage) {
      await setFieldByDataTest("hiring-manager-message-text", profile.hiringMessage);
    }
  }

  // src/forms/smartrecruiters/utils/addEntry.ts
  async function ensureEditFormCount(addButtonDataTest, editFormDataTest, desiredCount) {
    if (!desiredCount || desiredCount <= 0) return;
    const countOpenForms = () => document.querySelectorAll(`[data-test="${editFormDataTest}"]`).length;
    const maxAttempts = desiredCount + 10;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const currentCount = countOpenForms();
      if (currentCount >= desiredCount) return;
      const addButton = findByDataTest(addButtonDataTest);
      if (!addButton) {
        console.warn(
          `[Autofill] Bouton "${addButtonDataTest}" introuvable, impossible d'ajouter d'autres blocs.`
        );
        return;
      }
      await clickElement(addButton);
      await sleep(500);
      if (countOpenForms() <= currentCount) {
        await sleep(300);
      }
    }
    const finalCount = countOpenForms();
    if (finalCount < desiredCount) {
      console.warn(
        `[Autofill] Seulement ${finalCount}/${desiredCount} blocs "${editFormDataTest}" ouverts apres plusieurs clics sur "${addButtonDataTest}".`
      );
    }
  }

  // src/forms/smartrecruiters/utils/checkbox.ts
  async function setCheckboxScoped(root, dataTest, expectedChecked) {
    const wrapper = scopedDataTest(root, dataTest);
    if (!wrapper) return false;
    const checkbox = deepQuery("spl-checkbox", wrapper) ?? deepQuery('input[type="checkbox"]', wrapper) ?? wrapper;
    const nativeInput = deepQuery('input[type="checkbox"]', checkbox);
    const checkboxAny = checkbox;
    const currentChecked = nativeInput?.checked ?? checkboxAny.checked ?? (checkbox.getAttribute?.("checked") === "true" || checkbox.getAttribute?.("value") === "true");
    if (Boolean(currentChecked) !== Boolean(expectedChecked)) {
      await clickElement(checkbox);
      await sleep(150);
    }
    try {
      checkboxAny.checked = Boolean(expectedChecked);
    } catch {
    }
    try {
      checkboxAny.value = String(Boolean(expectedChecked));
    } catch {
    }
    dispatchAll(checkbox);
    if (nativeInput) dispatchAll(nativeInput);
    return true;
  }

  // src/forms/smartrecruiters/utils/date.ts
  function getFlatpickrInstance(input) {
    const fp = input?._flatpickr;
    return fp && typeof fp.setDate === "function" ? fp : null;
  }
  function parseMonthYear(value) {
    const parts = value.trim().split(/[/\-.]/).map((part) => part.trim()).filter(Boolean);
    if (parts.length < 2) return null;
    const [monthStr, yearStr] = parts.length >= 3 ? [parts[1], parts[2]] : [parts[0], parts[1]];
    const month = Number.parseInt(monthStr, 10);
    const year = Number.parseInt(yearStr, 10);
    if (!Number.isInteger(month) || !Number.isInteger(year)) return null;
    if (month < 1 || month > 12) return null;
    return new Date(year, month - 1, 1);
  }
  async function setDateScoped(root, dataTest, value) {
    if (!value) return false;
    const wrapper = scopedDataTest(root, dataTest);
    if (!wrapper) return false;
    const dateField = deepQuery("spl-date-field", wrapper) ?? deepQuery("spl-date-picker", wrapper) ?? wrapper;
    const nativeInput = deepQuery("input.flatpickr-input", dateField) ?? deepQuery('input[type="text"]', dateField);
    if (nativeInput) {
      try {
        nativeInput.scrollIntoView({ block: "center", inline: "nearest" });
        nativeInput.click();
        nativeInput.focus();
      } catch {
      }
      await sleep(80);
      const fp = getFlatpickrInstance(nativeInput);
      const parsedDate = parseMonthYear(value);
      if (fp && parsedDate) {
        fp.setDate(parsedDate, true);
        await sleep(80);
        try {
          nativeInput.blur();
        } catch {
        }
        dispatchAll(nativeInput);
        dispatchAll(dateField);
        dispatchAll(wrapper);
        return true;
      }
      nativeSetValue(nativeInput, "");
      await sleep(50);
      nativeSetValue(nativeInput, value);
      dispatchAll(nativeInput);
    }
    try {
      dateField.value = value;
    } catch {
    }
    try {
      dateField.setAttribute("value", value);
    } catch {
    }
    dispatchAll(dateField);
    dispatchAll(wrapper);
    return true;
  }

  // src/forms/smartrecruiters/fill/save.ts
  async function saveFormIfEnabled(form, saveDataTest, enabled) {
    if (!enabled) return false;
    const save = scopedDataTest(form, saveDataTest);
    if (!save) return false;
    await sleep(250);
    await clickElement(save);
    console.log(`[Autofill] Sauvegarde demandee : ${saveDataTest}`);
    return true;
  }

  // src/forms/smartrecruiters/fill/fillEducation.ts
  async function fillOneEducationFormWithFix(form, fix, saveAfterFill) {
    if (!form || !fix) return false;
    await setScopedAutocompleteField(form, "institution-autocomplete", fix.institution);
    await sleep(200);
    await setScopedField(form, "education-major", fix.major);
    await sleep(100);
    await setScopedField(form, "education-degree", fix.degree);
    await sleep(100);
    await fillLocationScoped(form, "education-form-location", fix);
    await sleep(100);
    await setDateScoped(form, "education-date-from", fix.dateFrom);
    await sleep(100);
    await setDateScoped(form, "education-date-to", fix.dateTo);
    await sleep(100);
    await setCheckboxScoped(form, "education-current", fix.current);
    if (fix.description) {
      await setScopedField(form, "education-description", fix.description);
    }
    dispatchAll(form);
    console.log("[Autofill] Formation remplie par ordre :", fix.institution, fix.degree);
    await saveFormIfEnabled(form, "education-save", saveAfterFill);
    return true;
  }
  async function fillVisibleEducationForms(educations, saveAfterFill) {
    await ensureEditFormCount("add-education", "education-edit-form", educations?.length ?? 0);
    await sleep(200);
    const forms = [...document.querySelectorAll('[data-test="education-edit-form"]')];
    let count = 0;
    for (let index = 0; index < forms.length; index += 1) {
      const form = forms[index];
      const fix = educations?.[index];
      if (!fix) {
        console.warn(`[Autofill] Aucune formation prevue pour le formulaire index ${index}`);
        continue;
      }
      const ok = await fillOneEducationFormWithFix(form, fix, saveAfterFill);
      if (ok) count += 1;
      await sleep(300);
    }
    return count;
  }

  // src/forms/smartrecruiters/fill/fillExperience.ts
  async function fillOneExperienceFormWithFix(form, fix, saveAfterFill) {
    if (!form || !fix) return false;
    await setScopedAutocompleteField(form, "job-title-autocomplete", fix.title);
    await sleep(200);
    await setScopedAutocompleteField(form, "company-autocomplete", fix.company);
    await sleep(200);
    await fillLocationScoped(form, "experience-form-location", fix);
    await sleep(100);
    await setScopedField(form, "experience-description", fix.description);
    await sleep(100);
    await setDateScoped(form, "experience-date-from", fix.dateFrom);
    await sleep(100);
    await setDateScoped(form, "experience-date-to", fix.dateTo);
    await sleep(100);
    await setCheckboxScoped(form, "experience-current", fix.current);
    dispatchAll(form);
    console.log("[Autofill] Experience remplie par ordre :", fix.title, fix.company);
    await saveFormIfEnabled(form, "experience-save", saveAfterFill);
    return true;
  }
  async function fillVisibleExperienceForms(experiences, saveAfterFill) {
    await ensureEditFormCount("add-experience", "experience-edit-form", experiences?.length ?? 0);
    await sleep(200);
    const forms = [...document.querySelectorAll('[data-test="experience-edit-form"]')];
    let count = 0;
    for (let index = 0; index < forms.length; index += 1) {
      const form = forms[index];
      const fix = experiences?.[index];
      if (!fix) {
        console.warn(`[Autofill] Aucune experience prevue pour le formulaire index ${index}`);
        continue;
      }
      const ok = await fillOneExperienceFormWithFix(form, fix, saveAfterFill);
      if (ok) count += 1;
      await sleep(300);
    }
    return count;
  }

  // src/forms/smartrecruiters/fill/fillAll.ts
  var notify = createNotifier({ id: "sr-autofill-status" });
  async function fillAll(config) {
    notify("Preremplissage en cours...");
    const saveAfterFill = Boolean(config.saveAfterExperienceEducationFill);
    await fillTextFields(config.profile);
    await sleep(500);
    await fillVisibleEducationForms(config.educations, saveAfterFill);
    await sleep(500);
    await fillVisibleExperienceForms(config.experiences, saveAfterFill);
    await sleep(500);
    const invalidCount = markInvalids();
    notify(
      `Preremplissage termine. Champs encore invalides detectes : ${invalidCount}. Verifie les champs entoures en rouge avant d'envoyer.`
    );
    console.log("[Autofill] Diagnostic shadow roots :");
    debugShadowRoots();
  }

  // src/forms/smartrecruiters/ui.ts
  var BUTTON_ID = "sr-autofill-button";
  function installSmartRecruitersButton(config) {
    const install = () => installAutofillButton({
      id: BUTTON_ID,
      label: config.buttonLabel ?? "Remplir candidature",
      onClick: () => fillAll(config)
    });
    install();
    observeAndReinstallButton(install);
    notify("Bouton Tampermonkey pret. Clique sur \xAB Remplir candidature \xBB, puis verifie avant d'envoyer.");
  }

  // src/forms/smartrecruiters/index.ts
  function init(config) {
    installSmartRecruitersButton(config);
  }
  var run = fillAll;

  // src/forms/successfactors/index.ts
  var successfactors_exports = {};
  __export(successfactors_exports, {
    init: () => init2,
    run: () => run2
  });

  // src/forms/successfactors/utils/labels.ts
  var SECTION_LABELS = {
    profile: ["profile information", "informations du profil", "informations personnelles"],
    employment: ["employment history", "historique professionnel", "historique d'emploi", "experience professionnelle"],
    education: ["education", "formation"],
    languages: ["language skills", "competences linguistiques", "langues"]
  };
  var FIELD_LABELS = {
    firstName: ["first name", "prenom"],
    lastName: ["last name", "nom"],
    email: ["email", "e-mail", "courriel"],
    phone: ["phone", "telephone"],
    address1: ["address 1", "adresse 1"],
    address2: ["address 2", "adresse 2"],
    city: ["city", "ville"],
    stateProvince: ["state / province", "etat / province", "region"],
    zip: ["zip code", "code postal"],
    employer: ["employer name", "nom de l'employeur", "employeur"],
    jobTitle: ["job title", "intitule du poste", "titre du poste"],
    schoolOther: ["if other, please specify", "si autre, veuillez preciser"]
  };
  var COMBO_TITLES = {
    gender: ["gender", "genre", "sexe"],
    civility: ["title", "civilite"],
    country: ["country", "pays"],
    nationality: ["nationality", "nationalite"],
    preferredContact: ["preferred way of contact", "moyen de contact prefere"],
    industry: ["industry", "secteur"],
    school: ["school / college / university", "ecole / universite", "etablissement"],
    highestLevel: ["highest level of education", "niveau d'etudes le plus eleve", "niveau de formation"],
    yearOfDegree: ["year of degree", "annee d'obtention", "annee du diplome"],
    areaOfStudy: ["area of study", "domaine d'etudes", "domaine d etude"],
    language: ["language", "langue"],
    proficiency: ["proficiency", "niveau de maitrise", "maitrise"],
    howDidYouHear: ["how did you hear about this position", "comment avez-vous entendu parler de ce poste"]
  };
  var DATE_TITLES = {
    from: ["from", "du", "de"],
    to: ["to", "au", "a"],
    dateOfDegree: ["date of highest level of education", "date du niveau d'etudes le plus eleve", "date du diplome"]
  };
  function matchesLabel(text, synonyms) {
    const t = norm(text);
    if (!t) return false;
    return synonyms.some((syn) => t === norm(syn) || t.includes(norm(syn)));
  }
  function equalsLabel(text, synonyms) {
    const t = norm(text);
    if (!t) return false;
    return synonyms.some((syn) => t === norm(syn));
  }

  // src/forms/successfactors/utils/sections.ts
  function sectionTopBars() {
    return [...document.querySelectorAll(".rcmFormSectionTopBar")];
  }
  function isInRange(el, range) {
    if (el === range.start) return true;
    const afterStart = Boolean(
      range.start.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING
    );
    if (!afterStart) return false;
    if (!range.end) return true;
    return Boolean(el.compareDocumentPosition(range.end) & Node.DOCUMENT_POSITION_FOLLOWING);
  }
  function findSection(synonyms) {
    const bars = sectionTopBars();
    for (let i = 0; i < bars.length; i++) {
      if (matchesLabel(bars[i].textContent, synonyms)) {
        return { start: bars[i], end: bars[i + 1] ?? null };
      }
    }
    console.warn("[Autofill] Section introuvable :", synonyms[0]);
    return null;
  }
  function elementsInRange(elements, range) {
    return elements.filter((el) => isInRange(el, range)).sort(
      (a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    );
  }
  function splitIntoBlocks(anchors, section) {
    const sorted = elementsInRange(anchors, section);
    return sorted.map((anchor, i) => ({
      start: anchor,
      end: sorted[i + 1] ?? section.end
    }));
  }

  // src/forms/successfactors/utils/fields.ts
  function allFieldLabels() {
    return [...document.querySelectorAll("label.rcmFormFieldLabel")];
  }
  function findLabels(synonyms, range) {
    const matching = allFieldLabels().filter((label) => matchesLabel(label.textContent, synonyms));
    if (!range) return matching;
    return elementsInRange(matching, range);
  }
  function targetOfLabel(label) {
    const forId = label?.getAttribute("for");
    if (!forId) return null;
    return document.getElementById(forId);
  }
  function findFieldTarget(synonyms, range) {
    return targetOfLabel(findLabels(synonyms, range)[0] ?? null);
  }
  async function setTextField(synonyms, value, range) {
    if (value === void 0) return true;
    const target = findFieldTarget(synonyms, range);
    if (!(target instanceof HTMLInputElement)) {
      console.warn("[Autofill] Champ texte introuvable :", synonyms[0]);
      return false;
    }
    const ok = nativeSetValue(target, value);
    console.log(`[Autofill] ${synonyms[0]} ->`, ok ? "OK" : "echec");
    return ok;
  }

  // src/forms/successfactors/utils/paginatedSelect.ts
  var OPTION_SELECTOR2 = '[role="option"], li, [class*="option" i]';
  function comboInput(target) {
    if (target instanceof HTMLInputElement) return target;
    return null;
  }
  function findComboByTitle(synonyms, range) {
    const combos = [
      ...document.querySelectorAll("input.rcmpaginatedselectinput")
    ].filter(
      (el) => matchesLabel(el.getAttribute("title"), synonyms) || matchesLabel(el.getAttribute("aria-label"), synonyms)
    );
    if (!range) return combos[0] ?? null;
    return elementsInRange(combos, range)[0] ?? null;
  }
  function visibleOptions(container) {
    return [...container.querySelectorAll(OPTION_SELECTOR2)].filter((el) => {
      const rect = el.getBoundingClientRect?.();
      return (!rect || rect.width > 0 || rect.height > 0) && norm(el.textContent);
    });
  }
  async function waitForOptions(input, timeoutMs = 4e3) {
    const ownsId = input.getAttribute("aria-owns");
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const container = ownsId ? document.getElementById(ownsId) : null;
      if (container) {
        const options = visibleOptions(container);
        if (options.length > 0) return options;
      }
      for (const anyList of document.querySelectorAll('[id$="_listSelect"]')) {
        const options = visibleOptions(anyList);
        if (options.length > 0) return options;
      }
      await sleep(150);
    }
    return [];
  }
  function scoreOption(option, expected) {
    const text = norm(option.textContent);
    const wanted = norm(expected);
    if (!text) return -1;
    if (text === wanted) return 100;
    if (text.includes(wanted)) return 90;
    if (wanted.includes(text)) return 70;
    const words = wanted.split(" ").filter((w) => w.length >= 3);
    return words.filter((w) => text.includes(w)).length;
  }
  async function waitForComboEnabled(input, timeoutMs = 5e3) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (!input.disabled && input.getAttribute("disabled") === null) return true;
      await sleep(200);
    }
    return false;
  }
  async function setPaginatedSelect(input, value) {
    if (!input) return false;
    await waitForComboEnabled(input, 2e3);
    try {
      input.scrollIntoView({ block: "center", inline: "nearest" });
    } catch {
    }
    await clickElement(input);
    try {
      input.focus();
    } catch {
    }
    await sleep(200);
    nativeSetValue(input, value);
    await sleep(500);
    let options = await waitForOptions(input);
    if (options.length === 0) {
      nativeSetValue(input, "");
      await sleep(400);
      options = await waitForOptions(input);
    }
    if (options.length === 0) {
      console.warn("[Autofill] Aucune option pour le combo :", value);
      keyboard(input, "ArrowDown");
      await sleep(150);
      keyboard(input, "Enter");
      await sleep(150);
      return false;
    }
    const ranked = options.map((option) => ({ option, score: scoreOption(option, value) })).sort((a, b) => b.score - a.score);
    const best = ranked[0];
    if (!best || best.score <= 0) {
      console.warn("[Autofill] Aucune option ne matche :", value);
      return false;
    }
    await clickElement(best.option);
    await sleep(250);
    dispatchAll(input);
    try {
      input.blur();
    } catch {
    }
    console.log("[Autofill] Combo ->", value, ":", norm(best.option.textContent).slice(0, 80));
    return true;
  }
  async function setComboByLabel(synonyms, value, range) {
    if (value === void 0) return true;
    const input = comboInput(findFieldTarget(synonyms, range)) ?? findComboByTitle(synonyms, range);
    if (!input) {
      console.warn("[Autofill] Combo introuvable :", synonyms[0]);
      return false;
    }
    return setPaginatedSelect(input, value);
  }

  // src/forms/successfactors/fill/fillProfile.ts
  async function fillProfile(profile) {
    const section = findSection(SECTION_LABELS.profile);
    await setTextField(FIELD_LABELS.firstName, profile.firstName, section);
    await setTextField(FIELD_LABELS.lastName, profile.lastName, section);
    await setTextField(FIELD_LABELS.email, profile.email, section);
    await setTextField(FIELD_LABELS.phone, profile.phone, section);
    await setTextField(FIELD_LABELS.address1, profile.address1, section);
    await setTextField(FIELD_LABELS.address2, profile.address2, section);
    await setTextField(FIELD_LABELS.city, profile.city, section);
    await setTextField(FIELD_LABELS.stateProvince, profile.stateProvince, section);
    await setTextField(FIELD_LABELS.zip, profile.zip, section);
    await setComboByLabel(COMBO_TITLES.gender, profile.gender, section);
    await sleep(200);
    await setComboByLabel(COMBO_TITLES.civility, profile.title, section);
    await sleep(200);
    await setComboByLabel(COMBO_TITLES.country, profile.country, section);
    await sleep(200);
    await setComboByLabel(COMBO_TITLES.nationality, profile.nationality, section);
    await sleep(200);
    await setComboByLabel(COMBO_TITLES.preferredContact, profile.preferredContact, section);
  }

  // src/forms/successfactors/utils/datePicker.ts
  var DATE_WIDGET_SELECTOR = '[data-testid="datePicker"], ui5-date-picker-xweb-calendar-widget';
  function findDatePicker(synonyms, range) {
    const widgets = [...document.querySelectorAll(DATE_WIDGET_SELECTOR)].filter(
      (el) => equalsLabel(el.getAttribute("title"), synonyms) || equalsLabel(el.getAttribute("accessible-name"), synonyms) || matchesLabel(el.getAttribute("title"), synonyms)
    );
    if (!range) return widgets[0] ?? null;
    return elementsInRange(widgets, range)[0] ?? null;
  }
  async function setDatePicker(synonyms, value, range) {
    if (value === void 0) return true;
    const widget = findDatePicker(synonyms, range);
    if (!widget) {
      console.warn("[Autofill] Date picker introuvable :", synonyms[0]);
      return false;
    }
    try {
      widget.scrollIntoView({ block: "center", inline: "nearest" });
    } catch {
    }
    const inner = deepQuery("input.ui5-input-inner, input[inner-input]", widget);
    if (inner instanceof HTMLInputElement) {
      try {
        inner.focus();
      } catch {
      }
      await sleep(80);
      nativeSetValue(inner, value);
      keyboard(inner, "Enter");
      await sleep(120);
      try {
        inner.blur();
      } catch {
      }
      dispatchAll(widget);
      console.log(`[Autofill] Date ${synonyms[0]} ->`, value);
      return true;
    }
    try {
      widget.value = value;
      widget.setAttribute("value", value);
      dispatchAll(widget);
      console.log(`[Autofill] Date ${synonyms[0]} (fallback attribut) ->`, value);
      return true;
    } catch {
      console.warn("[Autofill] Impossible de poser la date :", synonyms[0]);
      return false;
    }
  }

  // src/forms/successfactors/fill/fillExperience.ts
  async function fillExperienceBlock(entry, block) {
    await setTextField(FIELD_LABELS.employer, entry.employer, block);
    await setTextField(FIELD_LABELS.jobTitle, entry.jobTitle, block);
    await setDatePicker(DATE_TITLES.from, entry.dateFrom, block);
    await setDatePicker(DATE_TITLES.to, entry.dateTo, block);
    await setComboByLabel(COMBO_TITLES.industry, entry.industry, block);
    await sleep(200);
    await setComboByLabel(COMBO_TITLES.country, entry.country, block);
  }
  async function fillExperiences(entries) {
    if (!entries?.length) return 0;
    const section = findSection(SECTION_LABELS.employment);
    if (!section) return 0;
    const anchors = findLabels(FIELD_LABELS.employer, section);
    const blocks = splitIntoBlocks(anchors, section);
    const count = Math.min(entries.length, blocks.length);
    if (entries.length > blocks.length) {
      console.warn(
        `[Autofill] ${entries.length} experiences fournies mais ${blocks.length} blocs affiches. Ajoute des blocs manuellement puis relance.`
      );
    }
    for (let i = 0; i < count; i++) {
      await fillExperienceBlock(entries[i], blocks[i]);
      await sleep(300);
    }
    return count;
  }

  // src/forms/successfactors/fill/fillEducation.ts
  async function fillEducationBlock(entry, block) {
    await setComboByLabel(COMBO_TITLES.country, entry.country, block);
    await sleep(400);
    if (entry.school !== void 0) {
      const school = findComboByTitle(COMBO_TITLES.school, block);
      if (school) await waitForComboEnabled(school);
      await setComboByLabel(COMBO_TITLES.school, entry.school, block);
      await sleep(200);
    }
    await setTextField(FIELD_LABELS.schoolOther, entry.schoolOther, block);
    await setComboByLabel(COMBO_TITLES.highestLevel, entry.highestLevel, block);
    await sleep(200);
    await setComboByLabel(COMBO_TITLES.yearOfDegree, entry.yearOfDegree, block);
    await sleep(200);
    await setDatePicker(DATE_TITLES.dateOfDegree, entry.dateOfDegree, block);
    await setComboByLabel(COMBO_TITLES.areaOfStudy, entry.areaOfStudy, block);
  }
  async function fillEducations(entries) {
    if (!entries?.length) return 0;
    const section = findSection(SECTION_LABELS.education);
    if (!section) return 0;
    const anchors = findLabels(COMBO_TITLES.country, section);
    const blocks = splitIntoBlocks(anchors, section);
    const count = Math.min(entries.length, blocks.length);
    if (entries.length > blocks.length) {
      console.warn(
        `[Autofill] ${entries.length} formations fournies mais ${blocks.length} blocs affiches. Ajoute des blocs manuellement puis relance.`
      );
    }
    for (let i = 0; i < count; i++) {
      await fillEducationBlock(entries[i], blocks[i]);
      await sleep(300);
    }
    return count;
  }

  // src/forms/successfactors/fill/fillLanguages.ts
  async function fillLanguages(entries) {
    if (!entries?.length) return 0;
    const section = findSection(SECTION_LABELS.languages);
    if (!section) return 0;
    const anchors = findLabels(COMBO_TITLES.language, section);
    const blocks = splitIntoBlocks(anchors, section);
    const count = Math.min(entries.length, blocks.length);
    if (entries.length > blocks.length) {
      console.warn(
        `[Autofill] ${entries.length} langues fournies mais ${blocks.length} blocs affiches.`
      );
    }
    for (let i = 0; i < count; i++) {
      await setComboByLabel(COMBO_TITLES.language, entries[i].language, blocks[i]);
      await sleep(200);
      await setComboByLabel(COMBO_TITLES.proficiency, entries[i].proficiency, blocks[i]);
      await sleep(200);
    }
    return count;
  }

  // src/forms/successfactors/fill/fillMisc.ts
  async function fillMisc(config) {
    if (config.howDidYouHear === void 0) return;
    await setComboByLabel(COMBO_TITLES.howDidYouHear, config.howDidYouHear);
    await sleep(800);
    if (config.howDidYouHearDetail === void 0) return;
    const first = findFieldTarget(COMBO_TITLES.howDidYouHear) ?? findComboByTitle(COMBO_TITLES.howDidYouHear);
    const cascade = first?.closest(".sfCascadingPicklist") ?? first?.closest("span");
    if (!cascade) {
      console.warn("[Autofill] Conteneur du picklist en cascade introuvable.");
      return;
    }
    const detail = [
      ...cascade.querySelectorAll("input.rcmpaginatedselectinput")
    ].find((el) => el !== first && !el.value);
    if (!detail) {
      console.warn("[Autofill] Second combo de detail introuvable (pas encore affiche ?).");
      return;
    }
    await setPaginatedSelect(detail, config.howDidYouHearDetail);
  }

  // src/forms/successfactors/fill/fillAll.ts
  var notify2 = createNotifier({ id: "sf-autofill-status" });
  function countMissingRequired() {
    let missing = 0;
    for (const input of document.querySelectorAll(
      'input[data-testid="sfTextField"][aria-required="true"]'
    )) {
      if (!input.value.trim()) missing++;
    }
    for (const combo of document.querySelectorAll(
      'input.rcmpaginatedselectinput[aria-required="true"]'
    )) {
      if (!combo.value.trim() && !combo.getAttribute("title")?.trim()) missing++;
    }
    return missing;
  }
  async function fillAll2(config) {
    notify2("Preremplissage en cours...");
    await fillProfile(config.profile);
    await sleep(500);
    const nbExp = await fillExperiences(config.experiences);
    await sleep(500);
    const nbEdu = await fillEducations(config.educations);
    await sleep(500);
    const nbLang = await fillLanguages(config.languages);
    await sleep(500);
    await fillMisc(config);
    await sleep(300);
    const missing = countMissingRequired();
    notify2(
      `Preremplissage termine (${nbExp} exp., ${nbEdu} form., ${nbLang} langues). Champs obligatoires encore vides : ${missing}. Verifie tout avant d'envoyer \u2014 rien n'est soumis automatiquement.`
    );
  }

  // src/forms/successfactors/ui.ts
  var BUTTON_ID2 = "sf-autofill-button";
  function installSuccessFactorsButton(config) {
    const install = () => installAutofillButton({
      id: BUTTON_ID2,
      label: config.buttonLabel ?? "Remplir candidature",
      onClick: () => fillAll2(config)
    });
    install();
    observeAndReinstallButton(install);
    notify2("Bouton Tampermonkey pret. Clique sur \xAB Remplir candidature \xBB, puis verifie avant d'envoyer.");
  }

  // src/forms/successfactors/index.ts
  function init2(config) {
    installSuccessFactorsButton(config);
  }
  var run2 = fillAll2;

  // src/forms/talentsoft/index.ts
  var talentsoft_exports = {};
  __export(talentsoft_exports, {
    init: () => init3,
    run: () => run3
  });

  // src/forms/talentsoft/utils/labels.ts
  var SECTION_LABELS2 = {
    personal: ["informations personnelles", "personal information"],
    files: ["ajouter des fichiers", "documents", "files"],
    professionalBackground: ["parcours professionnel", "professional background", "experience professionnelle"],
    // NB: pas de synonyme "formation" seul : c'est une sous-chaine de
    // "informations personnelles", ce qui ferait matcher la mauvaise Section.
    academicBackground: ["parcours academique", "formation academique", "cursus scolaire", "education", "academic background"],
    languages: ["langues", "languages"],
    contact: ["langue preferee pour les futurs contacts", "preferred contact language"]
  };
  var FIELD_LABELS2 = {
    firstName: ["prenom", "first name"],
    lastName: ["nom de famille", "last name"],
    email: ["e-mail", "email", "courriel"],
    gender: ["sexe", "genre", "gender"],
    addressCountry: ["pays"],
    disability: ["j'ai un handicap", "handicap", "disability"],
    yearsOfExperience: ["annees d'experience", "years of experience"],
    internationalExperience: ["experience internationale", "international experience"],
    internationalExperienceCountries: [
      "avez-vous une experience professionnelle internationale",
      "countries with international"
    ],
    cv: ["ajouter un cv", "cv", "resume"],
    coverLetter: ["lettre de motivation", "cover letter"],
    otherFiles: ["autres fichiers", "other files"],
    employer: ["societe employeur", "employer"],
    jobTitle: ["intitule du poste", "job title"],
    dateFrom: ["date de debut", "start date"],
    dateTo: ["date de fin", "end date"],
    responsibilities: ["responsabilites", "responsibilities"],
    experienceDataset: ["experience professionnelle"],
    schoolName: ["nom de l'ecole", "school name"],
    graduationDate: ["annee du diplome", "year of degree", "graduation"],
    fieldOfStudy: ["domaine principal d'etude", "field of study"],
    educationLevel: ["niveau d'etudes", "level of education"],
    averageGrade: ["moyenne scolaire", "average grade", "gpa"],
    skillsDataset: ["liste des competences", "list of skills"],
    skillLevel: ["niveau de maitrise", "proficiency"],
    languageLevel: ["niveau linguistique", "language level"],
    preferredContactLanguage: ["langue preferee pour les futurs contacts", "preferred contact language"],
    howDidYouHear: ["comment avez-vous entendu parler", "how did you hear"],
    howDidYouHearOther: ["autre (merci de preciser)", "other, please specify"],
    acceptPrivacyPolicy: ["j'accepte", "i accept", "politique de confidentialite", "privacy policy"]
  };
  function matchesLabel2(text, synonyms) {
    const t = norm(text);
    if (!t) return false;
    return synonyms.some((syn) => t === norm(syn) || t.includes(norm(syn)));
  }

  // src/forms/talentsoft/utils/containers.ts
  function findSection2(synonyms, root = document) {
    const sections = [...root.querySelectorAll("fieldset.Section")];
    for (const section of sections) {
      const legend = section.querySelector("legend.tc_formTitle");
      if (legend && matchesLabel2(legend.textContent, synonyms)) return section;
    }
    console.warn("[Autofill] Section introuvable :", synonyms[0]);
    return null;
  }
  function findDatasetFieldId(synonyms, scope = document) {
    const addLinks = [...scope.querySelectorAll('a[id^="addRowFor_"]')];
    for (const link of addLinks) {
      const fieldId = link.id.replace("addRowFor_", "");
      if (!fieldId) continue;
      const ownLabel = document.getElementById(`${fieldId}-label`);
      if (ownLabel && matchesLabel2(ownLabel.textContent, synonyms)) return fieldId;
      const section = link.closest("fieldset.Section");
      const legend = section?.querySelector("legend.tc_formTitle");
      if (legend && matchesLabel2(legend.textContent, synonyms)) return fieldId;
    }
    console.warn("[Autofill] Bloc repetable introuvable :", synonyms[0]);
    return null;
  }

  // src/forms/talentsoft/utils/fields.ts
  function fieldLabels(container) {
    return [...container.querySelectorAll("label.WizardFieldLabel[for]")];
  }
  function findLabel(synonyms, container = document) {
    return fieldLabels(container).find((label) => matchesLabel2(label.textContent, synonyms)) ?? null;
  }
  function findFieldTarget2(synonyms, container = document) {
    const forId = findLabel(synonyms, container)?.getAttribute("for");
    if (!forId) return null;
    return document.getElementById(forId);
  }
  async function setTextField2(synonyms, value, container = document) {
    if (value === void 0) return true;
    const target = findFieldTarget2(synonyms, container);
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      console.warn("[Autofill] Champ texte introuvable :", synonyms[0]);
      return false;
    }
    const ok = nativeSetValue(target, value);
    console.log(`[Autofill] ${synonyms[0]} ->`, ok ? "OK" : "echec");
    return ok;
  }
  var ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  async function setDateField(synonyms, isoDate, container = document) {
    if (isoDate === void 0) return true;
    if (!ISO_DATE.test(isoDate)) {
      console.warn(
        `[Autofill] Date "${synonyms[0]}" ignoree : format attendu 'YYYY-MM-DD', recu`,
        isoDate
      );
      return false;
    }
    const target = findFieldTarget2(synonyms, container);
    if (!(target instanceof HTMLInputElement)) {
      console.warn("[Autofill] Champ date introuvable :", synonyms[0]);
      return false;
    }
    const ok = nativeSetValue(target, isoDate);
    console.log(`[Autofill] Date ${synonyms[0]} ->`, ok ? isoDate : "echec");
    return ok;
  }

  // src/forms/talentsoft/utils/radio.ts
  function radioGroupLegends(container) {
    return [...container.querySelectorAll("legend.WizardFieldLabel[id]")];
  }
  async function setRadioGroupByLabel(synonyms, optionLabel, container = document) {
    if (optionLabel === void 0) return true;
    const legend = radioGroupLegends(container).find((el) => matchesLabel2(el.textContent, synonyms));
    const groupId = legend?.id.replace(/-label$/, "");
    const group = groupId ? document.getElementById(groupId) : null;
    if (!group) {
      console.warn("[Autofill] Groupe de radio introuvable :", synonyms[0]);
      return false;
    }
    const radios = [...group.querySelectorAll('input[type="radio"]')];
    const wanted = norm(optionLabel);
    const target = radios.find((radio) => {
      const optionName = norm(radio.getAttribute("data-option-name"));
      const label = document.querySelector(`label[for="${radio.id}"]`);
      return optionName === wanted || norm(label?.textContent) === wanted || optionName.includes(wanted);
    });
    if (!target) {
      console.warn("[Autofill] Option de radio introuvable :", optionLabel);
      return false;
    }
    await clickElement(target);
    target.checked = true;
    console.log(`[Autofill] ${synonyms[0]} ->`, optionLabel);
    return true;
  }

  // src/forms/talentsoft/utils/select.ts
  function bestOption(select, value) {
    const wanted = norm(value);
    let best = null;
    for (const option of [...select.options]) {
      const text = norm(option.textContent);
      if (!text) continue;
      let score = -1;
      if (text === wanted) score = 100;
      else if (text.includes(wanted)) score = 90;
      else if (wanted.includes(text)) score = 70;
      if (score > (best?.score ?? -1)) best = { option, score };
    }
    return best && best.score > 0 ? best.option : null;
  }
  function setNativeSelectValue(select, value) {
    if (!select) return false;
    const option = bestOption(select, value);
    if (!option) {
      console.warn("[Autofill] Aucune option ne matche :", value);
      return false;
    }
    select.value = option.value;
    dispatchAll(select);
    return true;
  }
  async function setNativeSelectByLabel(synonyms, value, container = document) {
    if (value === void 0) return true;
    const target = findFieldTarget2(synonyms, container);
    if (!(target instanceof HTMLSelectElement)) {
      console.warn("[Autofill] Select introuvable :", synonyms[0]);
      return false;
    }
    const ok = setNativeSelectValue(target, value);
    console.log(`[Autofill] ${synonyms[0]} ->`, ok ? value : "echec");
    return ok;
  }

  // src/forms/talentsoft/utils/select2.ts
  var RESULT_SELECTOR = '.select2-results__option[role="option"], li.select2-results__option';
  function isUsableResult(el) {
    if (el.getAttribute("aria-disabled") === "true") return false;
    if (el.classList.contains("select2-results__message")) return false;
    if (el.classList.contains("loading-results")) return false;
    return norm(el.textContent).length > 0;
  }
  function visibleResultOptions() {
    return [...document.querySelectorAll(RESULT_SELECTOR)].filter(isUsableResult);
  }
  function selectionBox(fieldId) {
    return document.querySelector(`.select2Container${fieldId}`);
  }
  async function openSelect2(fieldId) {
    const box = selectionBox(fieldId);
    if (!box) return null;
    await clickElement(box);
    await sleep(200);
    return box;
  }
  function searchField(fieldId) {
    const inline = document.getElementById(`${fieldId}-search__field`);
    if (inline instanceof HTMLInputElement) return inline;
    const open = document.querySelector(
      ".select2-container--open .select2-search__field, .select2-dropdown .select2-search__field"
    );
    return open ?? null;
  }
  async function waitForResults(timeoutMs = 6e3) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const options = visibleResultOptions();
      if (options.length > 0) return options;
      await sleep(200);
    }
    return [];
  }
  function scoreOption2(option, expected) {
    const text = norm(option.textContent);
    const wanted = norm(expected);
    if (!text) return -1;
    if (text === wanted) return 100;
    if (text.includes(wanted)) return 90;
    if (wanted.includes(text)) return 70;
    const words = wanted.split(" ").filter((w) => w.length >= 3);
    return words.filter((w) => text.includes(w)).length;
  }
  async function setSelect2Value(fieldId, value) {
    const box = await openSelect2(fieldId);
    if (!box) {
      console.warn("[Autofill] Combo select2 introuvable :", fieldId);
      return false;
    }
    const input = searchField(fieldId);
    if (!input) {
      console.warn("[Autofill] Champ de recherche introuvable pour :", fieldId);
      return false;
    }
    nativeSetValue(input, value);
    await sleep(700);
    const options = await waitForResults();
    if (options.length === 0) {
      console.warn("[Autofill] Aucun resultat pour :", value);
      return false;
    }
    const ranked = options.map((option) => ({ option, score: scoreOption2(option, value) })).sort((a, b) => b.score - a.score);
    const best = ranked[0];
    if (!best || best.score <= 0) {
      console.warn("[Autofill] Aucune option ne matche :", value);
      return false;
    }
    await clickElement(best.option);
    await sleep(300);
    dispatchAll(box);
    console.log("[Autofill] Combo ->", value, ":", norm(best.option.textContent).slice(0, 80));
    return true;
  }
  async function setSelect2ByLabel(synonyms, value, container = document) {
    if (value === void 0) return true;
    const fieldId = findLabel(synonyms, container)?.getAttribute("for");
    if (!fieldId) {
      console.warn("[Autofill] Combo select2 introuvable :", synonyms[0]);
      return false;
    }
    return setSelect2Value(fieldId, value);
  }
  async function addSelect2Values(synonyms, values, container = document) {
    if (!values?.length) return 0;
    const fieldId = findLabel(synonyms, container)?.getAttribute("for");
    if (!fieldId) {
      console.warn("[Autofill] Combo select2 multi introuvable :", synonyms[0]);
      return 0;
    }
    let count = 0;
    for (const value of values) {
      const ok = await setSelect2Value(fieldId, value);
      if (ok) count++;
      await sleep(350);
    }
    return count;
  }

  // src/forms/talentsoft/fill/fillProfile.ts
  async function fillPersonalInfo(profile) {
    const section = findSection2(SECTION_LABELS2.personal) ?? document;
    await setRadioGroupByLabel(FIELD_LABELS2.gender, profile.gender, section);
    await setTextField2(FIELD_LABELS2.firstName, profile.firstName, section);
    await setTextField2(FIELD_LABELS2.lastName, profile.lastName, section);
    await setTextField2(FIELD_LABELS2.email, profile.email, section);
    await sleep(200);
    await setSelect2ByLabel(FIELD_LABELS2.addressCountry, profile.country, section);
  }
  async function fillDisability(profile) {
    if (profile.hasDisability === void 0) return;
    const section = findSection2(SECTION_LABELS2.files) ?? document;
    await setNativeSelectByLabel(FIELD_LABELS2.disability, profile.hasDisability ? "Oui" : "Non", section);
  }
  async function fillExperienceSummary(profile) {
    const section = findSection2(SECTION_LABELS2.professionalBackground) ?? document;
    await setNativeSelectByLabel(FIELD_LABELS2.yearsOfExperience, profile.yearsOfExperience, section);
    await sleep(200);
    if (!profile.hasInternationalExperience) return;
    await setSelect2ByLabel(FIELD_LABELS2.internationalExperience, "Oui", section);
    await sleep(500);
    await addSelect2Values(
      FIELD_LABELS2.internationalExperienceCountries,
      profile.internationalExperienceCountries,
      section
    );
  }
  async function fillProfile2(profile) {
    await fillPersonalInfo(profile);
    await sleep(300);
    await fillDisability(profile);
    await sleep(300);
    await fillExperienceSummary(profile);
  }

  // src/forms/talentsoft/utils/dataset.ts
  function rowsForField(fieldId) {
    const nodes = document.querySelectorAll(
      `[id^="datasetField__row--${fieldId}_"], [id^="multipleDatasetEntry_${fieldId}_"]`
    );
    const rows = [];
    for (const el of nodes) {
      const match = el.id.match(/_(\d+)$/);
      if (!match) continue;
      rows.push({ el, index: Number(match[1]) });
    }
    return rows.sort((a, b) => a.index - b.index);
  }
  async function clickAddAndWaitForNewRow(fieldId, previousIds) {
    const link = document.getElementById(`addRowFor_${fieldId}`);
    if (!link) {
      console.warn('[Autofill] Lien "ajouter" introuvable pour :', fieldId);
      return null;
    }
    await clickElement(link);
    const timeoutMs = 5e3;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const fresh = rowsForField(fieldId).find((row) => !previousIds.has(row.el.id));
      if (fresh) return fresh.el;
      await sleep(150);
    }
    console.warn('[Autofill] Nouvelle ligne non detectee apres clic sur "ajouter" :', fieldId);
    return null;
  }
  async function ensureDatasetRows(fieldId, count) {
    let rows = rowsForField(fieldId);
    while (rows.length < count) {
      const previousIds = new Set(rows.map((row) => row.el.id));
      const newRow = await clickAddAndWaitForNewRow(fieldId, previousIds);
      if (!newRow) break;
      await sleep(250);
      rows = rowsForField(fieldId);
    }
    return rows.map((row) => row.el);
  }

  // src/forms/talentsoft/fill/fillExperience.ts
  async function fillExperienceRow(entry, row) {
    await setTextField2(FIELD_LABELS2.employer, entry.employer, row);
    await setTextField2(FIELD_LABELS2.jobTitle, entry.jobTitle, row);
    await setDateField(FIELD_LABELS2.dateFrom, entry.dateFrom, row);
    await setDateField(FIELD_LABELS2.dateTo, entry.dateTo, row);
    await setTextField2(FIELD_LABELS2.responsibilities, entry.responsibilities, row);
  }
  async function fillExperiences2(entries) {
    if (!entries?.length) return 0;
    const fieldId = findDatasetFieldId(FIELD_LABELS2.experienceDataset);
    if (!fieldId) return 0;
    const rows = await ensureDatasetRows(fieldId, entries.length);
    const count = Math.min(entries.length, rows.length);
    if (entries.length > rows.length) {
      console.warn(
        `[Autofill] ${entries.length} experiences fournies mais seulement ${rows.length} lignes disponibles.`
      );
    }
    for (let i = 0; i < count; i++) {
      await fillExperienceRow(entries[i], rows[i]);
      await sleep(300);
    }
    return count;
  }

  // src/forms/talentsoft/fill/fillEducation.ts
  async function fillEducationRow(entry, row) {
    await setTextField2(FIELD_LABELS2.schoolName, entry.schoolName, row);
    await setDateField(FIELD_LABELS2.graduationDate, entry.graduationDate, row);
    await setTextField2(FIELD_LABELS2.fieldOfStudy, entry.fieldOfStudy, row);
    await setNativeSelectByLabel(FIELD_LABELS2.educationLevel, entry.level, row);
    await setTextField2(FIELD_LABELS2.averageGrade, entry.averageGrade, row);
  }
  async function fillEducations2(entries) {
    if (!entries?.length) return 0;
    const fieldId = findDatasetFieldId(SECTION_LABELS2.academicBackground);
    if (!fieldId) return 0;
    const rows = await ensureDatasetRows(fieldId, entries.length);
    const count = Math.min(entries.length, rows.length);
    if (entries.length > rows.length) {
      console.warn(
        `[Autofill] ${entries.length} formations fournies mais seulement ${rows.length} lignes disponibles.`
      );
    }
    for (let i = 0; i < count; i++) {
      await fillEducationRow(entries[i], rows[i]);
      await sleep(300);
    }
    return count;
  }

  // src/forms/talentsoft/fill/fillSkills.ts
  async function fillSkillRow(entry, row) {
    const nameSelect = row.querySelector("select.select2-hidden-accessible");
    if (nameSelect) {
      await setSelect2Value(nameSelect.id, entry.name);
    } else {
      console.warn("[Autofill] Combo competence introuvable dans la ligne.");
    }
    await sleep(200);
    if (entry.level === void 0) return;
    const levelSelect = [...row.querySelectorAll("select")].find(
      (select) => select !== nameSelect
    );
    if (levelSelect) setNativeSelectValue(levelSelect, entry.level);
  }
  async function fillSkills(entries) {
    if (!entries?.length) return 0;
    const fieldId = findDatasetFieldId(FIELD_LABELS2.skillsDataset);
    if (!fieldId) return 0;
    const rows = await ensureDatasetRows(fieldId, entries.length);
    const count = Math.min(entries.length, rows.length);
    if (entries.length > rows.length) {
      console.warn(
        `[Autofill] ${entries.length} competences fournies mais seulement ${rows.length} lignes disponibles.`
      );
    }
    for (let i = 0; i < count; i++) {
      await fillSkillRow(entries[i], rows[i]);
      await sleep(300);
    }
    return count;
  }

  // src/forms/talentsoft/fill/fillLanguages.ts
  async function fillLanguageRow(entry, row) {
    const [languageSelect, levelSelect] = [...row.querySelectorAll("select")];
    if (languageSelect) setNativeSelectValue(languageSelect, entry.language);
    if (entry.level !== void 0 && levelSelect) setNativeSelectValue(levelSelect, entry.level);
  }
  async function fillLanguages2(entries) {
    if (!entries?.length) return 0;
    const fieldId = findDatasetFieldId(SECTION_LABELS2.languages);
    if (!fieldId) return 0;
    const rows = await ensureDatasetRows(fieldId, entries.length);
    const count = Math.min(entries.length, rows.length);
    if (entries.length > rows.length) {
      console.warn(
        `[Autofill] ${entries.length} langues fournies mais seulement ${rows.length} lignes disponibles.`
      );
    }
    for (let i = 0; i < count; i++) {
      await fillLanguageRow(entries[i], rows[i]);
      await sleep(250);
    }
    return count;
  }

  // src/forms/talentsoft/utils/checkbox.ts
  async function setCheckboxByLabel(synonyms, checked, container = document) {
    if (checked === void 0) return true;
    const subLabel = [...container.querySelectorAll("label.WizardSubFieldLabel[for]")].find(
      (el) => matchesLabel2(el.textContent, synonyms)
    );
    let checkbox = subLabel ? document.getElementById(subLabel.getAttribute("for") ?? "") : null;
    if (!(checkbox instanceof HTMLInputElement)) {
      const legend = [...container.querySelectorAll("legend.WizardFieldLabel[id]")].find(
        (el) => matchesLabel2(el.textContent, synonyms)
      );
      checkbox = legend?.closest("fieldset")?.querySelector('input[type="checkbox"]') ?? null;
    }
    if (!(checkbox instanceof HTMLInputElement)) {
      console.warn("[Autofill] Case a cocher introuvable :", synonyms[0]);
      return false;
    }
    if (checkbox.checked !== checked) {
      await clickElement(checkbox);
    }
    checkbox.checked = checked;
    dispatchAll(checkbox);
    console.log(`[Autofill] ${synonyms[0]} ->`, checked ? "coche" : "decoche");
    return true;
  }

  // src/forms/talentsoft/fill/fillMisc.ts
  async function fillPreferredContactLanguage(value) {
    if (value === void 0) return;
    const section = findSection2(SECTION_LABELS2.contact);
    const select = section?.querySelector(
      "select.SelectFormField:not(.AutoCompleteField):not(.WizardFieldHidden)"
    );
    if (!select) {
      console.warn('[Autofill] Combo "langue preferee pour les futurs contacts" introuvable.');
      return;
    }
    const ok = setNativeSelectValue(select, value);
    console.log("[Autofill] Langue preferee ->", ok ? value : "echec");
  }
  async function fillMisc2(config) {
    await fillPreferredContactLanguage(config.preferredContactLanguage);
    await sleep(200);
    await setSelect2ByLabel(FIELD_LABELS2.howDidYouHear, config.howDidYouHear);
    await sleep(500);
    if (config.howDidYouHearOther !== void 0) {
      await setTextField2(FIELD_LABELS2.howDidYouHearOther, config.howDidYouHearOther);
    }
    await sleep(200);
    await setCheckboxByLabel(FIELD_LABELS2.acceptPrivacyPolicy, config.acceptPrivacyPolicy);
  }

  // src/forms/talentsoft/fill/fillAll.ts
  var notify3 = createNotifier({ id: "ts-autofill-status" });
  function emptyFileFields() {
    const missing = [];
    for (const input of document.querySelectorAll('input[type="file"]')) {
      if (input.files && input.files.length > 0) continue;
      const label = document.querySelector(`label[for="${input.id}"]`);
      missing.push(label?.textContent?.replace("*", "").trim() || input.id);
    }
    return missing;
  }
  async function fillAll3(config) {
    notify3("Preremplissage en cours...");
    await fillProfile2(config.profile);
    await sleep(400);
    const nbExp = await fillExperiences2(config.experiences);
    await sleep(400);
    const nbEdu = await fillEducations2(config.educations);
    await sleep(400);
    const nbSkills = await fillSkills(config.skills);
    await sleep(400);
    const nbLang = await fillLanguages2(config.languages);
    await sleep(400);
    await fillMisc2(config);
    await sleep(300);
    const missingFiles = emptyFileFields();
    notify3(
      `Preremplissage termine (${nbExp} exp., ${nbEdu} formations, ${nbSkills} competences, ${nbLang} langues). ` + (missingFiles.length ? `A joindre a la main (le navigateur bloque le remplissage automatique des fichiers) : ${missingFiles.join(", ")}. ` : "") + "Verifie tout avant d'envoyer \u2014 rien n'est soumis automatiquement."
    );
  }

  // src/forms/talentsoft/ui.ts
  var BUTTON_ID3 = "ts-autofill-button";
  function installTalentsoftButton(config) {
    const install = () => installAutofillButton({
      id: BUTTON_ID3,
      label: config.buttonLabel ?? "Remplir candidature",
      onClick: () => fillAll3(config)
    });
    install();
    observeAndReinstallButton(install);
    notify3("Bouton Tampermonkey pret. Clique sur \xAB Remplir candidature \xBB, puis verifie avant d'envoyer.");
  }

  // src/forms/talentsoft/index.ts
  function init3(config) {
    installTalentsoftButton(config);
  }
  var run3 = fillAll3;
  return __toCommonJS(src_exports);
})();
if (typeof window !== 'undefined') { window.TMAutofill = TMAutofill; }
//# sourceMappingURL=tampermonkey-autofill.js.map
