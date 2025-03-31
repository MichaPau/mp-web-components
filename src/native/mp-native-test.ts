// Create a class for the element
class MpTestElement extends HTMLElement {
  static get observedAttributes() {
      return ["color", "size"];
    }

  constructor() {
    // Always call super first in constructor
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const div = document.createElement("div");
    const style = document.createElement("style");
    shadow.appendChild(style);
    shadow.appendChild(div);
  }

  updateStyle() {
    const shadow = this.shadowRoot;
    shadow.querySelector("style").textContent = `
      div {
        width: ${this.getAttribute("size")}px;
        height: ${this.getAttribute("size")}px;
        background-color: ${this.getAttribute("color")};
      }
    `;
  }


  connectedCallback() {
    console.log("Custom element added to page.");
    this.updateStyle();
  }

  disconnectedCallback() {
    console.log("Custom element removed from page.");
  }

  adoptedCallback() {
    console.log("Custom element moved to new page.");
  }

  attributeChangedCallback(name: string, oldValue, newValue) {
    console.log(`Attribute ${name} has changed.`);
    this.updateStyle();
  }
}

customElements.define("mp-test-element", MpTestElement);
