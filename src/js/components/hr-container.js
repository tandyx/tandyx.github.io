class HrContainer extends HTMLElement {
  static componentName = "x-hr-container";
  static observedAttributes = ["href", "date", "title"];
  constructor() {
    super();
  }
  connectedCallback() {
    // <a href="${this.getAttribute("href")}
    //         >${this.getAttribute("title")}
    //       </a>
    this.innerHTML = `
      <div class="hr-container">
        <div class="maingrid">
          ${this.innerHTML}
          <span class="right-float">${this.getAttribute("date")}</span>
        </div>
        <hr />
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  customElements.define(HrContainer.componentName, HrContainer);
});
