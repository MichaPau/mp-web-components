import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { defaultStyleTokens } from '../../styles/mp-default-style-tokens.js';

 /**
 * @summary Multi select dropdown component. Shows selected items as button badges.
 * @csspart main-container
 * @csspart icon-container
 * @csspart tag-container
 * @csspart input-container
 * @csspart select
 * @slot - the select options (if no slotted options are present, the component tries the 'optionsData' property)
 
 **/
@customElement('mp-multi-select')
export class MultiSelect extends LitElement {
  static styles = [
    defaultStyleTokens,
    css`
      :host {
          font-size: var(--__mp-font-size);
          display: inline-block;
          box-sizing: border-box;
          --__mp-multi-select-header-row-height: var(--mp-multi-select-header-row-height, var(--__mp-font-size)*1.5);
         
          max-height: 100%;
          box-sizing: border-box;
      }
      * {
          box-sizing: border-box;
      }
      button, input {
          display: inline-block;
          box-sizing: content-box; 
          max-height: var(--__mp-multi-select-header-row-height);
          height: var(--__mp-multi-select-header-row-height);
          margin: 0;
          padding: 0;
          /* font-size: 75%;
          height: 100%; */
          
      }
      .no-selection-style {
        border: none;
        background: none;


      }
      #container {
          position: relative;
          border: var(--__mp-border);
          background-color: var(--__mp-field-bg-color);
          min-height: var(--__mp-multi-select-header-row-height);
          /* height: 100%; */
      }

      #input-container {
          display: inline-flex;
          flex: 1;
          min-width: 0;
          justify-content: space-between;
          gap: 0.5rem;
          height: auto;
          min-height: var(--__mp-multi-select-header-row-height);
          width: 100%;
      }
      #tag-container {
          flex: 1 1 20ch;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          color:#999;
          gap: 0.25rem;
          text-wrap: nowrap;
          overflow: hidden;
          height: var(--__mp-multi-select-header-row-height);

      }
      #the-select {
          box-sizing: border-box;
          position: absolute;
          width: 100%;
          border: var(--__mp-border);
          z-index: 99;
      }
      #search-input {
          flex: 1 1 20ch;
          min-width: 0;
          box-sizing: border-box;
          align-self: flex-start;
          max-height: var(--__mp-multi-select-header-row-height);
          
      }
      option {
          /* font-size: var(--mp-font-size); */
      }
      /* .tag {
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
      } */
      details {
          position: relative;
          
      }
     
      details[open] summary > .open-icon {
        transform: rotate(90deg);
      }
      summary {
          text-align: center;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 2px;
      }

      #icon  {
          display: block;
      }
      .open-icon {
          cursor: pointer;
          user-select: none;
          height: var(--__mp-font-size);
          width: var(--__mp-font-size);
          transition: all 0.15s;
          transition-timing-function: ease-in;
      }


    `];

  static override shadowRootOptions = {
      ...LitElement.shadowRootOptions,
      delegatesFocus: true,
  };

  public static formAssociated = true;
  private _internals: ElementInternals;

  private validationMessage: string;
  
  /** data used when no options slot elements are present - slot wins (slot and this property do not get merged) **/
  @property({ attribute: false })
  optionsData: Array<{ label: string, value: string }> = [];

  /** the size for the select **/
  @property({ type: Number, reflect: true })
  size = 0;

  /** if the search bar is enabled and shown**/
  @property({ type: Boolean, reflect: true, attribute: "search-enabled" })
  searchEnabled = false;


  /** disables the select and the input if shown**/
  @property({ type: Boolean, reflect: true })
  disabled = false;


  /** check form required validity **/
  @property({ type: Boolean, reflect: true })
  required = false;

  /** default closes the select dropdown on focusout **/
  @property({ type: Boolean, reflect: true, attribute: "no-close-on-focus-out"})
  noCloseOnFocusOut = false;

  /** a name attribute **/
  @property()
  name = "mp-multi-select";

  /** the values selected: Array<{ label: string, value: string }> **/
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

