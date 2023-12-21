window.addEventListener("load", function () {
  const username = "tandy-c";
  if (document.querySelectorAll("[data-repo]").length > 0) {
    readJSON("../src/config/lang_colors.json").then((colorJson) => {
      document.querySelectorAll("[data-repo]").forEach((el) => {
        createBar(el.id, username, el.dataset.repo, colorJson);
      });
    });
  }

  for (const projectId of ["mbta_mapper", "teams_bot", "linprog"]) {
    addProjectEvents(projectId);
  }
});

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
      bar.dataset.tooltip = `${lang.toLowerCase()} ${languages[lang].toFixed(
        2
      )}%`;

      // const tooltip = bar.appendChild(document.createElement("span"));
      // tooltip.textContent = `${lang} ${languages[lang].toFixed(2)}%`;
      // tooltip.className = "tooltip";
      // tooltip.style.width = totalWidth;
      // tooltip.style.zIndex = zIndex + 1;
      // const tooltipText = tooltip.appendChild(document.createElement("span"));
      // tooltipText.textContent = `${lang.toLowerCase()} ${languages[
      //   lang
      // ].toFixed(2)}%`;
      // tooltipText.className = "tooltiptext";

      //bar.style.backgroundColor = "red";
      container.appendChild(bar);
    });
  });
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
  console.log(file);
  const ls = await fetch(file);
  const colorJson = await ls.json();
  return colorJson;
}

function addProjectEvents(id) {
  const projectWrapper = document.getElementById(id);
  if (!projectWrapper) return;

  projectWrapper.addEventListener("click", function (event) {
    // Check if the clicked element is not inside the navbar
    for (const e of projectWrapper.getElementsByClassName(
      "project-card-content"
    )) {
      if (getStyle(e.id, "display") === "none") {
        e.style.display = "block";
        console.log(e);
        console.log("block");
      } else {
        e.style.display = "none";
        console.log(e);
        console.log("none");
      }
    }
  });
}
