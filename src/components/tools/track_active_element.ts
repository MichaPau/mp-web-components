
import { html, css, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';


@customElement('track-active-element')
export class TrackActiveElemnt extends LitElement {
  static styles = [
    css `
      :host {
        display: block;
        background-color: Canvas;
      }
      .container {
        width: 100%;
        height: 100%;
      }
      textarea {
        width: 100%;
        height: 100%;
        min-height: 5rem;
      }    `
  ];

  // private lastItem: {lastElem: HTMLElement | null, styleValue: string} = {lastElem: null, styleValue: ""};
  private last_elem: Element | null = null;
  private interval: undefined | ReturnType<typeof setTimeout> = undefined;

  @state()
  lastItem: {lastElem: HTMLElement | null, styleValue: string} = {lastElem: null, styleValue: ""};
  @property({attribute: "css-property"})
  cssProperty:string = "border";

  @property({attribute: "css-value"})
  cssValue:string = "2px solid red";
  
  @property({type: Number, attribute: "timeout-delay"})
  timeoutDelay:number = 250;

  connectedCallback(): void {
    super.connectedCallback();

  }
  disconnectedCallback(): void {
      super.disconnectedCallback();
      this.stop();
  }
  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.start();
  }
  start() {
      this.interval = setInterval(() => this.updateInterval(), this.timeoutDelay);
  }
  stop() {
    clearInterval(this.interval);
  }
  updateInterval() {

    /* if (this.last_elem) {
      (this.last_elem as HTMLElement).style.border = "";
    } */
    const active_element = this.getActiveElement(document) as HTMLElement;
    if(active_element && active_element !== this.lastItem.lastElem && !this.shadowRoot.contains(active_element) && active_element !== this) {
      let lastStyle = "";
      if(this.lastItem.lastElem) {
        lastStyle = active_element.style[this.cssProperty];
        this.lastItem.lastElem.style[this.cssProperty] = this.lastItem.styleValue;
        // this.lastItem.styleValue = active_element.style[this.cssProperty];

      }

        active_element.style[this.cssProperty] = this.cssValue;
        this.lastItem = {lastElem: active_element, styleValue: lastStyle};
            
    }
    /* this.last_elem = this.active_element;
    (this.active_element as HTMLElement).style.border = "3px solid red"; */
        
  }

  getActiveElement(root: Document | ShadowRoot = document): Element | null {
    // console.log("check:", root);
    const activeEl = root.activeElement;

    if (!activeEl) {
      return null;
    }

    if (activeEl.shadowRoot) {
      return this.getActiveElement(activeEl.shadowRoot);
    } else {
      return activeEl;
    }
  }

  render() {
    let info = "undefined";
    let json = "undefined";
    if (this.lastItem.lastElem) {
      info = this.lastItem.lastElem.nodeName;
      // json = JSON.stringify(this.lastItem.lastElem, Object.getOwnPropertyNames(this.lastItem.lastElem["__proto__"]),2);
      json = this.lastItem.lastElem.outerHTML;
    }
     return html`
      <div class="container">
        <details part="details">
          <summary part="summary">ActiveElement: ${info}></summary>
          <textarea spellcheck="false" part="textarea">${json}</textarea>
        </details>
      </div>
      `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'track-active-element': TrackActiveElemnt ;
  }
}
