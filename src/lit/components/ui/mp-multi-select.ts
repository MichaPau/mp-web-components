import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('mp-multi-select')
export class MultiSelect extends LitElement {
  static styles = css`
      :host {
          display: inline-block;
          box-sizing: border-box;
          --multi-select-header-row-height: 1.5rem;
          --multi-select-font-size: calc(var(--multi-select-header-row-height) * 0.6);
          --multi-select-border-color: #aaa;

          color-scheme: light dark;

      }
      #container {
          border: 1px solid var(--multi-select-border-color);
          border-radius: 4px;
      }

      #input-container {
          display: inline-flex;
          flex: 1;
          min-width: 0;
          justify-content: space-between;
          gap: 0.5rem;
          height: auto;
          min-height: var(--multi-select-header-row-height);
          width: 100%;
      }
      #tag-container {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          color:#999;
          gap: 0.25rem;
          font-size: var(--multi-select-font-size);

      }
      #the-select {
          width: 100%;
          font-size: var(--multi-select-font-size);
          border: none;
      }
      #search-input {
          flex: 1 1 auto;
          min-width: 0;
          box-sizing: border-box;
          align-self: flex-start;
          height: var(--multi-select-header-row-height);
          font-size: var(--multi-select-font-size);
          margin: 0;
          padding: 0;
      }
      option {
          font-size: var(--multi-select-font-size);
      }
      .tag {
          color: initial;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: calc(var(--multi-select-header-row-height) * 0.1);
          cursor: pointer;
          height: var(--multi-select-header-row-height);
          line-height: var(--multi-select-header-row-height);
          font-size: var(--multi-select-font-size);
          align-content: center;
          text-align: center;
          background-color: light-dark(#b1b1b1, #4e4e4e);
          border: 1px solid light-dark(rgb(0, 0, 0),rgb(57, 57, 57));
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

  static override shadowRootOptions = {
      ...LitElement.shadowRootOptions,
      delegatesFocus: true,
  };

  public static formAssociated = true;
  private _internals: ElementInternals;

  @property({ attribute: false })
  optionsData: Array<{ label: string, value: string }> = [];

  @property({ type: Boolean, reflect: true })
  searchEnabled = false;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: Boolean, reflect: true })
  notCloseOnFocusOut = false;

  @property()
  name = "mp-multi-select";

  @property({ attribute: false })
  values: Array<{ label: string, value: string }> = [];




  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  // public checkValidity(): boolean {
  //   return this._internals.checkValidity();
  // }

  // public reportValidity(): boolean {
  //   return this._internals.reportValidity();
  // }

  // public get validity(): ValidityState {
  //   return this._internals.validity;
  // }

  // public get validationMessage(): string {
  //   return this._internals.validationMessage;
  // }

  createOptions() {
    const select_elem = this.shadowRoot.getElementById("the-select");
    const slot = this.shadowRoot.querySelector('slot');

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

  connectedCallback(): void {
    super.connectedCallback();
    this.manageInternals();

  }

  manageInternals() {
    if (this.required && this.values.length === 0) {
      this._internals.setFormValue(null);
      this._internals.setValidity({ valueMissing: true }, "required selection");
    } else {
      let fD = new FormData();
      this.values.forEach(v => fD.append(this.name, v.value));
      this._internals.setFormValue(fD);
      this._internals.setValidity({});
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    // const the_select = this.shadowRoot.getElementById("the-select") as HTMLSelectElement;
    // this._internals.setValidity(the_select.validity, the_select.validationMessage, the_select);
    this.createOptions();

    if (!this.notCloseOnFocusOut)  this.addEventListener("focusout", this.closeDetail);


  }
  handleSlotchange(e: Event) {
    this.createOptions();
  }

  closeDetail(ev: Event) {
    console.log("focus out: close detail: ", this.id);
    const detail: HTMLDetailsElement = this.shadowRoot.getElementById("the-detail") as HTMLDetailsElement;
    setTimeout((_) => detail.open = false, 25);
    //detail.open = false;
  }
  selectionChangeHandler(ev: Event) {
    const select = ev.target as HTMLSelectElement;
    const container = this.shadowRoot.getElementById("tag-container");
    for (const child of container.children) {
      child.removeEventListener("click", this.tagElemClickListener);
      child.removeEventListener("keydown", this.tagElemKeydownListener);
    }
    container.replaceChildren();

    this.values = [];
    //const search_input = this.shadowRoot.getElementById("search-input");
    const values = Array.from(select.selectedOptions).map((o) => {

      this.values.push({ "label": o.label, "value": o.value });
      let elem = document.createElement("div");
      elem.innerHTML = o.label;
      elem.classList.add("tag");
      elem.setAttribute("part", "tag");
      elem.setAttribute("value", o.value);
      elem.setAttribute("tabindex", "0");

      elem.addEventListener("click", this.tagElemClickListener);
      elem.addEventListener("keydown", this.tagElemKeydownListener);

      let r = container.appendChild(elem);


    });
    this.manageInternals();

  }
  tagElemKeydownListener = (ev: KeyboardEvent) => {
    ev.stopPropagation();
    //ev.preventDefault();
    if (ev.key === "Enter") {
      const tag = ev.target as HTMLElement;
      this.removeTag(tag);
    }
  }
  tagElemClickListener = (ev:Event) =>  {

    ev.stopPropagation();
    ev.preventDefault();
    const tag = ev.target as HTMLElement;
    this.removeTag(tag);

  }

  removeTag(tag: HTMLElement) {
    const t = tag.innerHTML;
    const parent = tag.parentNode;
    parent.removeChild(tag);

    const select: HTMLSelectElement = this.shadowRoot.getElementById("the-select") as HTMLSelectElement;

    let u = Array.from(select.selectedOptions).find((item) => item.value === t);
    u.selected = false;

    this.values = Array.from(select.selectedOptions).map((item) => { return { "label": item.label, "value": item.value } });

    this.manageInternals();
    if (parent.children.length === 0) (parent as HTMLElement).innerHTML = "no selection";
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

    return this.values;
    // const select = this.shadowRoot.getElementById("the-select") as HTMLSelectElement;
    // const values = Array.from(select.selectedOptions).map(o => (
    //   { "label": o.label, "value": o.value }
    // ));
    // return values;

  }

  detailsToggle(ev: Event) {
    console.log("details toggle: ", this.id);
    const detailsElem = this.shadowRoot.getElementById("the-detail") as HTMLDetailsElement;
    detailsElem.open = !detailsElem.open;
  }
  detailsClick(ev:Event) {
    console.log(ev.target);
    ev.preventDefault();

  }
  render() {

      return html`

        <div part="main-container" id="container">
            <!-- <slot></slot> -->
            <details id="the-detail">
                <summary>
                    <span class="open-icon">&#x2192;</span>
                    <div id="input-container">
                        <div id="tag-container" part="tag-container">no selection</div>
                            ${this.searchEnabled ?
                                html`<input id="search-input" type="text" placeholder="search" @input=${this.onSearchInput} ?disabled=${this.disabled} />` :
                                html``
                            }
                        <!-- <input id="search-input" type="text" placeholder="search" @input=${this.onSearchInput}/> -->
                    </div>
                </summary>
                <select part="select" id="the-select" @change=${this.selectionChangeHandler} multiple ?disabled=${this.disabled} required></select>
            </details>
        </div>
    `;
  }
}

//<details id="the-detail" @click=${this.detailsClick} @mousedown=${this.detailsToggle}>
