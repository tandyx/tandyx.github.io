/**
 * @file about.js
 * @fileoverview This file contains the code for the about page
 * @typedef {import("./index.js")}
 * @typedef {import("plotly.js")}
 */

"use strict";

window.addEventListener("load", () => {
  leftsideSetter();
  document.addEventListener("scroll", leftsideSetter);
});

window.addEventListener("load", async () => {
  const username = "tandyx";
  getUserLanguages(username).then((data) => {
    Object.keys(data).forEach((key) => {
      const newKey = cleanCssGithubLang(key);
      data[newKey] = data[key];
      if (newKey !== key) delete data[key];
    });
    createLangPiechart("langPlot", data);
  });
});

/**
 * sets that the left side of the about page should be hidden if the about header is not visible
 * @returns {void}
 */

function leftsideSetter() {
  if (
    elementIsVisibleInViewport("aboutheader", true) ||
    window.innerWidth < 768
  ) {
    document.getElementById("aboutleft").style.display = "none";
    return;
  }
  document.getElementById("aboutleft").style.display = "block";
}

/**
 * Gets the languages used in a repo
 * @param {string} username - The username of the repo owner
 * @param {string} key - The github api key
 * @returns {Promise<{[key = string]: number}>} - A promise that resolves to an object of languages and their percentages
 */
async function getUserLanguages(username, key = null) {
  const languagesJson = {};
  const repos = await fetchCache(
    `https://api.github.com/users/${username}/repos`,
    key ? { headers: { Authorization: "token " + key } } : {}
  );

  for (const repo of repos) {
    if (repo.fork) continue;
    const repoData = await fetchCache(
      `https://api.github.com/repos/${username}/${repo.name}/languages`,
      key ? { headers: { Authorization: "token " + key } } : {}
    );

    for (const language in repoData) {
      languagesJson[language] |= 0;
      languagesJson[language] +=
        language === "Jupyter Notebook"
          ? repoData[language] * 0.05
          : repoData[language];
    }
  }
  return languagesJson;
}

/**
 * creates a pie chart of the languages used in a repo
 * @param {string} id - The id of the div to put the pie chart in
 * @param {Object} langdata - The object of languages and their percentages
 * @returns {void}
 */
function createLangPiechart(id, langdata) {
  const langstyles = getStylesheet("github-lang-css/background.css");
  const font = getStyleRuleValue("font-family", "body", getStylesheet("index"));
  /**@type {Plotly.Data[]} */
  const data = [
    {
      values: Object.values(langdata),
      labels: Object.keys(langdata).map((lang) => lang.toLowerCase()),
      textinfo: "label",
      marker: {
        colors: Object.keys(langdata).map(
          (lang) =>
            getStyleRuleValue("background-color", `.${lang}-bg`, langstyles) ||
            "#474747"
        ),
      },
      type: "pie",
      hoverlabel: {
        borderRadius: 10,
        font: { family: font, size: 15 },
      },
      hovertemplate: "%{label}: %{percent} <extra></extra>",
      outsidetextfont: { color: "transparent" },
      responsive: true,
    },
  ];
  /**@type {Plotly.Layout} */
  const layout = {
    autosize: true,
    showlegend: false,
    font: {
      family: font,
      size: 15,
      color: "#f2f2f2",
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0,
      pad: -30,
    },
  };

  Plotly.newPlot(id, data, layout, { responsive: true });
}
