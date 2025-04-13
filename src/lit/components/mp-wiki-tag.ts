import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('mp-wiki-tag')
export class WikiTag extends LitElement {

    static styles = css`
        :host {
            display: inline-block;


        }
        #container {
            border: 1px solid black;
            background-color: palegoldenrod;


        }`;
    @property({type: String})
    wikiName = '';

    _onMouseEnter(event:MouseEvent) {
        console.log('WikiTag::onMouseEnter');
        const _event = new CustomEvent('overwikitag', {bubbles: true, composed: true, detail: {wikiname: this.wikiName, clientX: event.clientX, clientY: event.clientY}});

        this.dispatchEvent(_event);
    }
    render(){
        return html`
        <div id='container'>
                <slot @mouseenter="${this._onMouseEnter}"></slot>
        </div>`;
    }
}
