import {css, html, LitElement, unsafeCSS} from 'lit'
import {Update, ReadToken, GetTokenOrEmpty} from "../wailsjs/go/drawer/Api"
import {Start, Reset, WorkStatus, GetTokens} from "../wailsjs/go/drawer/ImageDrawer"
import {GetBoard, FromBase64} from "../wailsjs/go/main/ImgBase64"
import {customElement, property} from 'lit/decorators.js'
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {styleMap} from 'lit/directives/style-map.js';

import './assets/layui/layui.js';
import _layuiCSS from './assets/layui/css/layui.css';

const layuiCSS = unsafeCSS(_layuiCSS);

ReadToken();

function layuiInputHTML(label: string, inputType: string, inputID: string, placeholder: string) {
    return html`
        <div class="layui-form-item">
            <label class="layui-form-label">${label}</label>
            <div class="layui-input-block">
                <input type="${inputType}" id="${inputID}" placeholder="${placeholder}" autocomplete="off" class="layui-input">
            </div>
        </div>
    `
}

@customElement('token-adder')
export class TokenAdder extends LitElement {
    static styles = [layuiCSS, css`
        #tokenAdder {
            font-family: 'Ubuntu', 'Source Code Pro', 'Cascadia Code', 'Consolas', 'monospace';
            position: absolute;
            left: 1030px;
            top: 30px;
            width: 450px;
            height: auto;
            border: 2px dotted white;
            border-radius: 24px;
            padding: 12px;
        }
    `]

    @property()
    _tokens ?: { uid: string, token: string }[]

    updateTokens() {
        GetTokens().then((tokens) => {
            let arr = []
            for (let key in tokens) {
                arr.push({uid: key, token: tokens[key]});
            }
            this._tokens = arr;
        })
    }

    addToken() {
        let uidElem = this.shadowRoot?.getElementById('token-uid') as HTMLInputElement;
        let pasteElem = this.shadowRoot?.getElementById('token-paste') as HTMLInputElement;
        if (uidElem == null || pasteElem == null) return ;

        GetTokenOrEmpty(parseInt(uidElem.value), pasteElem.value).then((tok) => {
            if (tok != "") alert("Got Token: " + tok), this.updateTokens();
            else alert("Failed...")
        });
    }

    _tokenListening = 0
    render() {
        if (this._tokenListening == 0 || this._tokens == null) {
            this.updateTokens();
            setInterval(this.updateTokens, 2000);
            this._tokenListening = 1;
        }
        return html`
            <div id="tokenAdder">
                <form class="layui-form" action="">
                    ${layuiInputHTML("UID", "number", "token-uid", "0")}
                    ${layuiInputHTML("Paste", "text", "token-paste", "xxxxxxxx")}
                    <div class="layui-form-item">
                        <div class="layui-input-block">
                            <button class="layui-btn" @click=${this.addToken}>Add</button>
                        </div>
                    </div>
                </form>
                <table cellpadding="10" class="layui-table" lay-even>
                    <colgroup>
                        <col width="40">
                        <col>
                    </colgroup>
                    <thead>
                        <tr>
                            <th>UID</th>
                            <th>Token<//th>
                        </tr>
                    </thead>
                    <tbody>
                    ${this._tokens != null ? this._tokens.map((item) => html`<tr> <td>${item.uid}</td> <td>${item.token}</td> </tr>`) : ''}
                    </tbody>
                </table>
            </div>
        `
    }
}

@customElement('image-board')
export class ImageBoard extends LitElement {
    static styles = [layuiCSS, css`
        #draw-image {
            position: absolute;
        }

        #image-setter {
            position: absolute;
            left: 450px;
            top: 620px;
            border: 2px dotted;
            border-radius: 20px;
            padding: 10px;
        }
    `]

    @property()
    imgSrc = ""

    @property()
    showImg = false

    @property()
    X = 0

    @property()
    Y = 0

    @property()
    drawingStatus = 0

    @property()
    drawingRemain = 0

    _startListen = 0

    setImage() {
        const elem = this.shadowRoot?.getElementById("imageInput") as HTMLInputElement;
        if (elem == null) return ;
        let files = elem.files;
        if (files == null) return ;
        let img = files[0];

        const reader = new FileReader();
        reader.readAsDataURL(img);
        reader.onload = () => {
            if (reader.result == null) return ;
            const res = (reader.result as string).split(",")[1];
            FromBase64(res).then((data) => {
                this.imgSrc = data;
            });
        }
    }

    setX(event: Event) {
        const input = event.target as HTMLInputElement;
        let val = parseInt(input.value);
        if (val >= 1000) val = 1000, input.value = "1000";
        if (val < 0) val = 0, input.value = "0";
        this.X = val;
    }

    setY(event: Event) {
        const input = event.target as HTMLInputElement;
        let val = parseInt(input.value);
        if (val >= 600) val = 600, input.value = "600";
        if (val < 0) val = 0, input.value = "0";
        this.Y = val;
    }

    setShow(event: Event) {
        this.showImg = (event.target as HTMLInputElement).checked;
    }

