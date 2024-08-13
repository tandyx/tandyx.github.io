class Navbar extends HTMLElement {
  static componentName = "x-nav";

  constructor() {
    super();
  }
  connectedCallback() {
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
