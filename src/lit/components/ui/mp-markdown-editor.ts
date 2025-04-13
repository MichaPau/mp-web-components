import { CSSResult, CSSResultArray, LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeCSS } from 'lit';
import { adoptStyles } from 'lit';
import { marked } from 'marked';

//import { githubMdStyles } from '../../styles/markdown-styles';

export function setMdStyle(_style: CSSStyleSheet) {
  mdStyle = _style;
}

export async function importMdStyle(_path: string) {
  //mdStyle = await import(_path, { with: { type: 'css' } });


}
let mdStyle: CSSStyleSheet | undefined = undefined;
//https://github.com/lit/lit/issues/1977
const styles = [
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
        }
        .md-render {
            border: 1px solid black;
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

  @state()
  edit_mode = false;




  private timeout: ReturnType<typeof setTimeout>;

  constructor() {
    super();
  }
  protected createRenderRoot() {


    const rootNode = this.getRootNode() as ShadowRoot | Document;
    for(const sheet of styles) {
      if(!rootNode.adoptedStyleSheets.includes(sheet)) {
        rootNode.adoptedStyleSheets.push(sheet)
      }
    }
    if (mdStyle !== undefined && !rootNode.adoptedStyleSheets.includes(mdStyle))  {
      rootNode.adoptedStyleSheets.push(mdStyle);
    }
      return this;
  }


  connectedCallback(): void {
    super.connectedCallback();
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
    const ta_elem = this.querySelector(".md-editor") as HTMLTextAreaElement;
    const render_elem = this.querySelector(".md-render") as HTMLTextAreaElement;

    if (ta_elem.value !== this.value) {
      this.value = ta_elem.value
      const md = await marked(this.value);
      render_elem.innerHTML = md;

    }
  }
  render() {
      return html`
          <h1>test</h1>
          <div class="editor-container">
            <textarea rows=${this.rows} class="md-editor"
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
