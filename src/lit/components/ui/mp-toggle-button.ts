import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';

/**
 * @summary ToggleButton a button with as a toggle
 *
 * @property toggled - bool
 * @csspart button -- the button
 **/
@customElement('mp-toggle-button')
export class ToggleButton extends LitElement {
  static styles = css`
      :host {
          display: inline-block;
          --__mp-border-on: var(--mp-border-on, 2px inset ButtonBorder);
          --__mp-border-off: var(--mp-border-off, 2px outset ButtonBorder);
      }
      button {
          border-radius: 4px;
          height: 100%;
          /* border-color: #151513; */
      }

      .on {
          border: var(--__mp-border-on);
          /* border-style: inset; */
      }
      .off {
          border: var(--__mp-border-off);
          /* border-style: outset; */
      }

      `;

  @query("button")
  the_button: HTMLButtonElement;

  @property({type: Boolean, reflect: true})
  on = false;

  /** toggle function. */
  toggle(ev:Event) {
    this.on = !this.on;

  }

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('on') && this.the_button) {
      this.toggle_styles();
    }
  }

  private toggle_styles() {
    if (this.on) {
      this.the_button.classList.remove("off");
      this.the_button.classList.add("on");

    } else {
      this.the_button.classList.remove("on");
      this.the_button.classList.add("off");
    }
  }
  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.toggle_styles();
  }
  render() {
      return html`
        <button part="button" @click=${this.toggle} class="off"><slot/></button>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'mp-toggle-button': ToggleButton;
  }
}
