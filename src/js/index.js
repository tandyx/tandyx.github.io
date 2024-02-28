main();

window.addEventListener("load", function () {
  const localHosts = [
    "localhost",
    "",
    "127.0.0.1",
    "q7vr2gwr-3000.use.devtunnels.ms",
    "l9bzxts8-3000.use.devtunnels.ms",
  ];
  if (!localHosts.includes(window.location.hostname)) {
    removeHTMLFrom(...localHosts);
  }
  if (window.location.pathname !== "/index.html") {
    setNav();
  }
});

/**
 * The main function -- executed for every page load, typically before the DOM is loaded
 * @returns {void}
 * @example window.addEventListener("load", main);
 * @example main();
 */

function main() {
  if (!["/index.html", "/"].includes(window.location.pathname)) {
    toggleDarkLight(false);
  } else {
    toggleDarkLight(false, "dark");
  }

  document.addEventListener("click", function (event) {
    // Check if the clicked element is not inside the navbar
    if (!event.target.closest(".nav")) {
      // Close the hamburger menu
      const menuToggle = document.getElementById("menu-toggle");
      if (menuToggle && menuToggle.checked) {
        menuToggle.checked = false;
      }
    }
  });
  document.addEventListener("scroll", () => {
    const back2top = document.getElementById("back2top");
    if (!back2top) return;
    back2top.style.display = window.scrollY > 100 ? "block" : "none";
  });
}

/**
 * Toggles the dark/light mode
 * @param {boolean} toggle - Whether to toggle the mode
 * @param {string} mode - The mode to set the page to
 * @param {Object} cssVars - The css variables to change, defaults:
 * @returns {string} - The mode the page is in
 * @example toggleDarkLight();
 */
function toggleDarkLight(toggle = true, mode = null, cssVars = null) {
  mode = mode || getCookie("mode") || "dark";
  cssVars = cssVars || {
    "--text-color": "#303030",
    "--subheader-text": "#6e6e6e",
    "--project-card-background": "#f5f5f5",
    "--background-color": "#f8f8f8",
  };
  if (!["dark", "light"].includes(mode)) {
    setCookie("mode", "dark", 365);
    return mode;
  }
  if (toggle) {
    mode = mode === "dark" ? "light" : "dark";
    setCookie("mode", mode, 365);
  }
  for (const [key, value] of Object.entries(cssVars)) {
    if (mode === "light") {
      document.documentElement.style.setProperty(key, value);
    } else {
      document.documentElement.style.removeProperty(key);
    }
  }
  return mode;
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
  for (let anchor of document.querySelectorAll("a[href]")) {
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
    const ls = await (key
      ? fetch(
          `https://api.github.com/repos/${username}/${reponame}/languages`,
          {
            headers: { Authorization: "token " + key },
          }
        )
      : fetch(
          `https://api.github.com/repos/${username}/${reponame}/languages`
        ));

    const languageStats = Object.entries(await ls.json())
      .sort(([, a], [, b]) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    const totalBytes = Object.values(languageStats).reduce(
      (partialSum, a) => partialSum + a,
      0
    );

    const languagesPercentage = {};
    Object.keys(languageStats).forEach((lang) => {
      languagesPercentage[lang] = (languageStats[lang] * 100) / totalBytes;
    });
    return languagesPercentage;
  }
}

/**
 * Gets the style of a selector from a stylesheet
 * @param {string} style - The style to get
 * @param {string} selector - The selector to get the style from
 * @param {CSSStyleSheet} sheet - The stylesheet to get the style from
 * @returns {string} - The value of the style
 * @returns {null} - If the style was not found
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
 * @returns {CSSStyleSheet} - The stylesheet
 * @returns {null} - If the stylesheet was not found
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
 * Sets the nav bar to the current page
 * @returns {void}
 * @example window.addEventListener("load", setNav);
 */
function setNav() {
  for (const navBar of document.getElementsByClassName("nav")) {
    for (const menu of navBar.getElementsByClassName("menu")) {
      for (const child of menu.children) {
        if (child.id === "modeToggle") {
          for (const an of child.getElementsByTagName("a")) {
            an.text =
              (getCookie("mode") || "dark") === "dark" ? "\uf186" : "\uf185";
          }
          child.addEventListener("click", function () {
            let mode = toggleDarkLight();
            for (const an of child.getElementsByTagName("a")) {
              an.text = mode === "dark" ? "\uf186" : "\uf185";
            }
          });

          continue;
        }

        for (const anchor of child.getElementsByTagName("a")) {
          if (anchor.href === window.location.href) {
            anchor.href = "#";
          }
          if (
            window.location.pathname.startsWith(
              anchor.pathname.split(".")[0].replace("index", "") || "/"
            )
          ) {
            anchor.style.color = "var(--accent-color)";
          }
        }
      }
    }
  }

  const menutoggle = document.getElementById("menu-toggle");
  const styleSheet = getStylesheet("nav");
  if (!menutoggle) return;
  menutoggle.addEventListener("change", () => {
    const menu = document.getElementById("navmenu");
    if (!styleSheet || !menu) return;
    styleSheet.insertRule(
      `nav:has(#menu-toggle:checked)::before { position: absolute; height: ${
        Number(getStyle(menu, "height").replace("px", "")) +
        Number(getStyle(menu.children[0], "height").replace("px", "")) -
        Number(
          getStyle(
            menu.children[menu.children.length - 1],
            "border-bottom-width"
          ).replace("px", "")
        )
      }px }`
    );
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && menutoggle.checked) {
      menutoggle.click();
    }
  });
}
/**
 * checks to see if the element is overflowing
 * @param {HTMLElement | string} el - The element to check
 * @returns {boolean} - Whether the element is overflowing
 * @example checkOverflow(document.getElementById("element"));
 */
function checkOverflow(el) {
  if (typeof el === "string") el = document.getElementById(el);

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
