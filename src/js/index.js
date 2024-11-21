/**
 * @file index.js
 * @fileoverview main file and loaded on every page. also contains helper functions
 * @exports *
 */

"use strict";

class Theme {
  /**
   * @template {"dark" | "light"} T
   * @param {T} theme "dark" or "light"
   */
  constructor(theme) {
    if (!theme) throw new Error("theme must be set");
    this.theme = theme;
  }

  static inputEnum = { light: 0, dark: 1 };

  /**
   * gets the system theme through window.watchMedia
   * @returns {"dark" | "light" | null}
   */
  static get systemTheme() {
    for (const scheme of [
      ["(prefers-color-scheme: dark)", "dark"],
      ["(prefers-color-scheme: light)", "light"],
    ]) {
      const queryList = window.matchMedia(scheme[0]);
      if (queryList.matches) return scheme[1];
    }
  }
  /**
   * gets the active theme from either the html element or system theme\
   * @returns {"dark" | "light" | null}
   */
  static get activeTheme() {
    return document.documentElement.dataset.mode || Theme.systemTheme;
  }

  /**
   * returns unicode icon from sys active theme
   */
  static get unicodeIcon() {
    return Theme.activeTheme === "dark" ? "\uf186" : "\uf185";
  }

  /**
   * returns unicode icon from sys active theme
   */
  get unicodeIcon() {
    return this.theme === "dark" ? "\uf186" : "\uf185";
  }

  /**
   * factory; creates new Theme from existing settings
   */
  static fromExisting() {
    return new Theme(
      document.documentElement.dataset.mode ||
        sessionStorage.getItem("theme") ||
        Theme.systemTheme ||
        "light"
    );
  }

  /**
   * sets <html data-mode="this.theme"> and saves it to session storage
   * @param {boolean} [save=true] true by default, saves to `sessionStorage`
   * @returns {this}
   */
  set(save = true) {
    document.documentElement.setAttribute("data-mode", this.theme);
    if (save) sessionStorage.setItem("theme", this.theme);
    return this;
  }
  /**
   * reverses the theme (if dark -> light)
   * @param {boolean} [save=true] true by default, saves to `sessionStorage`
   * @returns {Theme}
   */
  reverse(save = true) {
    if (!this.theme) throw new Error("must set theme to reverse it");
    return new Theme(this.theme === "dark" ? "light" : "dark").set(save);
  }
}

main();

window.addEventListener("load", function () {
  const localHosts = ["localhost", "", "127.0.0.1"];
  if (!localHosts.includes(window.location.hostname)) {
    removeHTMLFrom(...localHosts);
  }
  document.querySelectorAll("*[data-copy]").forEach((el) => addCopyEvent(el));
});
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

/**
 * The main function -- executed for every page load, typically before the DOM is loaded
 * @returns {void}
 * @example window.addEventListener("load", main);
 * @example main();
 */
function main() {
  if (!["/index.html", "/"].includes(window.location.pathname)) {
    Theme.fromExisting().set(false);
  } else {
    new Theme("dark").set(false);
  }

  document.addEventListener("scroll", () => {
    const back2top = document.getElementById("back2top");
    if (!back2top) return;
    back2top.style.display = window.scrollY > 100 ? "block" : "none";
  });
}

/**
 * Gets a c style property from an element
 * @param {string | HTMLElement} id - The element to get the style from
 * @param {string} styleProp - The style property to get
 * @returns {string | void} - The value of the style property or undefined if it doesn't exist
 */
function getStyle(id, styleProp) {
  const x = typeof id === "string" ? document.getElementById(id) : id;
  if (!x) return;
  if (x.style[styleProp]) {
    return x.style[styleProp];
  }
  if (window.getComputedStyle) {
    return document.defaultView
      .getComputedStyle(x, null)
      .getPropertyValue(styleProp);
  }
  if (x.currentStyle) {
    return x.currentStyle[styleProp];
  }
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
 * @returns {Promise} - A promise that resolves to an object of languages and their percentages
 */
async function getRepoLangs(username, reponame, key = null) {
  {
    const ls = await fetchCatch(
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
 * @returns {string | null} - The value of the style
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
  return null;
}

/**
 * Gets a stylesheet by name
 * @param {string} sheetName - The name of the stylesheet to get
 * @returns {CSSStyleSheet | null} - The stylesheet
 * @example getStylesheet("nav");
 */
function getStylesheet(sheetName) {
  for (const sheet of document.styleSheets) {
    if (sheet.href?.includes(sheetName)) {
      return sheet;
    }
  }
  return null;
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
 * checks to see if the element is overflowing
 * @param {HTMLElement | string} el - The element to check
 * @returns {boolean} - Whether the element is overflowing
 * @example checkOverflow(document.getElementById("element"));
 */
function checkOverflow(el) {
  if (typeof el === "string") el = document.getElementById(el);
  let curOverflow;
  if (!curOverflow || curOverflow === "visible") el.style.overflow = "hidden";

  let isOverflowing =
    el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

  el.style.overflow = curOverflow;

  return isOverflowing;
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

/**
 * sets a cookie to a value
 * @param {string} name - The name of the cookie
 * @param {string} value - The value of the cookie
 * @param {number | null} exdays - The number of days until the cookie expires or null if it never expires
 * @returns {void}
 * @example setCookie("username", "johan", 10);
 */

function setCookie(name, value, exdays = null) {
  if (!exdays) {
    document.cookie = `${name}=${value};path=/`;
    return;
  }
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};${"expires=" + d.toUTCString()};path=/`;
}

/**
 * fetches a cookie
 * @param {string} name - the name of the cookie to fetch
 * @returns {string} - the value of the cookie
 * @example let user = getCookie("username");
 */
function getCookie(name) {
  name += "=";
  for (let cookie of decodeURIComponent(document.cookie).split(";")) {
    while (cookie.charAt(0) == " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) == 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return "";
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
    fetch(this.getAttribute("data-copy-src")).then((response) => {
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
    const resp = await fetch(src);
    if (!resp.ok) throw new Error(`${await resp.text()}: ${resp.status}`);
    data.push(await resp.json());
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
 * @param {string} url
 * @param {RequestInit} fetchParams
 * @param {("local" | "session")?} [cache = "session"]
 * @returns {Promise<any | Response>}
 */
async function fetchCatch(url, fetchParams, cache = "session") {
  // if (!cache) return await fetch(url, fetchParams);
  const cacheRef = cache === "local" ? localStorage : sessionStorage;
  const cacheData = cacheRef.getItem(url);
  if (cacheData && cache) return JSON.parse(cacheData);
  const resp = await fetch(url, fetchParams);
  if (!resp.ok) throw new Error(`${resp.status}: ${await resp.text()}`);
  try {
    return await resp.json();
  } catch {
    return await resp.text();
  }
}
