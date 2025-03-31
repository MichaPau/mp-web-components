import {LitElement, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {styleMap} from 'lit/directives/style-map.js';
import {query} from 'lit/decorators/query.js';
import {html, unsafeStatic} from 'lit/static-html.js';

import { PopupFetchBaseClass, ReadError } from './base/mp-fetch-popup-base';

type WikiData = {
    id: string
    res_type: string
    title: string
    extract_html: string
    thumbnail_source: string,
    thumb_width: number
    thumb_height: number
    wiki_link: string

}

@customElement('mp-wiki-summary')
export class WikiSummary extends PopupFetchBaseClass {

    static styles = css`
        :host {
            border: 1px solid black;
            background-color: white;
        }
        a:link, a:visited, a:hover,
        a:active {
            text-decoration: none;
            color: black;
        }
        article {
            display: flex;
            border: 1px solid black;
            background-color: white;
        }
        p, h2 {
            margin: 0;
        }
        #popup {
            display: block;
            visibility: hidden;
            opacity: 0;
            position: fixed;
            z-index: 100;
            transition: all 0.3s ease-out;
            box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
        }
        .vertical {
            flex-direction: column;
            width: 25rem;
            height: 25rem;
            max-width: 25rem;
            max-height: 25rem;
        }
        .horizontal {
            flex-direction: row-reverse;
            width: 30rem;
            height: 18rem;
            max-width: 30rem;
            max-height: 18rem;
        }
        #article-image-container {
            flex: 0 0 12rem;
            overflow: hidden;
        }
        #article-content {
            flex: 1 1 auto;
            margin: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            overflow: hidden;
        }
        #article-content h2 {
            font-size: 1rem;
        }
        #article-content div {
            display: block;
            font-size: 0.85rem;
            overflow: hidden;
            flex: 0 1 auto; 
        }
        #article-image {
            display: block;
            max-height: 100%;
            height: 100%;
            width: 100%;
            object-fit: cover;
        }
        #close-btn {
            position: absolute;
            left: 2px;
            top: 2px;
        }
    `;

    @state()
    wikiData:WikiData = {id: '', res_type: '', title:'', extract_html: '', thumbnail_source: '', thumb_width: 0, thumb_height: 0, wiki_link: ''};

    @property({type: Boolean})
    horizontal = true;

    @property({type: Boolean})
    vertical = false;

    @property({type: Boolean})
    hasImage = true;

    @property({type: Boolean})
    isError = false;
    
    @query('#popup', true) _popup!: HTMLElement;
    
    api_url = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

    _loadPopup(data:string, clientX:number, clientY:number) {
        super.fetch_api(this.api_url + data)
        .then(jsonResult => { 
            this.wikiData = this._parseWikiData(jsonResult, data);
            this.isError = false;
            this._showPopup(clientX, clientY);
        })
        .catch(reason => { 
            console.log(reason.toString());
            let errorData:WikiData = {id: '', res_type: 'none', title:'Error finding summary page', extract_html: reason.toString(), thumbnail_source: '', thumb_width: 0, thumb_height: 0, wiki_link: ''};
            this.wikiData = errorData;
            this.hasImage = false;
            this.isError = true;
            this._showPopup(clientX, clientY);
        });
        
    }

    _showPopup(clientX:number, clientY:number) {

        if (this.wikiData.thumb_width >= this.wikiData.thumb_height) {
            this.horizontal = false;
            this.vertical = true;
        } else {
            this.horizontal = true;
            this.vertical = false;
        }

        if(this.wikiData.thumbnail_source !== '') {
            this.hasImage = true;
        } else {
            this.hasImage = false;
        }
        this._popup.style.visibility = "visible";
        this._popup.style.opacity = "1";
        const popupRect = this._popup.getBoundingClientRect();
        console.log('WikiSummary::_showPopup:', popupRect);
        const pos = super._calcPosition(clientX, clientY, popupRect);
        
        this._popup.style.left = pos.x + 'px';
        this._popup.style.top = pos.y + 'px';
    }
    //param id is just the search string for the api
    _parseWikiData (wikiJson:any, id:string) {

        let wD:WikiData = {id: '', res_type: 'none', title:'', extract_html: '', thumbnail_source: '', thumb_width: 0, thumb_height: 0, wiki_link: ''};
        let thumb_url:string = '';
        let thumb_width:string = '';
        let thumb_height:string = '';

        if (wikiJson.hasOwnProperty('thumbnail')) {
            thumb_url = wikiJson['thumbnail']['source'];
            thumb_width = wikiJson['thumbnail']['width'];
            thumb_height = wikiJson['thumbnail']['height'];
            // const tw: number = parseInt(parsedRes['thumbnail']['width']);
            // const th: number = parseInt(parsedRes['thumbnail']['height']);

            
        }
        wD = {
            id: id,
            title: wikiJson['title'],
            res_type: wikiJson['type'],
            extract_html: wikiJson['extract_html'],
            thumbnail_source: thumb_url,
            thumb_width: parseInt(thumb_width),
            thumb_height: parseInt(thumb_height),
            wiki_link: wikiJson['content_urls']['desktop']['page']
        }

        return wD;
    }
    _hidePopup(event:Event) {
        console.log("onHidePopup", event.type);
        this._popup.style.visibility = "hidden";
        this._popup.style.opacity = "0";
    }

    _onClose (event:Event) {
        event.preventDefault();
        this._hidePopup(event);
    }

    render() {
        const extract_template = html`${unsafeStatic(this.wikiData.extract_html)}`
        const classes = {
            vertical: this.vertical,
            horizontal: this.horizontal
        };

        const imageStyles = { display: this.hasImage ? 'block' : 'none'};
        const errorStyles = {color: this.isError ? 'red' : 'black'};
        return html`
            <a href=${this.wikiData.wiki_link} target="_blank" id="popup" @mouseleave="${this._hidePopup}">
                <article class=${classMap(classes)}>
                    <div id="article-image-container" style=${styleMap(imageStyles)}><!-- <img id="article-image" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/William_Blake_by_Thomas_Phillips.jpg/249px-William_Blake_by_Thomas_Phillips.jpg"> -->
                        <img id="article-image" src=${this.wikiData.thumbnail_source} alt="">
                    </div>
                    <div id="article-content" style=${styleMap(errorStyles)}>
                        <h2> ${this.wikiData.title}</h2>
                        <div>
                            ${extract_template}
                        </div>
                        <div id="close-btn" @click="${this._onClose}">X</div>
                    </div>
                    
                </article>
            </a>
        `;
    }
}