import {customElement} from 'lit/decorators.js'
import {css, html, unsafeCSS, LitElement} from 'lit'
import layuiCSS from './assets/layui/css/layui.css';

@customElement('main-element')
export class MainElement extends LitElement {
    static styles = css`${unsafeCSS(layuiCSS)}`

    render() {
        return html`
            <paint-board></paint-board>
            <image-board></image-board>
            <token-adder></token-adder>
        `
    }
}
