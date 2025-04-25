import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';

@customElement('mp-toggle-button')
export class ToggleButton extends LitElement {
  static styles = css`
      :host {
          display: inline-block;
      }
      button {
          border-radius: 4px;
      }
      `;

  @query("button")
  the_button: HTMLButtonElement;

  @property({type: Boolean, reflect: true})
  toggled = false;

  toggle(ev:Event) {
    this.toggled = !this.toggled;

    // if (this.toggled) this.the_button.style.borderStyle = 'inset';
    // else this.the_button.style.borderStyle = 'outset';

  }

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('toggled') && this.the_button) {
      if (this.toggled) this.the_button.style.borderStyle = 'inset';
      else this.the_button.style.borderStyle = 'outset';
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    if (this.toggled) this.the_button.style.borderStyle = 'inset';
    else this.the_button.style.borderStyle = 'outset';
  }
  render() {
      return html`
        <button part="button" @click=${this.toggle}><slot/></button>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'mp-toggle-button': ToggleButton;
  }
}
