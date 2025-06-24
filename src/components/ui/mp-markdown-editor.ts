import { CSSResultGroup, LitElement, PropertyValues, css, html,  } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';
import { customElement, property, state, query } from 'lit/decorators.js';
import { unsafeCSS } from 'lit';
// import { adoptStyles } from 'lit';
import { micromark } from 'micromark';
// import { fromMarkdown, CompileContext } from 'mdast-util-from-markdown';

import { defaultStyleTokens } from '../../styles/mp-default-style-tokens.js';
import './mp-toggle-button.js';
import { ToggleButton }  from './mp-toggle-button.js';


//https://github.com/WICG/webcomponents/issues/909
//https://github.com/lit/lit/issues/1977

/**
 * @summary MarkdownEditor uses micromark to render the markdown
 *
 * @csspart edit-element - the textarea
 * @csspart render-element - the render container
 * @csspart button-edit - edit toggle button
 * @csspart button-render - render toggle button
 * @csspart button-fullscreen - fullscreen button
 **/
@customElement('mp-markdown-editor')
export class MarkdownEditor extends LitElement {

  static override shadowRootOptions = {
      ...LitElement.shadowRootOptions,
      delegatesFocus: true,
    };

  @property({type: String, reflect: true})
  test = "/styles/markdown-styles.css";

  @property({type: String, reflect: true})
  value = "";

  @property({type: Number, reflect: true })
  rows = 10;

  @property({ type: Boolean, reflect: true })
  liverender = true;

  @property({ type: Number, reflect: true, attribute: "parse-timeout" })
  parseTimeout = 500;

  @property({ type: String, attribute: "justify-buttons", reflect: true })
  justifyButtons: "flex-start"|"flex-end"|"center"|"space-between"|"space-around"|"space-evenly" = "flex-start";

  @state()
  show_editor = true;

  @state()
  show_render = true;

  @state()
  isFullscreen = false;

  @query(".md-editor")
  editor_elem!: HTMLTextAreaElement;

  @query(".md-render")
  render_elem!: HTMLElement;

  @query(".editor-container")
  editor_container!: HTMLElement;

  @query("#toggle_btn_editor")
  toggl_btn_editor!: ToggleButton;

  @query("#toggle_btn_render")
  toggl_btn_render!: ToggleButton;

  private timeout: ReturnType<typeof setTimeout> | null = null;

  static styles = [
    defaultStyleTokens,
    css`
    :host {
        display: block;
        resize: vertical;
        overflow: hidden;
        height: auto;
        width: 100%;
        border: var(--__mp-border);
        font-size: 1rem;
        padding: 0.25rem 0.25rem 0.5rem;
        min-height: 3rem;

        --__mp-md-button-size: var(--mp-md-button-size, 1.6rem);


        box-sizing: border-box;
       * {
            display: block;
            box-sizing: border-box;
        }
    }
    .main-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 0.25rem;
        height: 100%;
        /* resize: vertical;
        overflow: hidden; */
        /* border: 2px solid red; */
    }
    .editor-container {
        width: 100%;
        order: 2;
        display: flex;
        gap: 0.5rem;
        height: 100%; 
        overflow-y: auto;
        overflow-x: hidden;
        /* min-height: 5rem; */

    }
    .button-container {
        order: 1;
        display: flex;
        gap: 0.25rem;
        align-items: center;
        mp-toggle-button {
          &::part(button) {
            height: var(--__mp-md-button-size);
            width: var(--__mp-md-button-size);
          }
        }
        button {
          height: var(--__mp-md-button-size);
          width: var(--__mp-md-button-size);
          display: inline-flex;
          align-items: center;
          justify-content: center;          }
        .svg {
          display: block;
          height: 80%;
          width: 80%;          
        }
    }

    .md-editor, .md-render {
        flex: 1 1 50%;
        padding: 2px;
        margin: 0;
        /* height: 100%; */
        overflow-y: auto;
    }
    .md-editor {
        display: block;
        white-space: pre-wrap;
        border: var(--__mp-border);
        resize: none;

    }
    .md-render {
        display: block;
        border: var(--__mp-border);
        background-color: var(--__mp-field-bg-color);
    }

    .hide {
        /* visibility: collapse; */
        display: none;
    }
    .show {
        /* visibility: visible; */
        display: block;
    }

    `];


  static override finalizeStyles(styles: CSSResultGroup) {

    const elementStyles = super.finalizeStyles(styles);
    const style_elem: HTMLLinkElement | null = document.head.querySelector('link[data-style-name="mdstyle"]');

    if( style_elem) {
      let result = Array.from(style_elem.sheet!.cssRules)
        .map(rule => rule.cssText || "")
        .join("\n");

      elementStyles.push(unsafeCSS(result));
    }
    return elementStyles;
  }

