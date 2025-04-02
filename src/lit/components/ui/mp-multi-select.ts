import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('mp-multi-select')
export class MultiSelect extends LitElement {
  static styles = css`
      :host {
          display: inline-block;
          box-sizing: border-box;
          --multi-select-header-row-height: 1.5rem;
          --multi-select-font-size: var(--multi-select-header-row-height) * 0.8;
          --multi-select-border-color: #aaa;

      }
      #container {
          border: 1px solid var(--multi-select-border-color);
          border-radius: 4px;
      }

      #input-container {
          display: inline-flex;
          justify-content: space-between;
          gap: 0.5rem;
          height: auto;
          min-height: var(--multi-select-header-row-height);
          width: 100%;
      }
      #tag-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;

      }
      #the-select {
          width: 100%;
          font-size: var(--multi-select-font-size);
          border: none;
      }
      #search-input {
          box-sizing: border-box;
          align-self: flex-start;
          height: var(--multi-select-header-row-height);
          font-size: var(--multi-select-font-size);
          margin: 0;
          padding: 0;
      }
      .tag {
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid black;
          padding: calc(var(--multi-select-header-row-height) * 0.1);
          cursor: pointer;
          height: var(--multi-select-header-row-height);
          line-height: var(--multi-select-header-row-height);
          //font-size: calc(var(--multi-select-header-row-height) - 0.5rem - 4px);
          font-size: var(--multi-select-font-size);
          align-content: center;
          text-align: center;
      }
      details[open] {
          padding-bottom: 0.25rem;
      }
      details[open] summary {
        border-bottom: 1px solid #aaa;
      }
      summary {
          text-align: center;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem;
      }
      .open-icon {
          cursor: pointer;
          user-select: none;
          height: var(--multi-select-header-row-height);
          line-height: var(--multi-select-header-row-height);
          align-self: flex-start;
          align-content: center;
          font-size: var(--multi-select-font-size);
      }


       `;
  @property({type: String})
  name = 'default name';

  @property({ attribute: false })
  optionsData: Array<{ label: string, value: string }> = [];

  @property({ type: Boolean })
  searchEnabled = false;

  constructor() {
    super();
    //this.optionList = new HTMLOptionsCollection();
  }

  createOptions() {
    const select_elem = this.shadowRoot.getElementById("the-select");
    const slot = this.shadowRoot.querySelector('slot');
    //let childNodes = slot.assignedElements({flatten: true});
    let childNodes = Array.from(this.children);
    childNodes = childNodes.filter((n) => n.nodeName === "OPTION");

    if (childNodes.length === 0) {
      //no slottet content, try data attribute
      childNodes = this.optionsData.map((item) => {
        let o = document.createElement("option");
        o.label = item.label;
        o.value = item.value;
        return o;
      })

    }

    childNodes.forEach((n) => {
      select_elem.appendChild(n);
    });


  }
  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.createOptions();
  }
  handleSlotchange(e: Event) {
    this.createOptions();
  }

  selectionChangeHandler(ev: Event) {
    const select = ev.target as HTMLSelectElement;
    const container = this.shadowRoot.getElementById("tag-container");
    for (const child of container.children) {
      child.removeEventListener("click", this.tagElemClickListener);
    }
    container.replaceChildren();
    //const search_input = this.shadowRoot.getElementById("search-input");
    const values = Array.from(select.selectedOptions).map((o) => {

      let elem = document.createElement("div");
      elem.innerHTML = o.value;
      elem.classList.add("tag");
      elem.setAttribute("part", "tag");

      elem.addEventListener("click", this.tagElemClickListener);

      let r = container.appendChild(elem);


    });

  }
  tagElemClickListener = (ev:Event) =>  {
    ev.stopPropagation();
    ev.preventDefault();
    const myself = ev.target as HTMLElement;
    const t = myself.innerHTML;
    myself.parentNode.removeChild(myself);

    const select: HTMLSelectElement = this.shadowRoot.getElementById("the-select") as HTMLSelectElement;

    let u = Array.from(select.selectedOptions).find((item) => item.value === t);
    u.selected = false;
  }

  onSearchInput(ev: InputEvent) {
    const search = this.shadowRoot.getElementById("the-select") as HTMLSelectElement;
    const t = ev.target as HTMLInputElement;

    Array.from(search.options).forEach((o) => {
      if (o.value.toLowerCase().match(t.value.toLowerCase())) {
        o.style.display = "block";
      } else {
        o.style.display = "none";
      }
    });

  }

  getSelection(): Array<{label: string, value: string}> {
    const select = this.shadowRoot.getElementById("the-select") as HTMLSelectElement;
    const values = Array.from(select.selectedOptions).map(o => (
      { "label": o.label, "value": o.value }
    ));
    return values;

  }
  render() {
    console.log("search enabled: ", this.searchEnabled);
      return html`

        <div part="main-container" id="container">
            <!-- <slot></slot> -->
            <details >
                <summary>
                    <span class="open-icon">&#x2192;</span>
                    <div id="input-container">
                        <div id="tag-container" part="tag-container"></div>
                            ${this.searchEnabled ?
                                html`<input id="search-input" type="text" placeholder="search" @input=${this.onSearchInput}/>` :
                                html``
                            }
                        <!-- <input id="search-input" type="text" placeholder="search" @input=${this.onSearchInput}/> -->
                    </div>
                </summary>
                <select part="select" id="the-select" @change=${this.selectionChangeHandler} multiple></select>
            </details>
        </div>
    `;
  }
}
