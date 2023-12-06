import {css, html, LitElement} from 'lit'
import {Greet} from "../wailsjs/go/main/App";
import {customElement, property} from 'lit/decorators.js'
import './style.css';

@customElement('paint-board')
export class PaintBoard extends LitElement {}
