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

  document.addEventListener("click", function (event) {
    // Check if the clicked element is not inside the navbar
    if (!event.target.closest(".nav")) {
      // Close the hamburger menu
      let menuToggle = document.getElementById("menu-toggle");
      if (menuToggle.checked) {
        menuToggle.checked = false;
      }
    }
  });
});
/**
 * Gets a c style property from an element
 * @param {string} id - The element to get the style from
 * @param {string} styleProp - The style property to get
 */
function getStyle(id, styleProp) {
  let x = document.getElementById(id);
  let y;
  if (x.style[styleProp]) return x.style[styleProp];

  if (window.getComputedStyle) {
    y = document.defaultView
      .getComputedStyle(x, null)
      .getPropertyValue(styleProp);
  } else if (x.currentStyle) {
    y = x.currentStyle[styleProp];
  }
  return y;
}

/**
 * Removes the .html from the end of the href of all anchor tags
 * @param  {...string} hostnames - The hostnames to exclude
 * @returns {void}
 */
function removeHTMLFrom(...hostnames) {
  for (let anchor of document.querySelectorAll("a[href]")) {
    if (hostnames.includes(anchor.href.host)) continue;
    if (anchor.href === "index.html") {
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
 */

function getStylesheet(sheetName) {
  for (const sheet of document.styleSheets) {
    if (sheet.href?.includes(sheetName)) {
      return sheet;
    }
  }
  return null;
}
