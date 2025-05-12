import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, queryAssignedNodes } from 'lit/decorators.js';
import { animate } from '@lit-labs/motion';

//import { get_random_pics_from_unsplash, UnsplashImageData} from '../../utils/api-helpers';

// Registers the element
@customElement('mp-masonry-layout')
export class MasonryLayout extends LitElement {

    @property({ attribute: 'column-width', type: Number })
    columnWidth:number = 200;

    @property({ attribute: 'item-gap', type:Number })
    itemGap:number = 10;

    // @queryAssignedNodes('', true)
    // _defaultSlotNodes!:NodeListOf<HTMLElement>;

    _resizeTimeout: number = 0;
    _adaptedColumnWidth:number = 0;
    _scrollLock = false;

    blocks:number[] = [];

    static styles = css`
        :host {
            display: block;
            box-sizing: border-box;
            /* background-color: lightgray; */
            position: relative;
        }
        ::slotted(*) {
            display: block;
            box-sizing: border-box;
            position: absolute;


            background: var(--mp-masonry-item-bg-color,#eee);
            padding: var(--mp-masonry-item-padding, 10px);
            border: var(--mp-masonry-item-border, 1px solid #ddd);
            border-radius: var(--mp-masonry-item-border-radius, 3px);
        }
        img {
            object-fit: cover;
        }
        h1 {
            position: absolute;
            left: -2rem;
            top: -2rem;
        }
    `;
    connectedCallback() {
        window.addEventListener('resize', this.onWindowResize);
        //window.addEventListener('scroll', this._scrollHandler);

        super.connectedCallback();

    }
    disconnectedCallback() {
        window.removeEventListener('resize', this.onWindowResize);
        //window.removeEventListener('scroll', this._scrollHandler);
        super.disconnectedCallback();
    }

    //move scroll handler to a controller
    // _scrollHandler = () => {

    //     if(!this._scrollLock) {
    //         const delta = 5;
    //         const totalPageHeight = document.body.scrollHeight;
    //         const scrollPoint = window.scrollY + window.innerHeight;

    //         if(scrollPoint >= totalPageHeight - delta) {
    //             console.log("at the bottom");
    //             this._scrollLock = true;
    //             get_random_pics_from_unsplash(10)
    //             .then(result => {

    //                 const slot = this.shadowRoot?.querySelector('slot');

    //                 result.forEach(result => {

    //                     var img_item:HTMLImageElement = document.createElement('img');
    //                     img_item.src = result.url;
    //                     const height = (this._adaptedColumnWidth / result.ratio) + 'px';
    //                     console.log(height);
    //                     img_item.style.height = height;

    //                     this.appendChild(img_item);

    //                 });

    //             })
    //             .catch(reason => {
    //                 console.log(reason);
    //             }).finally(() => {
    //                 this._scrollLock = false;
    //             });
    //         }
    //     }
    // }

    _calcBlocks() {
        this.blocks = [];
        const cWidth = this.clientWidth;
        const colCount = Math.floor(cWidth/(this.columnWidth+this.itemGap));
        this._adaptedColumnWidth = Math.floor((cWidth - (colCount+1) * this.itemGap)/colCount);
        for(var i=0; i < colCount; i++) {
            this.blocks.push(this.itemGap);
        }
        //console.log(this.blocks);

    }
    // https://benholland.me/javascript/2012/02/20/how-to-build-a-site-that-works-like-pinterest.html
    _posBlocks() {

        this._slottedChildren.forEach(element => {

            const min = Math.min(...this.blocks);
            const index = this.blocks.indexOf(min);
            const leftPos = this.itemGap + (index * (this._adaptedColumnWidth + this.itemGap));

            element.style.width = this._adaptedColumnWidth + 'px';
            element.style.maxWidth = this._adaptedColumnWidth + 'px';
            element.style.top = min + 'px';
            element.style.left = leftPos + 'px';

            this.blocks[index] = min + element.offsetHeight + this.itemGap;
        });
        //console.log(this.blocks);
    }
    get _slottedChildren() {

        const slot = this.shadowRoot?.querySelector('slot');
        const childNodes = slot?.assignedNodes({flatten: true});
        return Array.prototype.filter.call(childNodes, (node) => node.nodeType == Node.ELEMENT_NODE);

      }
    firstUpdated() {
        console.log('MasonryLayout::firstUpdated');
        this._calcBlocks();
        this._posBlocks();

    }

    // loadData() {
    //     const data = get_random_pics_from_unsplash(10);
    // }
    // _handleClick() {
    //     this.loadData();
    // }
    onWindowResize = (ev:Event) => {
        console.log('resize');
        clearTimeout(this._resizeTimeout);
        this._resizeTimeout = window.setTimeout(this.resizeEnded, 250);
    }

    resizeEnded = () => {
        //console.log('resizeEnded',this.getBoundingClientRect());
        this._calcBlocks();
        this._posBlocks();
    }
    _slotChangeHandler() {
        console.log('MasonryLayout::slotChange');
        this._calcBlocks();
        this._posBlocks();
    }
    render() {
        console.log('MasonryLayout::render');
        return html`
            <slot @slotchange=${this._slotChangeHandler} ${animate()}></slot>
        `;
    }
}
