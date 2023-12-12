window.addEventListener("load", function () {
  const username = "tandy-c";
  const localHosts = ["localhost", "", "127.0.0.1"];
  if (!localHosts.includes(window.location.hostname)) {
    removeHTMLEnd(...localHosts);
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

  readJSON("../src/config/lang_colors.json").then((colorJson) => {
    document.querySelectorAll("[data-repo]").forEach((el) => {
      createBar(el.id, username, el.dataset.repo, colorJson);
    });
  });
});

/**
 * Removes the .html from the end of the href of all anchor tags
 * @param  {...string} hostnames - The hostnames to exclude
 * @returns {void}
 */
function removeHTMLEnd(...hostnames) {
  for (let anchor of document.querySelectorAll("a[href]")) {
    if (hostnames.includes(anchor.href.host)) continue;
    anchor.href = anchor.href.replace(".html", "");
  }
}

/**
 * Creates a bar chart of the languages used in a repo
 * @param {string} containerId - The id of the element to put the bar chart in
 * @param {string} username - The username of the repo owner
 * @param {string} reponame - The name of the repo
 * @param {object} colorJson - A json object of the colors to use for each language
 * @returns {void}
 */
function createBar(containerId, username, reponame, colorJson) {
  const container = document.getElementById(containerId);
  const langPromise = getRepoLangs(username, reponame);
  langPromise.then((languages) => {
    let zIndex =
      Object.keys(languages).length +
      1 +
      getStyle(
        containerId,
        typeof InstallTrigger !== "undefined" ? "z-index" : "zIndex"
      );
    let totalWidth = 0;
    Object.keys(languages).forEach((lang) => {
      const bar = document.createElement("div");
      zIndex -= 1;
      totalWidth += languages[lang];
      bar.className = "bar";
      bar.style.width = `${languages[lang]}%`;
      bar.style.left = `${totalWidth - languages[lang]}%`;
      bar.style.backgroundColor = colorJson[lang] || "#474747";
      bar.style.zIndex = zIndex;

      const tooltip = bar.appendChild(document.createElement("span"));
      // tooltip.textContent = `${lang} ${languages[lang].toFixed(2)}%`;
      tooltip.className = "tooltip";
      tooltip.style.width = totalWidth;
      tooltip.style.zIndex = zIndex + 1;
      const tooltipText = tooltip.appendChild(document.createElement("span"));
      tooltipText.textContent = `${lang.toLowerCase()} ${languages[
        lang
      ].toFixed(2)}%`;
      tooltipText.className = "tooltiptext";

      //bar.style.backgroundColor = "red";
      container.appendChild(bar);
    });
  });
}
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
 * Gets the languages used in a repo
 * @param {string} username - The username of the repo owner
 * @param {string} reponame - The name of the repo
 * @param {string} key - The github api key
 * @returns {Promise} - A promise that resolves to an object of languages and their percentages
 */
async function getRepoLangs(username, reponame, key = null) {
  {
    const ls = await fetch(
      "https://api.github.com/repos/" +
        username +
        "/" +
        reponame +
        "/languages" +
        (key ? "?access_token=" + key : "")
    );

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
 * Reads a json file
 * @param {string} file - The path to the json file
 * @returns {Promise} - A promise that resolves to the json object
 */
async function readJSON(file) {
  const ls = await fetch(file);
  const colorJson = await ls.json();
  return colorJson;
}
