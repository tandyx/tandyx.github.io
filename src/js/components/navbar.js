/**
 * @typedef {import("../index")}
 */
class Navbar extends HTMLElement {
  static componentName = "x-nav";

  constructor() {
    super();
  }
  /**
   * Invoked when the custom element is first connected to the document's DOM.
   */
  connectedCallback() {
    this.id = "_navbar";
    this.innerHTML = /* HTML */ `
      <link rel="stylesheet" href="/src/css/navbar.css" />
      <nav class="nav">
        <div class="titleLogo"><a href="../index.html">johan cho</a></div>
        <input id="menu-toggle" type="checkbox" title="menutoggle" />
        <label class="menu-button-container" for="menu-toggle">
          <div class="menu-button"></div>
        </label>
        <div id="modeToggle" class="fa"><a>&#xF186;</a></div>
        <ul class="menu" id="navmenu">
          <li><a href="/about.html">about</a></li>
          <li><a href="/projects/index.html">projects</a></li>
          <li><a href="/etc/index.html">etc</a></li>
        </ul>
      </nav>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  customElements.define(Navbar.componentName, Navbar);
});

document.addEventListener("click", (event) => {
  if (event.target?.closest(".nav")) return;
  const menuToggle = document.getElementById("menu-toggle");
  if (menuToggle && menuToggle.checked) menuToggle.checked = false;
});

window.addEventListener("load", () => {
  const _menu = document
    .getElementById("_navbar")
    .getElementsByClassName("menu")[0];

  const modeToggle = document.getElementById("modeToggle");
  const modeToggleAnchor = modeToggle.getElementsByTagName("a")[0];
  modeToggleAnchor.text = Theme.unicodeIcon;
  modeToggle.addEventListener("click", () => {
    modeToggleAnchor.text = Theme.fromExisting().reverse(
      localStorage,
      (theme) => {
        if (typeof themeCssMap === "undefined") return;
        removeFileFromHead(themeCssMap[theme.opposite.theme]);
        addCssFile(themeCssMap[theme.theme]);
      },
    ).unicodeIcon;
  });

  for (const child of _menu.children) {
    for (const anchor of child.getElementsByTagName("a")) {
      if (anchor.href === window.location.href) anchor.href = "#";
      if (
        window.location.pathname.startsWith(
          anchor.pathname.split(".")[0].replace("index", "") || "/",
        )
      ) {
        anchor.style.color = "var(--accent-color)";
      }
    }
  }
  const menutoggle = document.getElementById("menu-toggle");

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && menutoggle.checked) {
      menutoggle.click();
    }
  });
});
