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
    this.innerHTML = `
    <link rel="stylesheet" href="/src/css/navbar.css" />
    <nav class="nav">
    <div class="titleLogo"><a href="../index.html">johan cho</a></div>
    <input id="menu-toggle" type="checkbox" title="menutoggle" />
    <label class="menu-button-container" for="menu-toggle">
        <div class="menu-button"></div>
    </label>
    <ul class="menu" id="navmenu">
        <li id="modeToggle" class="fa"><a>&#xF186;</a></li>
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

window.addEventListener("load", () => {
  const _custNav = document.getElementById("_navbar");
  const _menu = _custNav.getElementsByClassName("menu")[0];
  for (const child of _menu.children) {
    if (child.id === "modeToggle") {
      for (const an of child.getElementsByTagName("a")) {
        an.text =
          (getCookie("mode") || "dark") === "dark" ? "\uf186" : "\uf185";
      }
      child.addEventListener("click", function () {
        for (const an of child.getElementsByTagName("a")) {
          an.text = toggleDarkLight() === "dark" ? "\uf186" : "\uf185";
        }
      });
      continue;
    }

    for (const anchor of child.getElementsByTagName("a")) {
      if (anchor.href === window.location.href) anchor.href = "#";
      if (
        window.location.pathname.startsWith(
          anchor.pathname.split(".")[0].replace("index", "") || "/"
        )
      ) {
        anchor.style.color = "var(--accent-color)";
      }
    }
  }
  const menutoggle = document.getElementById("menu-toggle");
  const styleSheet = getStylesheet("nav");
  if (!menutoggle) return;
  menutoggle.addEventListener("change", () => {
    const menu = document.getElementById("navmenu");
    if (!styleSheet || !menu) return;
    styleSheet.insertRule(
      `nav:has(#menu-toggle:checked)::before { position: absolute; height: calc(${getStyle(
        menu,
        "height"
      )} + ${getStyle(menu.children[0], "height")} - ${getStyle(
        menu.children[menu.children.length - 1],
        "border-bottom-width"
      )}) }`
    );
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && menutoggle.checked) {
      menutoggle.click();
    }
  });
});