  private createOptions() {
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
    this.addEventListener("keydown", this.onKeyDown);

    const s = window.getComputedStyle(this);
    if (s.width === "0px" || s.width === "") {
      this.searchEnabled ? this.style.width = "40ch" : this.style.width = "20ch";
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this.onKeyDown);
  }
  onKeyDown(ev:KeyboardEvent) {
    if (ev.key === "Escape") {
      const detailsElem = this.shadowRoot.getElementById("the-detail") as HTMLDetailsElement;

      if(detailsElem.open) {
        detailsElem.open = false;
      }
    }
  }
  manageInternals() {
    if (this.required && this.values.length === 0) {
      this._internals.setFormValue(null);
      this._internals.setValidity({ valueMissing: true }, this.validationMessage);
    } else {
      let fD = new FormData();
      this.values.forEach(v => fD.append(this.name, v.value));
      this._internals.setFormValue(fD);
      this._internals.setValidity({});
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    const the_select = this.shadowRoot.getElementById("the-select") as HTMLSelectElement;
    this.validationMessage = the_select.validationMessage;
    // this._internals.setValidity(the_select.validity, the_select.validationMessage, the_select);
    this.manageInternals();
    this.createOptions();

    if (!this.noCloseOnFocusOut)  this.addEventListener("focusout", this.closeDetail);

    // const elem = this.parentElement.querySelector("mp-multi-select");
    // console.log("width: ", elem.style.position);

  }
  handleSlotchange(e: Event) {
    this.createOptions();
  }

  closeDetail(ev: Event) {
    //console.log("focus out: close detail: ", this.id);
    const detail: HTMLDetailsElement = this.shadowRoot.getElementById("the-detail") as HTMLDetailsElement;
    setTimeout((_) => detail.open = false, 25);
    //detail.open = false;
  }
  selectionChangeHandler(ev: Event) {
    console.log("multiselect2::selectionChenaged");
    const select = ev.target as HTMLSelectElement;

    this.values = [];
    const values = Array.from(select.selectedOptions).map((o) => {
      this.values.push({ "label": o.label, "value": o.value });
    });
    this.manageInternals();

  }
  tagElemKeydownListener = (ev: KeyboardEvent) => {
    ev.stopPropagation();
    //ev.preventDefault();
    if (ev.key === "Enter") {
      const tag = ev.target as HTMLButtonElement;
      this.removeTag(tag);
    }
  }
  tagElemClickListener = (ev:Event) =>  {

    ev.stopPropagation();
    ev.preventDefault();
    const tag = ev.target as HTMLButtonElement;
    this.removeTag(tag);

  }

  removeTag(tag: HTMLButtonElement) {
    console.log("multiselect::removetag");
    //const t = tag.innerHTML;
    // const parent = tag.parentNode;
    // parent.removeChild(tag);

    const select: HTMLSelectElement = this.shadowRoot.getElementById("the-select") as HTMLSelectElement;

    let u = Array.from(select.selectedOptions).find((item) => item.value === tag.value);
    u.selected = false;

    this.values = Array.from(select.selectedOptions).map((item) => { return { "label": item.label, "value": item.value } });

    this.manageInternals();
    // if (parent.children.length === 0) { 
    //   (parent as HTMLElement).innerHTML = "no selection";
    //   console.log("length to zero");
    // }
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
  }

  detailsToggle(ev: Event) {
    //console.log("details toggle: ", this.id);
    const detailsElem = this.shadowRoot.getElementById("the-detail") as HTMLDetailsElement;
    detailsElem.open = !detailsElem.open;
  }
  detailsClick(ev:Event) {
    ev.preventDefault();

  }
  on_details_toggle(ev:ToggleEvent) {
    const detailsElem = this.shadowRoot.getElementById("the-detail") as HTMLDetailsElement;

    if(detailsElem.open) {
      this.shadowRoot.getElementById("the-select").focus();
    }
  }
  render() {

      return html`

        <div part="main-container" id="container">
            <!-- <slot></slot> -->
            <details id="the-detail" @toggle=${this.on_details_toggle}>
                <summary>
                    <!-- <span class="open-icon">&#x2192;</span> -->
                    <div class="open-icon" part="icon-container">
                        <svg id="icon" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" class="bi bi-arrow-right-square-fill" viewBox="0 0 16 16"> <path d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v12zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1z"/> </svg>
                    </div>
                    <div id="input-container">
                        <div id="tag-container" part="tag-container">
                        ${this.values.length === 0 ? html`<button class="no-selection-style" disabled>no selection...</button>` : html`
                          ${this.values.map((v) => html`
                            <button 
                              tabindex="0" value=${v.value}
                              @click=${this.tagElemClickListener} 
                              @keydown=${this.tagElemKeydownListener}>${v.label}</button>
                            `)}
                        `}
                        </div>
                            ${this.searchEnabled ?
                                html`<input id="search-input" type="text" placeholder="search" @input=${this.onSearchInput} ?disabled=${this.disabled} />` :
                                html``
                            }
                    </div>
                </summary>
                <select size=${this.size} part="select" id="the-select" @change=${this.selectionChangeHandler} multiple ?disabled=${this.disabled} required></select>
            </details>
        </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mp-multi-select': MultiSelect;
  }
}
//<details id="the-detail" @click=${this.detailsClick} @mousedown=${this.detailsToggle}>
// ${this.values.length === 0 ? html`<button>no selection</button>` : ``}
