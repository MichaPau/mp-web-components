import { LitElement, PropertyValues, css, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
// import "./ui/mp-markdown-editor.js";
// import './ui/mp-unified-test.js'
import './test-wrapper.js';



const items = [
  "# header1 \n## Subheader1",
  "# header2 \n## Subheader2",
];

const example_test = `
# header1
## header2

- one
- two
`;

const exampleMD = `
  ---
  __Advertisement :)__

  - __[pica](https://nodeca.github.io/pica/demo/)__ - high quality and fast image
    resize in browser.
  - __[babelfish](https://github.com/nodeca/babelfish/)__ - developer friendly
    i18n with plurals support and easy syntax.

  You will like those projects!

  ---

  # h1 Heading 8-)
  ## h2 Heading
  ### h3 Heading
  #### h4 Heading
  ##### h5 Heading
  ###### h6 Heading


  ## Horizontal Rules

  ___

  ---

  ***

`;
@customElement('simple-container')
export class SimpleContainer extends LitElement {
  static styles = css`
      :host {
          display: inline-block;



      }
      #container {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: .5rem;
          border: 1px solid ButtonBorder;
          width: 100%;
          height: 100%;
          border-radius: 5px;
          overflow-y: scroll;
          padding: 0.5rem;
          /* scrollbar-gutter: stable both-edges; */
      }


      `;


  @property({type: String})
  someAttribute = 'default attribute';

  constructor() {
    super();
    console.log("SimpleContainer::constructor");

  }


  connectedCallback(): void {
    super.connectedCallback();



  }
  protected firstUpdated(_changedProperties: PropertyValues): void {
    const elem = this.shadowRoot.querySelector("#container");

        // items.forEach((i, idx) => {
        //   const m = new MarkdownEditor();
        //   m.value = i;
        //   m.id = idx + 1;
        //   m.rows = 5;
        //   elem.appendChild(m);
        // })
    //
    // this.loadcss("./styles/markdown-styles.css").then(r => {
    //   if(r !== "") {
    //     let s = unsafeCSS(r);
    //     //MarkdownEditor.styles = [...MarkdownEditor.styles, s];
    //     MarkdownEditor.elementStyles.push(s);
    //     //setMdStyle(s);
    //     //setMdStyle(s);
    //     items.forEach((i, idx) => {
    //       const m = new MarkdownEditor();
    //       m.value = i;
    //       m.id = idx + 1;
    //       m.rows = 5;
    //       elem.appendChild(m);
    //     })
    //   } else {
    //     console.log("empty");
    //   }

    // });
  }
  async loadcss(_path: string): Promise<string> {

    let r = await fetch(_path);
    if (r.ok) {
      let t = await r.text();

      return Promise.resolve(t);
    } else {
      return Promise.resolve("");
    }

  }
  render() {
      return html`
        <div id="container">
            <!-- <test-wrapper></test-wrapper>
            <test-wrapper></test-wrapper> -->
            <!-- <mp-unified-test value=${example_test}>></mp-unified-test> -->
            <mp-markdown-editor value=${exampleMD}></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <!--<mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor id="first"></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor>
            <mp-markdown-editor></mp-markdown-editor> -->
        </div>
    `;
  }
}
