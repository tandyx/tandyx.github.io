window.addEventListener("load", function () {
  const username = "tandy-c";
  readJSON("../src/config/lang_colors.json").then((colorJson) => {
    document.querySelectorAll("[data-repo]").forEach((el) => {
      createBar(el.id, username, el.dataset.repo, colorJson);
    });
  });
});

function createBar(containerId, username, reponame, colorJson) {
  /**
   * Creates a bar chart of the languages used in a repo
   * @param {string} containerId - The id of the element to put the bar chart in
   * @param {string} username - The username of the repo owner
   * @param {string} reponame - The name of the repo
   * @param {object} colorJson - A json object of the colors to use for each language
   * @returns {void}
   */
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
      bar.style.backgroundColor = colorJson[lang] || "#3333";
      bar.style.zIndex = zIndex;

      const tooltip = bar.appendChild(document.createElement("span"));
      // tooltip.textContent = `${lang} ${languages[lang].toFixed(2)}%`;
      tooltip.className = "tooltip";
      tooltip.style.width = totalWidth;
      tooltip.style.zIndex = zIndex + 1;
      const tooltipText = tooltip.appendChild(document.createElement("span"));
      tooltipText.textContent = `${lang} ${languages[lang].toFixed(2)}%`;
      tooltipText.className = "tooltiptext";

      //bar.style.backgroundColor = "red";
      container.appendChild(bar);
    });
  });
}
function getStyle(id, styleProp) {
  /**
   * Gets a c style property from an element
   * @param {string} id - The element to get the style from
   * @param {string} styleProp - The style property to get
   */
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

async function getRepoLangs(username, reponame, key = null) {
  /**
   * Gets the languages used in a repo
   * @param {string} username - The username of the repo owner
   * @param {string} reponame - The name of the repo
   * @param {string} key - The github api key
   * @returns {Promise} - A promise that resolves to an object of languages and their percentages
   */
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

async function readJSON(file) {
  /**
   * Reads a json file
   * @param {string} file - The path to the json file
   * @returns {Promise} - A promise that resolves to the json object
   */
  const ls = await fetch(file);
  const colorJson = await ls.json();
  return colorJson;
}