  constructor() {
    super();

  }
  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("fullscreenchange", this.fullscreenChangeHandler);

  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("fullscreenchange", this.fullscreenChangeHandler);

  }

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('value')) {
      this.editor_elem.value = this.value;
      this.render_md(true);
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    if (this.value !== "") {
      this.editor_elem.value = this.value;
      this.render_md(true);
    }

    this.toggl_btn_render.on = this.show_render;
    this.toggl_btn_editor.on = this.show_editor;

  }

  fullscreenChangeHandler= (ev:Event) => {
    if(!document.fullscreenElement) {
      this.isFullscreen = false;
    }
  }
  inputChanged = (ev: Event) => {
    this.render_md()
  }

  keyUp = (ev: Event) => {
    if(this.timeout !== null) {
      clearTimeout(this.timeout)
    }
    if (this.parseTimeout > 0) {
      this.timeout = setTimeout(this.render_md, this.parseTimeout);
    } else {
      this.render_md();
    }

  }

  private render_md = async (first_render: boolean = false) =>  {

      const md = this.editor_elem.value.trim();
      if (this.value != md || first_render) {
        /* console.log("render, dispatch & co"); */
        const html = micromark(md);

        this.render_elem.innerHTML = html;
        if (!first_render) {
          this.value = md;
          this.dispatchEvent(new CustomEvent('mp-markdown-update', { composed: true, bubbles: true, detail: md}));
        }
      }
  }

  toggleEditor(ev:Event) {
    this.show_editor = (ev as CustomEvent).detail;

    if(!this.show_render && !this.show_editor) {
      this.show_render = true;
      this.toggl_btn_render.on = true;
    }
  }

  toggleRender(ev:Event) {
    this.show_render = (ev as CustomEvent).detail;

    if(!this.show_render && !this.show_editor) {
      this.show_editor = true;
      this.toggl_btn_editor.on = true;
    }
  }

  fullscreen() {
    this.isFullscreen = true;
    this.editor_container.requestFullscreen({ navigationUI: "show" });
  }

  render() {
    const buttonStyle = { justifyContent: this.justifyButtons};
    const showEditor = {
      show: this.show_editor || this.isFullscreen,
      hide: !this.show_editor && !this.isFullscreen,
    }
    const showRender = {
      show: this.show_render || this.isFullscreen,
      hide: !this.show_render && !this.isFullscreen,
    }
      return html`
          <div class="main-container">
          <div part="editor-container" class="editor-container">
               <textarea part="edit-element"  class="md-editor ${classMap(showEditor)}"
                   @change=${this.liverender ? this.inputChanged : null}
                   @keydown=${this.liverender ? this.keyUp : null}
              ></textarea>
            <div tabindex="-1" part="render-element" class="md-render markdown-body ${classMap(showRender)}" ></div>
          </div>
          <div class="button-container" style=${styleMap(buttonStyle)}>
              <mp-toggle-button part="button-edit" id="toggle_btn_editor" @mp-toggle-event=${this.toggleEditor} on>
                <svg class="svg" xmlns="http://www.w3.org/2000/svg" height="1em" fill="currentColor" viewBox="0 0 512 512">
                  <path d="M 38.69767441860465 358.2015503875969 L 15.875968992248062 435.5968992248062 L 38.69767441860465 358.2015503875969 L 15.875968992248062 435.5968992248062 L 3.9689922480620154 477.27131782945736 L 3.9689922480620154 477.27131782945736 Q 0 491.16279069767444 9.922480620155039 501.08527131782944 Q 19.844961240310077 511.0077519379845 33.736434108527135 507.0387596899225 L 75.4108527131783 495.13178294573646 L 75.4108527131783 495.13178294573646 L 152.80620155038758 472.31007751937983 L 152.80620155038758 472.31007751937983 Q 171.65891472868216 466.3565891472868 186.54263565891472 453.4573643410853 Q 188.52713178294573 451.47286821705427 190.51162790697674 449.48837209302326 L 492.15503875968994 147.84496124031008 L 492.15503875968994 147.84496124031008 Q 508.031007751938 130.97674418604652 510.015503875969 109.14728682170542 Q 512 87.31782945736434 500.09302325581393 68.46511627906976 Q 496.1240310077519 63.50387596899225 492.15503875968994 58.542635658914726 L 452.4651162790698 18.852713178294575 L 452.4651162790698 18.852713178294575 Q 433.61240310077517 0.9922480620155039 407.8139534883721 0.9922480620155039 Q 383.0077519379845 0.9922480620155039 363.16279069767444 18.852713178294575 L 61.51937984496124 321.48837209302326 L 61.51937984496124 321.48837209302326 Q 45.64341085271318 336.3720930232558 38.69767441860465 358.2015503875969 L 38.69767441860465 358.2015503875969 Z M 84.34108527131782 371.1007751937984 Q 87.31782945736434 363.16279069767444 93.27131782945736 356.2170542635659 Q 93.27131782945736 356.2170542635659 94.26356589147287 355.2248062015504 Q 94.26356589147287 355.2248062015504 95.25581395348837 354.2325581395349 L 321.48837209302326 128 L 321.48837209302326 128 L 383.0077519379845 189.51937984496124 L 383.0077519379845 189.51937984496124 L 156.7751937984496 416.74418604651163 L 156.7751937984496 416.74418604651163 Q 148.8372093023256 423.68992248062017 139.90697674418604 426.6666666666667 L 116.09302325581395 433.61240310077517 L 116.09302325581395 433.61240310077517 L 61.51937984496124 449.48837209302326 L 61.51937984496124 449.48837209302326 L 78.3875968992248 394.91472868217056 L 78.3875968992248 394.91472868217056 L 84.34108527131782 371.1007751937984 L 84.34108527131782 371.1007751937984 Z" />
                </svg>
              </mp-toggle-button>
              <mp-toggle-button part="button-render" id="toggle_btn_render" @mp-toggle-event=${this.toggleRender} on>MD</mp-toggle-button>
              <button part="button-fullscreen" @click=${this.fullscreen}>
                <svg class="svg" xmlns="http://www.w3.org/2000/svg" height="1em" fill="currentColor" viewBox="0 0 512 512">
                  <path d="M 164.57142857142858 0 Q 181.71428571428572 1.1428571428571428 182.85714285714286 18.285714285714285 Q 181.71428571428572 35.42857142857143 164.57142857142858 36.57142857142857 L 36.57142857142857 36.57142857142857 L 36.57142857142857 36.57142857142857 L 36.57142857142857 164.57142857142858 L 36.57142857142857 164.57142857142858 Q 35.42857142857143 181.71428571428572 18.285714285714285 182.85714285714286 Q 1.1428571428571428 181.71428571428572 0 164.57142857142858 L 0 18.285714285714285 L 0 18.285714285714285 Q 1.1428571428571428 1.1428571428571428 18.285714285714285 0 L 164.57142857142858 0 L 164.57142857142858 0 Z M 0 347.42857142857144 Q 1.1428571428571428 330.2857142857143 18.285714285714285 329.14285714285717 Q 35.42857142857143 330.2857142857143 36.57142857142857 347.42857142857144 L 36.57142857142857 475.42857142857144 L 36.57142857142857 475.42857142857144 L 164.57142857142858 475.42857142857144 L 164.57142857142858 475.42857142857144 Q 181.71428571428572 476.57142857142856 182.85714285714286 493.7142857142857 Q 181.71428571428572 510.85714285714283 164.57142857142858 512 L 18.285714285714285 512 L 18.285714285714285 512 Q 1.1428571428571428 510.85714285714283 0 493.7142857142857 L 0 347.42857142857144 L 0 347.42857142857144 Z M 493.7142857142857 0 Q 510.85714285714283 1.1428571428571428 512 18.285714285714285 L 512 164.57142857142858 L 512 164.57142857142858 Q 510.85714285714283 181.71428571428572 493.7142857142857 182.85714285714286 Q 476.57142857142856 181.71428571428572 475.42857142857144 164.57142857142858 L 475.42857142857144 36.57142857142857 L 475.42857142857144 36.57142857142857 L 347.42857142857144 36.57142857142857 L 347.42857142857144 36.57142857142857 Q 330.2857142857143 35.42857142857143 329.14285714285717 18.285714285714285 Q 330.2857142857143 1.1428571428571428 347.42857142857144 0 L 493.7142857142857 0 L 493.7142857142857 0 Z M 475.42857142857144 347.42857142857144 Q 476.57142857142856 330.2857142857143 493.7142857142857 329.14285714285717 Q 510.85714285714283 330.2857142857143 512 347.42857142857144 L 512 493.7142857142857 L 512 493.7142857142857 Q 510.85714285714283 510.85714285714283 493.7142857142857 512 L 347.42857142857144 512 L 347.42857142857144 512 Q 330.2857142857143 510.85714285714283 329.14285714285717 493.7142857142857 Q 330.2857142857143 476.57142857142856 347.42857142857144 475.42857142857144 L 475.42857142857144 475.42857142857144 L 475.42857142857144 475.42857142857144 L 475.42857142857144 347.42857142857144 L 475.42857142857144 347.42857142857144 Z" />
                </svg>
              </button>
          </div>
          </div>

    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mp-markdown-editor': MarkdownEditor;
  }
  interface GlobalEventHandlersEventMap {
    'mp-markdown-update': CustomEvent<string>;
  }
}

// 🖊️