    setDrawStat() {
        var statMsg = "确定终止？";
        console.log("set draw stat:", this.drawingStatus)
        if (this.drawingStatus == 0) {
            statMsg = `确定要画目标图片？当前位置：(${this.X}, ${this.Y})`;
            if (this.imgSrc == "") {
                alert("还什么图片都没有选 QwQ");
                return ;
            }
        }

        var ok = confirm(statMsg);
        if (ok == true) {
            if (this.drawingStatus == 0) Start();
            else Reset();
        }
    }

    statusListener(self: ImageBoard) {
        WorkStatus().then((stat) => {
            if (stat == -1) {
                self.drawingStatus = 0;
            } else if (stat == 0) {
                self.drawingStatus = 2;
            } else if (stat == -2){
                self.drawingStatus = 0;
                Reset();
                alert("Token 呢？")
            } else {
                self.drawingStatus = 1;
                self.drawingRemain = stat;
            }

            console.log(stat, self.drawingStatus);
        });
    }

    render() {
        if (!this._startListen) {
            setInterval(() => this.statusListener(this), 1000);
            this._startListen = 1;
        }

        var img = ``
        const imageStyles = { left: `calc(10px + ${this.X}px)`, top: `calc(10px + ${this.Y}px)` }

        if (this.imgSrc != "" && this.showImg) {
            img = `<img src="data:image/png;base64,${this.imgSrc}"}></img>`
        }

        var drawMsg = "click to start";
        if (this.drawingStatus == 1) {
            drawMsg = "drawing...remain >= " + this.drawingRemain + "s";
        } else if (this.drawingStatus == 2) {
            drawMsg = "finished...click to stop maintain";
        }
        console.log("msg: ", drawMsg, "status: ", this.drawingStatus);


            // ${layuiCSS}
        return html`
            <div id="draw-image" style=${styleMap(imageStyles)}> ${unsafeHTML(img)} </div>
            <div id="image-setter">
                <div class="layui-form-item">
                    <div class="layui-input-block">
                        <input type="file" id="imageInput" style="layui-input" accept="image/png, image/jpeg" />
                        <button @click=${this.setImage}>设置图片</button>
                    </div>
                </div>

                <div class="layui-form-item">
                    <label class="layui-form-label">横坐标 X</label>
                    <div class="layui-input-block">
                        <input type="number" @input=${this.setX} placeholder=0 autocomplete="off" class="layui-input">
                    </div>
                </div>

                <div class="layui-form-item">
                    <label class="layui-form-label">纵坐标 Y</label>
                    <div class="layui-input-block">
                        <input type="number" @input=${this.setY} placeholder=0 autocomplete="off" class="layui-input">
                    </div>
                </div>

                <div class="layui-form-item">
                    <div class="layui-input-block">
                         <button class="layui-btn" @click=${() => {
                             this.showImg = !this.showImg;
                        }}>
                         ${this.showImg ? "关闭预览" : "开启预览"}
                         </button>

                         <button class="layui-btn" @click=${this.setDrawStat}> ${drawMsg} </button>
                    </div>
                </div>
            </div>
        `
    }
}

@customElement('paint-board')
export class PaintBoard extends LitElement {
    static styles = [layuiCSS, css`
        .paint-board {
            position: absolute;
            left: 10px;
            top: 10px;
        }
        #board {
            width: 1000px;
            height: 600px;
        }

        #interval-setter {
            width: 400px;
        }
    `]

    timerID = -1

    @property()
    flushInterval = 30

    @property()
    flushStatus = 0

    updateBoard() {
        console.log("In Update...");
        this.flushStatus = 1;
        Update().then(() => {
            this.flushStatus = 2;
            GetBoard().then((data) => {
                this.flushStatus = 3;
                this.imageData = data;
            })
        })
    }

    startTimer() {
        this.updateBoard();
        this.timerID = setInterval(this.updateBoard, this.flushInterval * 1000);
        console.log("timer start, ID", this.timerID);
    }

    changeInterval() {
        let inter = (this.shadowRoot?.getElementById('interval') as HTMLInputElement)?.value;
        console.log(inter);
        if (inter) {
            if (this.timerID != -1) {
                clearInterval(this.timerID);
            }
            this.flushInterval = parseInt(inter);
            this.startTimer();
        }
    }

    render() {
        var stat = "刷新未开始";
        var msg = "开始刷新";
        if (this.flushStatus != 0) {
            msg = "更新刷新间隔";
        }

        if (this.flushStatus == 1) {
            stat = "正在读取数据";
        } else if (this.flushStatus == 2) {
            stat = "正在编码图像";
        } else if (this.flushStatus == 3) {
            stat = "刷新成功！";
        }

            // ${layuiCSS}
        return html`
        <div class="paint-board">
            <img id="board" src="data:image/png;base64,${this.imageData}">

            <div class="layui-form" id="interval-setter">
                <div class="layui-form-item">
                    <label class="layui-form-label">${stat}</label>
                    <div class="layui-input-block"></div>
                </div>

                <div class="layui-form-item">
                    <label class="layui-form-label">刷新间隔</label>
                    <div class="layui-input-block">
                        <input class="layui-input" id="interval" type="number" value="${this.flushInterval}">
                    </div>
                </div>

                <div class="layui-form-item">
                    <div class="layui-input-block">
                        <button class="layui-btn" @click=${this.changeInterval} >${msg}</button>
                    </div>
                </div>
            </div>
        <div>
        `
    }

    @property()
    imageData = `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`
}
