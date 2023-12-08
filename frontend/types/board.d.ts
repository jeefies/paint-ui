import { LitElement } from 'lit';
import './assets/layui/layui.js';
export declare class TokenAdder extends LitElement {
    static styles: import("lit").CSSResult[];
    _tokens?: {
        uid: string;
        token: string;
    }[];
    updateTokens(): void;
    addToken(): void;
    _tokenListening: number;
    render(): import("lit-html").TemplateResult<1>;
}
export declare class ImageBoard extends LitElement {
    static styles: import("lit").CSSResult[];
    imgSrc: string;
    showImg: boolean;
    X: number;
    Y: number;
    drawingStatus: number;
    drawingRemain: number;
    _startListen: number;
    setImage(): void;
    setX(event: Event): void;
    setY(event: Event): void;
    setShow(event: Event): void;
    setDrawStat(): void;
    statusListener(self: ImageBoard): void;
    render(): import("lit-html").TemplateResult<1>;
}
export declare class PaintBoard extends LitElement {
    static styles: import("lit").CSSResult[];
    timerID: number;
    flushInterval: number;
    flushStatus: number;
    updateBoard(): void;
    startTimer(): void;
    changeInterval(): void;
    render(): import("lit-html").TemplateResult<1>;
    imageData: string;
}
