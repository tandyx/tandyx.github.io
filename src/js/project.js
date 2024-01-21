window.addEventListener("load", function () {
  const username = "johan-cho";
  document.querySelectorAll("[data-repo]").forEach((el) => {
    createBar(el.id, username, el.dataset.repo);
  });

  for (const proj of document.getElementsByClassName(
    "project-card-container"
  )) {
    addProjectEvents(proj);
  }
  if (window.location.hash) {
    document.getElementById(window.location.hash.slice(1)).click();
  }
});

window.onhashchange = function () {
  document.getElementById(window.location.hash.slice(1)).click();
};

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
 * adds event listeners to the project cards
 * @param {HTMLElement} projectWrapper - The element to add the event listeners to
 * @returns {void}
 */
function addProjectEvents(projectWrapper) {
  if (!projectWrapper) return;
  projectWrapper.addEventListener("click", function (event) {
    // Check if the clicked element is not inside the navbar
    for (const e of projectWrapper.getElementsByClassName(
      "project-card-content"
    )) {
      if (getStyle(e.id, "display") === "none") {
        e.style.display = "block";
      } else {
        e.style.display = "none";
      }
    }
    for (const bar of projectWrapper.getElementsByClassName("norepo")) {
      if (getStyle(bar.id, "visibility") === "hidden") {
        bar.style.visibility = "visible";
      } else {
        bar.style.visibility = "hidden";
      }
    }
  });
}
