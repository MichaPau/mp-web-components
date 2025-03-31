import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('test-comp')
export class TestComp extends LitElement {
  static styles = css`
      :host {
          display: inline-block;


      }
      #container {
          border: 1px solid black;
          background-color: palegoldenrod;


      }`;
  @property({type: String})
  someAttribute = 'default attribute';

  render() {
      return html`
        <h2 id="container">Test-Comp: ${this.someAttribute}</h2>
    `;
  }
}
