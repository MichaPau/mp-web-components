import { CSSResult, CSSResultArray, CSSResultGroup, CSSResultOrNative, LitElement, PropertyValues, css, html,  } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { unsafeCSS } from 'lit';
import { adoptStyles } from 'lit';
import { marked } from 'marked';

//import { githubMdStyles } from '../../styles/markdown-styles';


export function setMdStyle(style: CSSResult) {
  mdStyle = style;


}
export let mdStyle: CSSResult | undefined = undefined;
//https://github.com/lit/lit/issues/1977
const styles_glob = [
  //githubMdStyles,
  css`
    mp-markdown-editor {
        box-sizing: border-box;
        display: block;
        width: 100%;
        height: 100%;

        h3 {
            color: green;
        }

        .editor-container {
            border: 1px solid black;
            display: flex;
            gap: 0.5rem;

        }

        .md-editor {
            flex: 1 1 50%;
            min-height: 5rem;

        }
        .md-render {
            border: 1px solid khaki;
            flex: 1 1 50%;
            padding: 2px;
            font-size: 0.75rem;
        }


    }

    `.styleSheet];
@customElement('mp-markdown-editor')
export class MarkdownEditor extends LitElement {

  @property({type: String, reflect: true})
  test = "/styles/markdown-styles.css";

  @property({type: String, reflect: true})
  value = "";

  @property({type: Number, reflect: true })
  rows = 10;

  @property({ type: Boolean, reflect: true })
  liverender = true;

  @property({ type: Number, reflect: true })
  id;

  @state()
  edit_mode = true;

  @query(".md-editor")
  editor_elem: HTMLTextAreaElement;

  @query(".md-render")
  render_elem: HTMLElement;

  @query(".editor-container")
  editor_container: HTMLElement;

  private timeout: ReturnType<typeof setTimeout>;

  static styles = [css`
    :host {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 100%;

        border: 1px solid red;

        h3 {
            color: green;
        }

        .editor-container {
            border: 1px solid black;
            display: flex;
            gap: 0.5rem;
            height: 100%;
        }

        .md-editor {
            flex: 1 1 50%;
            min-height: 5rem;
            height: 100%;

        }
        .md-render {
            border: 1px solid khaki;
            flex: 1 1 50%;
            padding: 2px;
            font-size: 0.75rem;
            min-height: 5rem;
            height: 100%;
        }


    }

    `];


  static override finalizeStyles(styles: CSSResultGroup) {
    console.log("MarkdownEditor::finalizeStyles");
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
    console.log("constructor:", this.id);
  }
  // protected createRenderRoot() {


  //   const rootNode = this.getRootNode() as ShadowRoot | Document;
  //   console.log("this root:", rootNode);
  //   for(const sheet of styles) {
  //     if(!rootNode.adoptedStyleSheets.includes(sheet)) {
  //       rootNode.adoptedStyleSheets.push(sheet)
  //     }
  //   }
  //   if (mdStyle !== undefined && !rootNode.adoptedStyleSheets.includes(mdStyle))  {
  //     rootNode.adoptedStyleSheets.push(mdStyle);
  //   }
  //     return this;
  // }

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
      this.render_md();
    }
  }

  fullscreenChangeHandler= (ev:Event) => {
    if(!document.fullscreenElement) {
      this.changeMode();
    }
  }
  inputChanged = (ev: Event) => {
    this.render_md()
  }

  keyUp = (ev: Event) => {
    if(this.timeout !== null) {
      clearTimeout(this.timeout)
    }
    this.timeout = setTimeout(this.render_md, 500);
  }

  private render_md = async () =>  {

      this.value = this.editor_elem.value
      const md = await marked(this.value);
      this.render_elem.innerHTML = md;


  }

  check(_ev:Event) {
    // const editor = this.querySelector(".md-editor") as HTMLTextAreaElement;
    // const render = this.querySelector(".md-render") as HTMLElement;

    console.log("editor:", this.editor_elem.value);
    console.log("render:", this.render_elem.innerHTML);
  }

  toggleMode(_ev:Event) {
    this.edit_mode = !this.edit_mode;
    this.changeMode();

  }

  changeMode() {
    if(this.edit_mode) {
      this.editor_elem.style.display = "block";
      this.render_elem.style.display = "none";
    } else {
      this.editor_elem.style.display = "none";
      this.render_elem.style.display = "block";
    }
  }
  fullscreen() {
    this.editor_elem.style.display = "block";
    this.render_elem.style.display = "block";
    this.editor_container.requestFullscreen();
  }
  render() {
      return html`
          <div>
              <input type="button" value="Check" @click=${this.check}/>
              <input type="button" value="Toggle" @click=${this.toggleMode}/>
              <input type="button" value="Fullscreen" @click=${this.fullscreen}/>
          </div>
          <div class="editor-container">
            <textarea class="md-editor"
                @change=${this.liverender ? this.inputChanged : null}
                @keydown=${this.liverender ? this.keyUp : null}
            >${this.value}</textarea>
            <div class="md-render markdown-body"></div>
          </div>


    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mp-markdown-editor': MarkdownEditor;
  }
}
