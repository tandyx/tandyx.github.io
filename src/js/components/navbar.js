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

document.addEventListener("click", (event) => {
  // Check if the clicked element is not inside the navbar
  if (!event.target?.closest(".nav")) {
    // Close the hamburger menu
    const menuToggle = document.getElementById("menu-toggle");
    if (menuToggle && menuToggle.checked) {
      menuToggle.checked = false;
    }
  }
});

window.addEventListener("load", () => {
  const _custNav = document.getElementById("_navbar");
  const _menu = _custNav.getElementsByClassName("menu")[0];
  for (const child of _menu.children) {
    if (child.id === "modeToggle") {
      const anchor = child.getElementsByTagName("a")[0];
      anchor.text = Theme.unicodeIcon;
      child.addEventListener("click", () => {
        anchor.text = Theme.fromExisting().reverse().unicodeIcon;
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

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && menutoggle.checked) {
      menutoggle.click();
    }
  });
});
