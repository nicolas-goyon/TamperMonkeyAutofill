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
    SmartRecruiters: () => smartrecruiters_exports
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
    return function notify2(message) {
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
  var norm = (value) => stripDiacritics(String(value ?? "").normalize("NFD")).replace(/\s+/g, " ").trim().toLowerCase();
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
  return __toCommonJS(src_exports);
})();
if (typeof window !== 'undefined') { window.TMAutofill = TMAutofill; }
//# sourceMappingURL=tampermonkey-autofill.js.map
