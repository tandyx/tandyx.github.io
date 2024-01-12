window.addEventListener("load", function () {
  const username = "tandy-c";

  document.querySelectorAll("[data-repo]").forEach((el) => {
    createBar(el.id, username, el.dataset.repo);
  });

  for (const projectId of [
    "mbta_mapper",
    "teams_bot",
    "linprog",
    "tandypack",
    "pwsh",
  ]) {
    addProjectEvents(projectId);
  }
});

/**
 * Creates a bar chart of the languages used in a repo
 * @param {string} containerId - The id of the element to put the bar chart in
 * @param {string} username - The username of the repo owner
 * @param {string} reponame - The name of the repo
 * @returns {void}
 */
function createBar(containerId, username, reponame) {
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
      bar.classList.add(lang, "bar");
      bar.style.width = `${languages[lang]}%`;
      bar.style.left = `${totalWidth - languages[lang]}%`;
      // bar.style.backgroundColor = colorJson[lang] || "#474747";
      bar.style.zIndex = zIndex;
      bar.dataset.tooltip = `${lang.toLowerCase()} ${languages[lang].toFixed(
        2
      )}%`;
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
 * adds event listeners to the project cards
 * @param {string} id - The id of the element to get the style of
 * @returns {string} - The style of the element
 */
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
    for (const e of projectWrapper.getElementsByClassName("norepo")) {
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
