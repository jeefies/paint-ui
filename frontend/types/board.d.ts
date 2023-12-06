import { LitElement } from 'lit';
import './style.css';
export declare class ImageBoard extends LitElement {
    X: number;
    Y: number;
    static styles: import("lit").CSSResult;
    imgSrc: string;
    errMsg: string;
    setImage(): void;
    render(): import("lit-html").TemplateResult<1>;
}
export declare class PaintBoard extends LitElement {
    static styles: import("lit").CSSResult;
    timerID: number;
    flushInterval: number;
    flushStatus: number;
    updateBoard(): void;
    startTimer(): void;
    changeInterval(): void;
    render(): import("lit-html").TemplateResult<1>;
    imageData: string;
}
