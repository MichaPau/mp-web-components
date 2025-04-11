import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeCSS } from 'lit';
import { adoptStyles } from 'lit';

@customElement('mp-markdown-editor')
export class MarkdownEditor extends LitElement {
  static styles = css`
      :host {
          box-sizing: border-box;
          display: inline-block;
          width: 100%;


      }

      h2 {
          color: green;
      }
      .editor-container {
          border: 1px solid black;
      }

      #md-editor {
          width: 100%;
      }

      `;
  @property({type: String, reflect: true})
  value = "";

  @state()
  edit_mode = false;

  constructor() {
    super();
  }
  connectedCallback(): void {
    super.connectedCallback();
    const template_tag = this.querySelector('template');
    if (template_tag) {
      const styles = template_tag.content.querySelector('style');
      if (styles) {
        adoptStyles(this.shadowRoot, [...this.shadowRoot.adoptedStyleSheets, unsafeCSS(styles.innerHTML)]);
      }

      const links = Array.from(template_tag.content.querySelectorAll('link')) ?? [];
      this.loadStyle(links);


    }

  }

  async loadStyle(links) {

    fetch(links[0].href).then((r) => {
      r.text().then((t) => {
        console.log(t);
       adoptStyles(this.shadowRoot, [...this.shadowRoot.adoptedStyleSheets, unsafeCSS(t)]);
      });
    })
  }
  render() {
      return html`
          <h1>test h1</h1>
          <h2>test h2</h2>
          <h3>test h3</h3>

          <div class="editor-container">
              <textarea id="md-editor"></textarea>
              <textarea id="md-render"></textarea>
          </div>

    `;
  }
}
