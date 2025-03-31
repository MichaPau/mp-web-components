import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

export class ReadError extends Error {
    status:number;
    constructor(message:string, status: number) {
      super(message);
      this.status = status;
      this.name = 'ReadError';
    }
}
//@customElement('mp-fetch-base')
export class PopupFetchBaseClass extends LitElement {
    
    popupPosition: {
        clientX: number,
        clientY: number,
        tx:number;
        ty: number;
    } = {clientX: 0, clientY: 0, tx: 0, ty: 0};

    _calcPosition(_clientX:number, _clientY:number, _popupRect:DOMRect) {
       
        const popupMargin = parseFloat(getComputedStyle(document.documentElement).fontSize) / 2;
        // const popupRect = this.getBoundingClientRect();
        // console.log('PopupFetchBaseClass::_calcPosition:', popupRect);
        const clientRect = document.documentElement.getBoundingClientRect();

        let tx = _clientX;
        let ty = _clientY;

        if(ty + _popupRect.height + popupMargin > clientRect.height) {
            ty -= ((ty + _popupRect.height + popupMargin) - clientRect.height);
        } 

        if(ty < 0) ty = popupMargin;

        if(tx + _popupRect.width + popupMargin > clientRect.width) {
            tx -= ((tx + _popupRect.width + popupMargin) - clientRect.width);
        }

        return {
            x: tx,
            y: ty
        }
    }

    async fetch_api(api_url:string):Promise<any> {
        const res = await fetch(api_url);

        if(res.status !== 200) {
            throw new ReadError('API call response for '+ api_url + ' not 200', res.status);
        }

        const json = await res.json();
        return json;
    }
}