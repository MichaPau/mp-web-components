import { css } from "lit";

export const defaultStyleTokens = css`

    :host {

        --__mp-color: var(--mp-color, field-text);

        --__mp-font-size: var(--mp-font-size, 1rem);
        --__mp-field-bg-color:  var(--mp-field-bg-color, field);
        --__mp-button-radius: var(--mp-button-radius, 4px);
        --__mp-border-color: var(--mp-border-color, light-dark(rgb(118, 118, 118), rgb(133, 133, 133)));
        --__mp-border-style: var(--mp-border-style, solid);
        --__mp-border-width: var(--mp-border-width, 1px);

        --__mp-border: var(--mp-border, var(--__mp-border-width) var(--__mp-border-style) var(--__mp-border-color));

    }

`;
