import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

// Registers the element
@customElement('mp-tree-view')
export class TreeView extends LitElement {
  // Styles are applied to the shadow root and scoped to this element
  static styles = css`
    h2 button {
      all: inherit;
    }

    h2 button:focus svg {
      outline: 2px solid;
    }
    [aria-expanded="true"] .vert {
      display: none;
    }
    [aria-expanded] rect {
      fill: currentColor;
    }
  `;

  // Creates a reactive property that triggers rendering
  @property()
  mood = 'great.';

  _toggleButtonHandler(ev:Event) {
    const btn = ev.target as HTMLElement;
    let expanded = btn.getAttribute('aria-expanded') === 'true' || false;
    btn.setAttribute('aria-expanded', String(!expanded));

    const target:HTMLElement = btn.parentElement?.nextElementSibling as HTMLElement;
    target.hidden = expanded;
  }
  // Render the component's DOM by returning a Lit template
  render() {
    return html`
        <h1>TreeView Component</h1>
        <h2>
          <button aria-expanded="false" @click=${this._toggleButtonHandler}>
          
            My Category
            <svg viewBox="0 0 10 10" aria-hidden="true" focusable="false">
            <rect class="vert" height="8" width="2" y="1" x="4" />
            <rect height="2" width="8" y="4" x="1" />
          </svg>
          </button>
        </h2>
        <div hidden>
          <p>Sub-Category</p>
        </div>
        
    `;
  }
}