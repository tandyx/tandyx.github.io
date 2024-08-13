class ProjectCard extends HTMLElement {
  static componentName = "x-project-card";

  constructor() {
    super();
  }
  connectedCallback() {}
}

document.addEventListener("DOMContentLoaded", () => {
  customElements.define(ProjectCard.componentName, ProjectCard);
});
