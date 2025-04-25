/**
 * @file index.js
 * @fileoverview main file and loaded on every page. also contains helper functions
 * @exports *
 */

"use strict";

window.addEventListener("load", function () {
  const localHosts = ["localhost", "", "127.0.0.1"];
  if (!localHosts.includes(window.location.hostname)) {
    removeHTMLFrom(...localHosts);
  }
  document.querySelectorAll("*[data-copy]").forEach((el) => addCopyEvent(el));
  document.addEventListener("scroll", () => {
    const back2top = document.getElementById("back2top");
    if (!back2top) return;
    back2top.style.display = window.scrollY > 100 ? "block" : "none";
  });
});

/**
 * loads before `window.addEventListener("load", () => {})`
 * @returns {void}
 */
function preLoad() {
  if (!["/index.html", "/"].includes(window.location.pathname)) {
    return Theme.fromExisting().set();
  }
  new Theme("dark").set();
  if (Math.random() < 0.2) {
    document.documentElement.style.setProperty(
      "--bg-photo",
      "url('../img/alt_background.png')"
    );
  }
}

/**
 * cleans the github language name
 * @param {string} lang name of lang from github api
 * @returns {string} cleaned name matching css class
 */
function cleanCssGithubLang(lang) {
  const digitToWord = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  return lang
    .replaceAll("+", "P")
    .replaceAll("#", "-Sharp")
    .replace(/\s/g, "-")
    .replaceAll(".", "-")
    .replace(/["'()]/g, "")
    .replace(/^\d/, (m) => digitToWord[m]);
}

/**
 * Gets a c style property from an element
 * @param {string | HTMLElement} id - The element to get the style from
 * @param {string} styleProp - The style property to get
 * @returns {string?} - The value of the style property or undefined if it doesn't exist
 */
function getStyle(id, styleProp) {
  const x = typeof id === "string" ? document.getElementById(id) : id;
  if (!x) return;
  if (x.style[styleProp]) return x.style[styleProp];
  if (window.getComputedStyle) {
    return document.defaultView
      .getComputedStyle(x, null)
      .getPropertyValue(styleProp);
  }
  if (x.currentStyle) return x.currentStyle[styleProp];
}

/**
 * Removes the .html from the end of the href of all anchor tags
 * @param  {...string} hostnames - The hostnames to exclude
 * @returns {void}
 * @example removeHTMLFrom("localhost", "", "127.0.0.1")
 */
function removeHTMLFrom(...hostnames) {
  for (const anchor of document.querySelectorAll("a[href]")) {
    if (hostnames.includes(anchor.href.host)) continue;
    if (anchor.href.endsWith("index.html")) {
      anchor.href = anchor.href.replace("index.html", "");
    } else {
      anchor.href = anchor.href.replace(".html", "");
    }
  }
}

/**
 * Gets the languages used in a repo
 * @param {string} username - The username of the repo owner
 * @param {string} reponame - The name of the repo
 * @param {string} key - The github api key
 * @returns {Promise<{string: number}>} - A promise that resolves to an object of languages and their percentages
 */
async function getRepoLangs(username, reponame, key = null) {
  {
    const ls = await fetchCache(
      `https://api.github.com/repos/${username}/${reponame}/languages`,
      key ? { headers: { Authorization: "token " + key } } : {}
    );

    const languageStats = Object.entries(ls)
      .sort(([, a], [, b]) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    const totalBytes = Object.values(languageStats).reduce(
      (partialSum, a) => partialSum + a,
      0
    );
    return Object.keys(languageStats).reduce((acc, lang) => {
      acc[lang] = (languageStats[lang] * 100) / totalBytes;
      return acc;
    }, {});
  }
}

/**
 * Gets the style of a selector from a stylesheet
 * @param {string} style - The style to get
 * @param {string} selector - The selector to get the style from
 * @param {CSSStyleSheet} sheet - The stylesheet to get the style from
 * @returns {string?} - The value of the style
 */
function getStyleRuleValue(style, selector, sheet = undefined) {
  const sheets = typeof sheet !== "undefined" ? [sheet] : document.styleSheets;
  for (const sheet of sheets) {
    if (!sheet.cssRules) continue;
    for (const rule of sheet.cssRules) {
      if (rule.selectorText?.split(",").includes(selector)) {
        return rule.style[style];
      }
    }
  }
}

/**
 * Gets a stylesheet by name
 * @param {string} sheetName - The name of the stylesheet to get
 * @returns {CSSStyleSheet?} - The stylesheet
 * @example getStylesheet("nav");
 */
function getStylesheet(sheetName) {
  for (const sheet of document.styleSheets) {
    if (sheet.href?.includes(sheetName)) return sheet;
  }
}

/**
 * checks if an element is visible in the viewport
 * @param {HTMLElement | string} id - The id of the element to check
 * @param {boolean} partiallyVisible - Whether the element can be partially visible
 * @returns {boolean} - Whether the element is visible
 * @example elementIsVisibleInViewport("element");
 */
function elementIsVisibleInViewport(id, partiallyVisible = false) {
  const el = typeof id === "string" ? document.getElementById(id) : id;
  if (!el) return false;
  const { top, left, bottom, right } = el.getBoundingClientRect();
  const { innerHeight, innerWidth } = window;
  return partiallyVisible
    ? ((top > 0 && top < innerHeight) ||
        (bottom > 0 && bottom < innerHeight)) &&
        ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
    : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
}

/**
 * finds overflow in document; logs and adds border
 * @returns {void}
 * @example findOverflow();
 */
function findOverflow() {
  let all = document.getElementsByTagName("*"),
    i = 0,
    rect,
    docWidth = document.documentElement.offsetWidth;
  for (; i < all.length; i++) {
    rect = all[i].getBoundingClientRect();
    if (rect.right > docWidth || rect.left < 0) {
      console.log(all[i]);
      all[i].style.borderTop = "1px solid red";
    }
  }
}

/**
 * checks if the selection is in an element
 * @param {HTMLElement | string} element - The element to check
 * @param {Selection} selection - The selection to check
 * @returns {boolean}
 * @example selectionInElement(document.getElementById("element"));
 */
function selectionInElement(element, selection = null) {
  element =
    typeof element === "string" ? document.getElementById(element) : element;
  selection = selection || window.getSelection();
  // console.log(selection);
  if (!selection || !element) return false;
  if (
    ["None", "Caret"].includes(selection.type) ||
    !selection.rangeCount ||
    selection.isCollapsed
  ) {
    return false;
  }
  if (selection.containsNode(element, true)) return true;
  for (const child of element.children) {
    if (
      selection.containsNode(child, true) ||
      selectionInElement(child, selection)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * checks if a child is a parent of an element
 * @param {HTMLElement | string} element - The element to check
 * @param {HTMLElement | string} parent - The parent to check
 * @returns {boolean}
 * @example checkParent(document.getElementById("element"), document.body);
 */

function checkParent(element, parent) {
  element =
    typeof element === "string" ? document.getElementById(element) : element;
  parent =
    typeof parent === "string" ? document.getElementById(parent) : parent;
  while (element) {
    if (element === parent) return true;
    element = element.parentElement;
  }
  return false;
}

/** Title case a string
 * @param {string} str - string to title case
 * @param {string} split - character to split string on
 * @returns {string} - title cased string
 */
function toTitleCase(str, split = "_") {
  return str
    .toLowerCase()
    .split(split)
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * adds a source to the head
 * @param {string} src - The source of the file to add to the head
 * @returns {HTMLElement} - The element added to the head
 */
function addSrcToHead(src) {
  const head = document.head;
  let htmlEl;
  if (src.endsWith(".css")) {
    htmlEl = document.createElement("link");
    htmlEl.rel = "stylesheet";
    htmlEl.type = "text/css";
    htmlEl.href = src;
  } else if (src.endsWith(".js")) {
    htmlEl = document.createElement("script");
    htmlEl.src = src;
    htmlEl.type = "text/javascript";
    htmlEl.async = true;
    htmlEl.defer = true;
  } else if (src.endsWith(".ico")) {
    htmlEl = document.createElement("link");
    htmlEl.rel = "icon";
    htmlEl.href = src;
  }
  head.appendChild(htmlEl);
  return htmlEl;
}

/**
 * checks if a src is in the head
 * @param {string} src - The source of the file to check for in the head
 * @returns {boolean} - Whether the src is in the head
 */
function checkSrcInHead(src) {
  const head = document.head;
  for (const child of head.children) {
    if (child.src === src) return true;
  }
  return false;
}

/**
 * adds a copy event to an element
 * @param {string | HTMLElement} el - The element to add the copy event to
 * @returns {void}
 */

function addCopyEvent(el) {
  /**
   * Adds a copy event to an element - internal use only
   * @param {HTMLElement} _el - The element to add the copy event to
   * @param {string} _text - The text to copy
   * @returns {void}
   */

  el = typeof el === "string" ? document.getElementById(el) : el;
  el.style.cursor = "pointer";
  el.addEventListener("click", function () {
    const src = this.getAttribute("data-copy");
    if (src !== "_src") return _addCopyEvent(this, src);
    fetchCache(this.getAttribute("data-copy-src")).then((response) => {
      response.text().then((code) => {
        _addCopyEvent(this, code);
      });
    });
  });

  function _addCopyEvent(_el, _text) {
    const originalText = _el.textContent;
    _el.style.fontFamily = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--font-family");
    navigator.clipboard.writeText(_text);
    _el.textContent = "copied!";
    setTimeout(() => {
      _el.textContent = originalText;
      _el.style.fontFamily = "";
    }, 1000);
  }
}

/**
 * @typedef {{index: number[], columns: string[], data: any[]}} SCHMData
 * data must be formatted as `SCHMData`
 * @param {string} div div of plot
 * @param {string[] | string} srcs src of the json file, eg. `["/src/json/supply_chain_costs.json", ...]`
 * @param {Plotly.Data[]} plotlyArgs additional plotly arguments
 * @param {Plotly.Layout} plotlyLayout additional plotly layout
 * @param {Plotly.Config} plotlyConfig additional plotly config
 */
async function plotTimeSeries(
  div,
  srcs,
  plotlyArgs = [],
  plotlyLayout = {},
  plotlyConfig = {}
) {
  srcs = Array.isArray(srcs) ? srcs : [srcs];
  plotlyArgs = Array.isArray(plotlyArgs)
    ? plotlyArgs
    : Array.from({ length: 10 }, (_, i) => plotlyArgs);
  /**@type {SCHMData[]} */
  const data = [];
  for (const src of srcs) {
    data.push(await fetchCache(src, {}, { storage: localStorage }));
  }

  const font = getStyleRuleValue("font-family", "body", getStylesheet("index"));

  return await Plotly.newPlot(
    div,
    data.map((d, i) => ({
      x: d.data.map((d) => d[0]),
      y: d.data.map((d) => d[1]),
      type: "scatter",
      xaxis: d.columns[0],
      yaxis: `y${i + 1}`,
      hoverlabel: {
        borderRadius: 10,
        font: { family: font, size: 15 },
      },
      outsidetextfont: { color: "transparent" },
      ...plotlyArgs[i],
    })),
    {
      autosize: true,
      font: {
        family: font,
        size: 15,
      },
      ...plotlyLayout,
    },
    { responsive: true, ...plotlyConfig }
  );
}

/**
 * cache fetch requests in local or session storage
 *
 * auto assumes json but will default to text if failed
 *
 * @template {"text" | "json"} T
 *
 * @param {string} url
 * @param {RequestInit} fetchParams
 * @param {{storage: Storage?, out: T}} options
 * @returns {Promise<T extends "json" ? any : string>}
 */
async function fetchCache(url, fetchParams, options = {}) {
  const { storage = sessionStorage, out = "json" } = options;
  const cacheData = storage?.getItem(url);
  if (cacheData && storage) {
    if (out === "text") return cacheData;
    return JSON.parse(cacheData);
  }
  const resp = await fetch(url, fetchParams);
  if (!resp.ok) throw new Error(`${resp.status}: ${await resp.text()}`);
  if (!storage) {
    return out === "json" ? await resp.json() : await resp.text();
  }
  if (out === "json") {
    const data = await resp.json();
    storage.setItem(url, JSON.stringify(data));
    return data;
  }
  const data = await resp.text();
  storage.setItem(url, data);
  return data;
}

/**
 * adds a css file to the header given that it doesn't exist
 * @param {string} src
 * @param {boolean} [force=true] force the change if it exists, default `true`
 * @returns {HTMLLinkElement} link el created
 */
function addCssFile(src, force = true) {
  const matching = [...document.head.children].filter(
    (e) => e.tagName === "LINK" && e?.href?.includes(src)
  );
  if (matching.length && !force) return matching[0];
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = src;
  link.media = "all";
  document.head.appendChild(link);
  return link;
}

/**
 * removes link from css head
 * @param {string} src
 * @returns {HTMLElement[]} any matching src's
 */
function removeFileFromHead(src) {
  const matching = [...document.head.children].filter(
    (e) => e.tagName === "LINK" && e?.href?.includes(src)
  );
  for (const el of matching) document.head.removeChild(el);
  return matching;
}

/**
 * class for theme management
 * @template {"dark" | "light"} T
 */
class Theme {
  /**
   * where the theme key is stored
   */
  static THEME_STORAGE_KEY = "_theme";

  /**
   * gets the system theme through window.watchMedia
   * @returns {"dark" | "light"}
   */
  static get systemTheme() {
    for (const scheme of ["dark", "light"]) {
      if (window.matchMedia(`(prefers-color-scheme: ${scheme})`).matches) {
        return scheme;
      }
    }
    // if (window.matchMedia(`(prefers-color-scheme: dark)`).matches) {
    //   return "dark";
    // }
    return "light";
  }
  /**
   * gets the active theme from either the html element or system theme
   * @returns {"dark" | "light"}
   */
  static get activeTheme() {
    return document.documentElement.dataset.mode || this.systemTheme;
  }

  /**
   * returns unicode icon from sys active theme
   */
  static get unicodeIcon() {
    return this.activeTheme === "dark" ? "\uf186" : "\uf185";
  }

  /**
   * returns unicode icon from sys active theme
   */
  get unicodeIcon() {
    return this.theme === "dark" ? "\uf186" : "\uf185";
  }

  /**
   * factory; creates new `Theme` from existing settings
   * @param {Storage?} [storagePriorty=null] pointer to first storage to use default sessionStorage before local.
   */
  static fromExisting(storagePriorty = null) {
    return new this(this.#fromExisting(storagePriorty));
  }

  /**
   * @param {Storage?} [storagePriorty=null] pointer to first storage to use default sessionStorage before local.
   * @returns {"dark" | "light"}
   */
  static #fromExisting = (storagePriorty = null) => {
    const pStore = storagePriorty || sessionStorage || localStorage;
    const secStore = pStore === sessionStorage ? localStorage : sessionStorage;
    return (
      document.documentElement.dataset.mode ||
      pStore.getItem(this.THEME_STORAGE_KEY) ||
      secStore.getItem(this.THEME_STORAGE_KEY) ||
      this.systemTheme ||
      "light"
    );
  };

  /**
   * manually create a new theme object.
   * @param {T?} theme "dark" or "light"; will throw error if not
   */
  constructor(theme) {
    theme = theme || Theme.#fromExisting();
    if (!["light", "dark"].includes(theme)) throw new Error("only light||dark");
    this.theme = theme;
  }

  /**
   * opposite theme object without setting
   * @typedef {T extends "dark" ? Theme<"light"> : Theme<"dark">} OppTheme
   * @returns {OppTheme}
   */
  get opposite() {
    return new Theme(this.theme === "dark" ? "light" : "dark");
  }

  /**
   * sets <html data-mode="this.theme"> and saves it to session storage
   * @param {Storage?} storage storage to save to, default doesn't save
   * @param {((theme: this) => void)?} onSave callback that executes after save.
   * @returns {this}
   */
  set(storage = null, onSave = null) {
    document.documentElement.setAttribute("data-mode", this.theme);
    if (storage) storage.setItem(Theme.THEME_STORAGE_KEY, this.theme);
    if (onSave) onSave(this);
    return this;
  }
  /**
   * reverses the theme (if dark -> light)
   * this is the same as new `Theme().opposite.set()`
   * @param {Storage?} storage storage to save to, default doesn't save
   * @param {((theme: OppTheme) => void)?} onSave executed callback function when changing; `theme` is the NEW theme
   * @returns {OppTheme}
   * @example
   * const theme = Theme.fromExisting().reverse()
   */
  reverse(storage = null, onSave = null) {
    return this.opposite.set(storage, onSave);
  }
}

preLoad();
