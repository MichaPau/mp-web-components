import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';

import "../ui/mp-multi-select.js";
import { MultiSelect } from '../ui/mp-multi-select.js';

@customElement('default-style-viewer')
export class DefaultStyleViewer extends LitElement {
  static styles = css`
      :host {
          box-sizing: border-box;
          display: block;
          width: 100%;
          height: 100%;
          padding: 0.5rem;
      }
      #main-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          height: 100%;
      }
      #viewer {
          border: 1px solid black;
          width: 100%;
          height: 100%;
      }`;

  @query("#viewer")
  viewer_elem: HTMLTextAreaElement;

  @query("#element_name_input")
  name_input: HTMLInputElement;

  @query("#value_select")
  value_filter: MultiSelect;

  @property({type: String, attribute: 'local-name'})
  localName = '';

  @state()
  prop_filter = ["", "none", "normal", "auto"];

  styleMap: Map<string, string>;

  protected firstUpdated(_changedProperties: PropertyValues): void {

    if ( this.localName !== "") {
      this.name_input.value = this.localName;
      this.get_styles();
    }


  }

  get_styles() {
    this.styleMap = new Map();
    const elem = document.createElement(this.localName);
    document.body.appendChild(elem);

    try {
      if (elem instanceof HTMLUnknownElement ) {
        throw new Error(`Unknown local element name: ${this.localName}`);
      }
      const styles = window.getComputedStyle(elem);

      for (let i = 0; i < styles.length; i++) {
        const k = styles[i];
        const v = styles.getPropertyValue(k);
        this.styleMap.set(k, v);

      }
      const iter = this.styleMap.entries().filter(([key, value]) => !this.prop_filter.includes(value));
      this.populate_unique_values(this.styleMap.values());
      this.print_result(iter);
    } catch(e) {
      this.viewer_elem.value = `Error with element_name: ${this.localName} \n ${e}`;
    } finally {
      document.body.removeChild(elem);
    }


  }
  populate_unique_values(values: Iterable<string>) {
    const set = new Set(values);
    const s = Array.from(set.entries()).map((entry) => { return { "label": entry[0], "value": entry[0] } });
    console.log(s);
    this.value_filter.optionsData = s;

  }
  print_result(iter:  IteratorObject<[string, string]>) {
    //const result = new Map(iter);
    const result = Array.from(iter);
    const str = result.join("\n");
    this.viewer_elem.value = str;

  }
  update_with_name(ev:Event) {
    this.localName = this.name_input.value;
    this.get_styles();
  }
  render() {
      return html`
        <div id="main-container">
            <div id="action-container">
                <label for="element_name__input">Element name:</label>
                <input id="element_name_input" type="text"/>
                <button @click=${this.update_with_name}>Update</button>
                <mp-multi-select id="value_select"></mp-multi-select>
            </div>
            <textarea id="viewer" placeholder="no element provided"></textarea>
        </div>

    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'default-style-viewer': DefaultStyleViewer;
  }
}
