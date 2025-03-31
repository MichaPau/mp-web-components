import { LitElement, css, html, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import {repeat} from 'lit/directives/repeat.js';
import {query} from 'lit/decorators/query.js';


//https://www.sitepoint.com/building-custom-right-click-context-menu-javascript/
@customElement('mp-context-menu')
export class ContextMenu extends LitElement {


    @property({type: Boolean, attribute: 'override-contextmenu'})
    overridecontextmenu = false;

    @property({type: String, attribute: 'selector'})
    selector = '';

    @query('.context-menu', true) _container!: HTMLElement;

    @state() menuState = 0;
    
    @property({type: Array}) 
    menuData:{id: number, title: string, data: string}[] = [];

    //the element that should respond to the right click 
    //defaults to the parentNode of the component in the DOM 
    contextNode:ParentNode | null = null;

    activeClass = "active";

    static styles = css`

        /* 
        Default colors
        #2b2a33 -bg
        #52525e - selection
        #fbfbfe - text
        #5b5b66 -border
        */

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        :host {

            display: none;
            position: fixed;
            z-index: 10;
        }

        :host(.active) {
            display: block;
            box-shadow: var(--mp-menu-box-shadow, rgba(0, 0, 0, 0.09) 0px 3px 12px);
            /* box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px; */
            /* box-shadow: rgba(0, 0, 0, 0.09) 0px 3px 12px; */
        }

        .context-menu {
            background-color: var(--mp-menu-background, #2b2a33);
            border: var(--mp-menu-border, 1px solid #5b5b66);
            border-radius: var(--mp-menu-border-radius, 2px);
        }
        
        .context-menu__items {
            list-style: none;
            
        }
        .context-menu__item {
            padding: var(--mp-menu-item-padding, 0.5rem);
            color: var(--mp-menu-color, #fbfbfe);
        }
        .context-menu__item:hover {
            background-color: var(--mp-menu-background-hover, #52525e);
            color: var(--mp-menu-color-hover, #fbfbfe);
        }
        .context-menu__item:not(:last-child) {
            border-bottom: var(--mp-menu-border, 1px solid #5b5b66);;
        }
        .context-menu__link {
            text-decoration: none;
            color: inherit;
            white-space: nowrap;
        }

    `;

    
    constructor() {
      super();  
    }

    
    connectedCallback() {
        super.connectedCallback();

        if (this.selector === '') {
            this.contextNode = this.parentNode;
        } else {
            this.contextNode = document.querySelector(this.selector);
        }

        const items = this.querySelectorAll('item');
        
        items.forEach((element, index) => {
            this.menuData.push({id: index, title: element.textContent!, data: element.getAttribute('data')!});
            
        });
        
        if(this.menuData.length === 0) {
            this.menuData.push({id: 0, title: 'No items added...', data: ''});
        }

        if(this.overridecontextmenu) {
            document.addEventListener("contextmenu", this.onContextMenu);
        }

        document.addEventListener("click", this.clickHandler);
        document.addEventListener("keyup", this.onKeyUpHandler);
        window.addEventListener("resize", this._toggleMenuOff);
        window.addEventListener("scroll", this._toggleMenuOff)

    }

    disconnectedCallback() {

        if(this.overridecontextmenu) {
            document.removeEventListener('contextmenu', this.onContextMenu);
        }
        document.removeEventListener("click", this.clickHandler);
        document.removeEventListener("keyup", this.onKeyUpHandler);
        window.removeEventListener("resize", this._toggleMenuOff);
        window.removeEventListener("scroll", this._toggleMenuOff);
        super.disconnectedCallback();

    }

    
    onContextMenu = (e:MouseEvent) => {
       
        this._toggleMenuOff();

        let node:HTMLElement | null = e.target as HTMLElement;

        while(node !== null) {
            if(node === this.contextNode) {
                e.preventDefault();
                this._toggleMenuOn(e);
               
                break;
            } else {
                node = node.parentNode as HTMLElement;
            }
        }
    }

    
    normalFunction() {
        console.log('i am a normal function');
    }
    _toggleMenuOn = (e:MouseEvent) => {

        if(this.menuState !== 1) {
            this.menuState = 1;
            this.classList.add(this.activeClass);
        }
        this._positionMenu(e);

    }
    _toggleMenuOff= () => {
        if (this.menuState !== 0 ) {
          this.menuState = 0;
          this.classList.remove(this.activeClass);
        }
      }

    clickHandler = (e:MouseEvent) =>  {
        var button = e.button;
        
        if ( button === 0 ) {
            this._toggleMenuOff();
        }
    }
    onKeyUpHandler = (e:KeyboardEvent) =>  {
        if ( e.code === 'Escape' ) {
            this._toggleMenuOff();
          }
    }
    onResize = (e:Event) => {
        this._toggleMenuOff();
    }
    _positionMenu(e:MouseEvent) {
        const pos = this._getPosition(e);
        this.style.left = pos.x + "px";
        this.style.top = pos.y + "px";

    }
    _getPosition(e:MouseEvent) {
       
        const popupMargin = parseFloat(getComputedStyle(document.documentElement).fontSize) / 2;
        const popupRect = this._container.getBoundingClientRect();
        const clientRect = document.documentElement.getBoundingClientRect();

        let tx = e.clientX;
        let ty = e.clientY;

        if(ty + popupRect.height + popupMargin > clientRect.height) {
            ty -= ((ty + popupRect.height + popupMargin) - clientRect.height);
        } 

        if(ty < 0) ty = popupMargin;

        if(tx + popupRect.width + popupMargin > clientRect.width) {
            tx -= ((tx + popupRect.width + popupMargin) - clientRect.width);
        }

        return {
            x: tx,
            y: ty
        }
    }
   

    _menuItemClickHandler(e:Event) {
        const key = (e.target as HTMLElement).getAttribute('key');
        //console.log('contextmenu key:', key);
        const _event = new CustomEvent('mp-menu-clicked', {bubbles: true, composed: true, detail: key });
        this.dispatchEvent(_event);
    }
    render() {
        return html`
            <nav class="context-menu" @mouseleave=${this._toggleMenuOff}>
                <ul class="context-menu__items">
                    ${
                        repeat(this.menuData, (item) => item.id, (item, index) => html`
                            <li class="context-menu__item" @click=${this._menuItemClickHandler}>
                                <a href="#" class="context-menu__link" key=${item.data} >
                                    <i class="fa fa-eye"></i> ${item.data} - ${item.title}
                                </a>
                            </li>
                        `)
                    }
                </ul>
                </nav>
        `;
    }
}

/*
TODO:
    proper data setter


*/