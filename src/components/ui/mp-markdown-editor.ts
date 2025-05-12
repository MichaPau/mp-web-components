import { CSSResult, CSSResultArray, CSSResultGroup, CSSResultOrNative, LitElement, PropertyValues, css, html,  } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';
import { customElement, property, state, query } from 'lit/decorators.js';
import { unsafeCSS } from 'lit';
import { adoptStyles } from 'lit';
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

  @property({type: String, reflect: false})
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
  editor_elem: HTMLTextAreaElement;

  @query(".md-render")
  render_elem: HTMLElement;

  @query(".editor-container")
  editor_container: HTMLElement;

  @query("#toggle_btn_editor")
  toggl_btn_editor: ToggleButton;

  @query("#toggle_btn_render")
  toggl_btn_render: ToggleButton;

  private timeout: ReturnType<typeof setTimeout>;

  static styles = [
    defaultStyleTokens,
    css`
    :host {

        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 0.25rem;
        height: auto;

        * {
            box-sizing: border-box;
        }

        /* mp-toggle-button, button {
            height: var(--__mp-font-size);
        } */
        .editor-container {
            order: 2;
            border: 1px solid black;
            padding: 2px;
            display: flex;
            gap: 0.5rem;
            height: auto;
            /* min-height: 5rem; */
            resize: vertical;
            overflow: hidden;
        }
        .button-container {
            order: 1;
            display: flex;
            gap: 0.25rem;
            align-items: center;
        }

        .md-editor, .md-render {
            flex: 1 1 50%;
            padding: 2px;
            margin: 0;
            max-height: 100%;
            overflow-y: auto;
            /* height: 100%; */
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
            /* display: none; */
            visibility: collapse;

            /* flex: 0 0 0px; */
        }
        .show {
            /* display: block; */
            visibility: visible;
            /* flex: 1 1 50%; */
        }
    }

    `];


  static override finalizeStyles(styles: CSSResultGroup) {

    const style_elem: HTMLLinkElement = document.head.querySelector('link[data-style-name="mdstyle"]');

    if( style_elem) {
      let result = Array.from(style_elem.sheet.cssRules)
        .map(rule => rule.cssText || "")
        .join("\n");

      this.styles.push(unsafeCSS(result));
    }
    return super.finalizeStyles(this.styles);
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

  protected firstUpdated(_changedProperties: PropertyValues): void {
    if (this.value !== "") {
      this.editor_elem.textContent = this.value;
      this.render_md();
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

  private render_md = async () =>  {

    const md = this.editor_elem.value;

    const html = micromark(md);

    this.render_elem.innerHTML = html;

  }

  check(_ev:Event) {

    // console.log("editor:", this.editor_elem.value);
    // console.log("render:", this.render_elem.innerHTML);
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

  textOnScroll(source: HTMLElement, target: HTMLElement) {

  }

  testHandler(ev:Event) {

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
          <div part="editor-container" class="editor-container">
               <textarea part="edit-element"  class="md-editor ${classMap(showEditor)}"
                   @change=${this.liverender ? this.inputChanged : null}
                   @keydown=${this.liverender ? this.keyUp : null} .value=${this.value}
              ></textarea>
            <div part="render-element" class="md-render markdown-body ${classMap(showRender)}" ></div>
          </div>
          <div class="button-container" style=${styleMap(buttonStyle)}>
              <mp-toggle-button part="button-edit" id="toggle_btn_editor" @mp-toggle-event=${this.toggleEditor} on>🖊️</mp-toggle-button>
              <mp-toggle-button part="button-render" id="toggle_btn_render" @mp-toggle-event=${this.toggleRender} on>MD</mp-toggle-button>
              <button part="button-fullscreen" @click=${this.fullscreen}>[ ]</button>
          </div>


    `;
  }
}

//<button @click=${this.testHandler}>Test</button>
// <textarea  class="md-editor"
//     @change=${this.liverender ? this.inputChanged : null}
//     @keydown=${this.liverender ? this.keyUp : null}
//>${this.value}</textarea>

// <div contenteditable="plaintext-only" class="md-editor"
//     @change=${this.liverender ? this.inputChanged : null}
//     @keydown=${this.liverender ? this.keyUp : null}
// ></div>
declare global {
  interface HTMLElementTagNameMap {
    'mp-markdown-editor': MarkdownEditor;
  }
}
