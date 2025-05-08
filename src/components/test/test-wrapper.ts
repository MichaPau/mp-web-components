import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import "../ui/mp-markdown-editor.js";

const exampleMD = `
  ---
  __Advertisement :)__

  - __[pica](https://nodeca.github.io/pica/demo/)__ - high quality and fast image
    resize in browser.
  - __[babelfish](https://github.com/nodeca/babelfish/)__ - developer friendly
    i18n with plurals support and easy syntax.

  You will like those projects!

  ---

  # h1 Heading 8-)
  ## h2 Heading
  ### h3 Heading
  #### h4 Heading
  ##### h5 Heading
  ###### h6 Heading


  ## Horizontal Rules

  ___

  ---

  ***

`;

@customElement('test-wrapper')
export class TestWrapper extends LitElement {
  static styles = css`
      :host {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
          padding: 0.5rem;
          border: 1px solid black;


      }
      `;
  @property({type: String})
  someAttribute = 'default attribute';

  render() {
      return html`
        <input type="text"/>
        <mp-markdown-editor tabindex="0" justify-buttons="flex-end" value=${exampleMD}></mp-markdown-editor>
        <input type="text"/>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'test-wrapper': TestWrapper;
  }
}
