window.onload = function () {
  const username = "tandy-c";
  // getUserLanguages(username).then((data) => {
  //   createLangPiechart("langPlot", data);
  // });
};
/**
 * Gets the languages used in a repo
 * @param {string} username - The username of the repo owner
 * @param {string} key - The github api key
 * @returns {Promise} - A promise that resolves to an object of languages and their percentages
 */
async function getUserLanguages(username, key = null) {
  const languagesJson = {};
  const response = await (key
    ? fetch(`https://api.github.com/users/${username}/repos`, {
        headers: { Authorization: "token " + key },
      })
    : fetch(`https://api.github.com/users/${username}/repos`));

  for (const repo of await response.json()) {
    const repoResponse = await (key
      ? fetch(
          `https://api.github.com/repos/${username}/${repo.name}/languages`,
          { headers: { Authorization: "token " + key } }
        )
      : fetch(
          `https://api.github.com/repos/${username}/${repo.name}/languages`
        ));

    const languages = await repoResponse.json();
    for (const language in await languages) {
      if (languagesJson[language]) {
        languagesJson[language] += languages[language];
      } else {
        languagesJson[language] = languages[language];
      }
    }
  }
  return languagesJson;
}

function createLangPiechart(id, langdata) {
  const langstyles = getStylesheet("github-colors");
  const font = getStyleRuleValue("font-family", "body", getStylesheet("index"));
  const data = [
    {
      values: Object.values(langdata),
      labels: Object.keys(langdata).map((lang) => lang.toLowerCase()),
      textinfo: "label",
      marker: {
        colors: Object.keys(langdata).map(
          (lang) =>
            getStyleRuleValue("background-color", `.${lang}`, langstyles) ||
            "#474747"
        ),
      },
      type: "pie",
      hoverlabel: {
        borderRadius: 10,
        font: {
          family: font,
          size: 15,
        },
        // bgcolor: "#474747",
      },
      hovertemplate: "%{label}: %{percent} <extra></extra>",

      outsidetextfont: { color: "transparent" },
    },
  ];

  const layout = {
    height: 400,
    width: 500,
    showlegend: false,
    background: false,
    font: {
      family: font,
      size: 15,
      color: "#f2f2f2",
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: {
      l: 20,
      r: 20,
      b: 20,
      t: 20,
      pad: 5,
    },
  };

  Plotly.newPlot(id, data, layout);
}
