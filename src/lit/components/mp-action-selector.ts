import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {query} from 'lit/decorators/query.js';

@customElement('mp-action-selector')
export class ActionSelector extends LitElement {

    static styles = css`
        :host {
            display: inline-block;
            
           
        }
        #container {
            border: 1px solid black;
            /* background-color: palegoldenrod; */
            cursor: pointer;
            
            
        }`;

    @query('#container', true) _container!: HTMLElement;

    @property({ type: String, attribute: 'data' })
    data = '';

    @property({attribute: 'background-color', reflect: true})
    backgroundColor = 'palegoldenrod';

    @property({attribute: 'color', reflect: true})
    color = 'black';

    @property({
        converter: {
            fromAttribute: (value, type) => {
                return value?.split(',').map(item => item.trim());
            },
            toAttribute: (value, type) => {
                return (value as Array<string>).join();
            }

        }
    })
    events?:Array<string> = ['mouseenter'];

    _allowedEvents:Array<string> = [
        'mouseenter', 'mouseleave', 'click', 'dblclick', 'contextmenu'
    ];
    firstUpdated() {
        //console.log("ActionSelector::firstUpdated");
        this.events?.forEach(event_str => {
            console.log(event_str);
            if(this._allowedEvents.includes(event_str)) {
                this._container.addEventListener(event_str, this._onSelectorAction);
            }
            else
                console.log(event_str, ' not in _allowedEvents');
        });
        //console.log('data:', this.data);
    }
    connectedCallback() {
        //console.log("ActionSelector::connectedCAllback");
        super.connectedCallback();
        
      }
      
      disconnectedCallback() {
        
        super.disconnectedCallback();
      }

    _onSelectorAction = (ev:Event) => {
        //console.log('ActionSelector::onSelectorAction:', ev.type);
        if(ev.type === 'contextmenu') {
            ev.preventDefault();
        }
        const _event = new CustomEvent('selectoraction', { bubbles: true, composed: true, detail: { data: this.data, mouse_event: (ev as MouseEvent)} });
        this.dispatchEvent(_event);
    }
    // _onMouseEnter(event: MouseEvent) {
    //     console.log('ActionSelector::onMouseEnter');
    //     const _event = new CustomEvent('selectoraction', { bubbles: true, composed: true, detail: { data: this.data, mouse_event: event } });

    //     this.dispatchEvent(_event);
    // }
    render() {
        const colorStyles = { 
            backgroundColor: this.backgroundColor,
            color: this.color
        };
        return html`
        <div id='container' style=${styleMap(colorStyles)}>
                
                <slot></slot>
        </div>`;
    }
}