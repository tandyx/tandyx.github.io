/**
 * @file project.js
 * @fileoverview This file contains the code for the project cards
 * @typedef {import("./index.js")}
 * @import { IResult, UAParser} from "ua-parser-js".
 */

"use strict";

window.addEventListener("load", () => {
  for (const proj of document.getElementsByClassName(
    "project-card-container",
  )) {
    addProjectEvents(proj);
  }

  if (window.location.hash) {
    const details = document.getElementById(window.location.hash.slice(1));
    if (details) {
      if (details.tagName !== "DETAILS") {
        details.click();
      } else {
        details.open = true;
      }
    }
  }
});

window.addEventListener("load", async () => {
  const username = "tandyx";
  document
    .querySelectorAll("[data-repo]")
    .forEach(async (el) => createBar(el, username, el.dataset.repo));
});

window.addEventListener("load", () => {
  /**@type {IResult} */
  const userAgent = new UAParser().getResult();
  if (userAgent.engine.name === "WebKit" && "onscrollend" in window) {
    document
      .querySelectorAll("summary.project-card")
      .forEach((el) => (el.querySelector("h1").style.marginTop = "-20px"));
  }
});

window.addEventListener("hashchange", () => {
  document.getElementById(window.location.hash.slice(1)).click();
});

/**
 * Creates a bar chart of the languages used in a repo
 * @param {HTMLElement | string} contId - The id of the element to put the bar chart in
 * @param {string} username - The username of the repo owner
 * @param {string} reponame - The name of the repo
 * @returns {void}
 */
async function createBar(contId, username, reponame) {
  const container =
    typeof contId === "string" ? document.getElementById(contId) : contId;
  const languages = await getRepoLangs(username, reponame);
  let zIndex =
    Object.keys(languages).length +
    1 +
    Number(
      (
        getStyle(
          contId,
          typeof InstallTrigger !== "undefined" ? "z-index" : "zIndex",
        ) || "0"
      )
        .replace("auto", "")
        .replace("px", ""),
    );
  let totalWidth = 0;
  Object.keys(languages).forEach((lang) => {
    const bar = document.createElement("div");
    zIndex--;
    totalWidth += languages[lang];
    bar.classList.add(`${cleanCssGithubLang(lang)}-bg`, "bar");
    bar.style.width = `${languages[lang]}%`;
    bar.style.left = `${totalWidth - languages[lang]}%`;
    // bar.style.backgroundColor = colorJson[lang] || "#474747";
    bar.style.zIndex = zIndex;
    bar.dataset.tooltip = `${lang.toLowerCase()} ${languages[lang].toFixed(
      2,
    )}%`;
    container.appendChild(bar);
  });
}

/**
 * adds event listeners to the project cards
 * @param {HTMLElement | string} projectWrapper - The element to add the event listeners to
 * @returns {void}
 */
function addProjectEvents(projectWrapper) {
  /** @type {HTMLDetailsElement} */
  projectWrapper =
    typeof projectWrapper === "string"
      ? document.getElementById(projectWrapper)
      : projectWrapper;

  if (!projectWrapper || typeof projectWrapper === "string") return;

  for (const bar of projectWrapper.getElementsByClassName("norepo")) {
    bar.style.visibility =
      getStyle(bar, "visibility") === "hidden" ? "visible" : "hidden";
  }

  for (const innerdiv of projectWrapper.getElementsByClassName(
    "project-card-content",
  )) {
    if (innerdiv.tagName === "SUMMARY") continue;
    innerdiv.addEventListener("click", (event) => {
      if (["A"].includes(event.target?.tagName)) return;
      if (checkParent(event.target, innerdiv) && selectionInElement(innerdiv)) {
        return;
      }
      projectWrapper.open = !projectWrapper.open;
    });
  }
}
