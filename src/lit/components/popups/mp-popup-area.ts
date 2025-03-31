import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {query} from 'lit/decorators/query.js';
import { ContextMenu } from '../mp-context-menu.js';
import { WikiSummary } from './mp-wiki-summary.js';

import '../mp-context-menu.js';
import './mp-wiki-summary.js';

// Registers the element
@customElement('mp-popup-area')
export class PopupArea extends LitElement {
    // Styles are applied to the shadow root and scoped to this element
    static styles = css`
    
    :host {
        background-color: lightgray;
    }
    
  `;

    _clientPos: {
        clientX: number,
        clientY: number
    } = {clientX: 0, clientY: 0};

    @property({type: Object, attribute: false})
    posInfo:{x:number, y:number} = {x: 0, y:0};

    @property()
    _selectedData:String = '';

    @query('#context-menu', true) _contextMenu!:ContextMenu;
    @query('#wiki-summary', true) _wikiSummary!:WikiSummary;
   

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('selectoraction', this._selectorAction);
        this.addEventListener('mp-menu-clicked', this._onContextMenu);
    }

    disconnectedCallback() {
        this.removeEventListener('selectoraction', this._selectorAction);
        this.removeEventListener('mp-menu-clicked', this._onContextMenu);
        super.disconnectedCallback();
    }

    _onContextMenu(ev:Event) {
        console.log("PopupArea::oncontextmenu:", (ev as CustomEvent).detail);
        
        console.log('this check:',this._wikiSummary._loadPopup);
        const e = ev as CustomEvent;
        const data = (e.detail as String).split(':');

        if(data[0] === 'wiki') {
            this.posInfo = {x:  this._clientPos.clientX, y: this._clientPos.clientY};
            this._wikiSummary._loadPopup(data[1], this._clientPos.clientX, this._clientPos.clientY);
        }


    }
    _selectorAction(ev:Event) {

        const custom_ev:CustomEvent = (ev as CustomEvent);
        console.log("PopupArea::_selectorAction:",custom_ev.detail);
        this._selectedData = custom_ev.detail.data;
       
        this._contextMenu.menuData = [
            {id: 0, title: 'Wiki Summary', data: 'wiki:'+custom_ev.detail.data},
            {id: 1, title: 'Dictionary',  data: 'dict:'+custom_ev.detail.data}
        ];
        
        this._clientPos = {clientX: custom_ev.detail.mouse_event.clientX, clientY: custom_ev.detail.mouse_event.clientY};
        this._contextMenu._toggleMenuOn(custom_ev.detail.mouse_event);
        
    }
    // Render the component's DOM by returning a Lit template
    render() {
        return html`
        <mp-context-menu selector="mp-popup-area" id="context-menu">
            <item data="${this._selectedData}">Wiki Summary</item>
            <item data="${this._selectedData}">Dictionary</item>
        </mp-context-menu>
        <mp-wiki-summary id="wiki-summary">WikiSummary</mp-wiki-summary>
        <!-- <mp-class-tester id="class-tester">ClassTester</mp-class-tester> -->
        <slot></slot>
        <h2>x: ${this.posInfo.x}; y: ${this.posInfo.y}</h2>
    `;
    }
}