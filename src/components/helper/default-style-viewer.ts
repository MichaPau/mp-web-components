import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';

import "../ui/mp-multi-select.js";
import MultiSelect from '../ui/mp-multi-select.js';

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
      #action-container {
          display: flex;
          align-items: flex-start;
          gap: 0.25rem;
          height: 1.5rem;
          max-height: 3rem;

      }
      #viewer {
          border: 1px solid black;
          width: 100%;
          height: 100%;
      }
      #value_select {
          position: relative;
          margin-top: -3px;
          /* z-index: 99; */
          width: 200px;
      }
      `;

  @query("#viewer")
  viewer_elem: HTMLTextAreaElement;

  @query("#element_name_input")
  name_input: HTMLInputElement;

  @query("#value_select")
  value_filter: MultiSelect;

  @query("#key_search_input")
  search_key_input: HTMLInputElement;

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

    //const elem = this.shadowRoot.querySelector("mp-multi-select") as HTMLElement;


  }

  get_styles() {
    this.styleMap = new Map();
    const elem = document.createElement(this.localName);
    // elem.innerHTML = "abc";
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
      //document.body.removeChild(elem);
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
  search_key_change(ev:Event) {
    const searchString = this.search_key_input.value;
    console.log("search for:", searchString);
    const iter = this.styleMap.entries().filter(([key, value]) => {
      return key.toLowerCase().includes(searchString.toLowerCase());
    });
    this.print_result(iter);

  }
  render() {
      return html`
        <div id="main-container">
            <div id="action-container">
                <label for="element_name__input">Element name:</label>
                <input id="element_name_input" type="text"/>
                <button @click=${this.update_with_name}>Update</button>
                <label for="key_search_input">Search key like:</label>
                <input type="text" id="key_search_input" @input=${this.search_key_change}/>
                <mp-multi-select id="value_select" searchEnabled size="7"></mp-multi-select>
                <select>
                    <option>one two three</option>
                    <option>un deux trois</option>
                </select>
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
