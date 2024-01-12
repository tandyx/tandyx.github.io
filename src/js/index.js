window.addEventListener("load", function () {
  const localHosts = [
    "localhost",
    "",
    "127.0.0.1",
    "q7vr2gwr-3000.use.devtunnels.ms",
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
    for (const replace of [".html", ".htm", ".php", ".asp", "index"]) {
      anchor.href = anchor.href.replace(replace, "");
    }
  }
}
