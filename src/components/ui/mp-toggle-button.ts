import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';

/**
 * @summary ToggleButton a button with a toggle state (on/off)
 *
 * @property on - bool
 * @csspart button -- the button
 **/
@customElement('mp-toggle-button')
export class ToggleButton extends LitElement {
  static styles = css`
      :host {
          display: inline-block;
          box-sizing: border-box;
      }
      button {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .on {
          opacity: 1;
      }
      .off {
          opacity: 0.5;
      }

      `;

  @query("button")
  the_button: HTMLButtonElement;

  @property({type: Boolean, reflect: true})
  on = false;

  /** toggle handler */
  toggle(ev:Event) {
    this.on = !this.on;

    this.dispatchEvent(
      new CustomEvent('mp-toggle-event', { bubbles: true, composed: true, detail: this.on })
    );

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
      return html`<button part="button" @click=${this.toggle} class="off"><slot></slot></button>`;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'mp-toggle-button': ToggleButton;
  }
  interface GlobalEventHandlersEventMap {
    'mp-toggle-event': CustomEvent<boolean>;
  }
}
