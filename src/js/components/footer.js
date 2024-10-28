class Footer extends HTMLElement {
  static componentName = "x-footer";

  constructor() {
    super();
  }
  connectedCallback() {
    this.innerHTML = `
    <footer>
      <div>
        designed by me and hosted in
        <a
          href="https://github.com/tandyx/tandyx.github.io"
          rel="noopener"
          target="_blank"
          >this repo</a
        >.
      </div>
      <div class="fa links-wrapper">
        <a href="mailto:cho.joh@northeastern.edu" target="_blank" rel="noopener"
          >&#xf0e0;</a
        ><a
          href="https://www.linkedin.com/in/chojohan/"
          target="_blank"
          rel="noopener"
          >&#xf08c;</a
        ><a href="https://github.com/tandyx" target="_blank" rel="noopener"
          >&#xf09b;</a
        ><a
          href="https://www.youtube.com/channel/UCP91LPgRFY03YoIGrmuMH9A"
          target="_blank"
          rel="noopener"
          >&#xf16a;</a
        ><a
          href="https://open.spotify.com/user/31rmddg3bkfj4gl56uvbw7225t3y?si=313276f3aff34fc2"
          target="_blank"
          rel="noopener"
          >&#xf1bc; </a
        >
      </div>
    </footer>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  customElements.define(Footer.componentName, Footer);
});
