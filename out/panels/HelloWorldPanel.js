"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWorldPanel = void 0;
const vscode_1 = require("vscode");
const getUri_1 = require("../utilities/getUri");
const getNonce_1 = require("../utilities/getNonce");
const path = require('path');
class HelloWorldPanel {
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
        this._setWebviewMessageListener(this._panel.webview);
    }
    static render(extensionUri) {
        if (HelloWorldPanel.currentPanel) {
            HelloWorldPanel.currentPanel._panel.reveal(vscode_1.ViewColumn.One);
        }
        else {
            const panel = vscode_1.window.createWebviewPanel("startRebot", "REBOT", vscode_1.ViewColumn.One, {
                enableScripts: true,
                localResourceRoots: [
                    vscode_1.Uri.joinPath(extensionUri, "out"),
                    vscode_1.Uri.joinPath(extensionUri, "webview-ui/build"),
                ],
            });
            HelloWorldPanel.currentPanel = new HelloWorldPanel(panel, extensionUri);
        }
    }
    dispose() {
        HelloWorldPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
    sendDataToWebview(data) {
        if (this._panel) {
            this._panel.webview.postMessage({ command: "sendDataToExtension", payload: data });
        }
    }
    _getWebviewContent(webview, extensionUri) {
        const stylesUri = (0, getUri_1.getUri)(webview, extensionUri, ["webview-ui", "build", "assets", "index.css"]);
        const scriptUri = (0, getUri_1.getUri)(webview, extensionUri, ["webview-ui", "build", "assets", "index.js"]);
        const nonce = (0, getNonce_1.getNonce)();
        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Hello World</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
    }
    _setWebviewMessageListener(webview) {
        webview.onDidReceiveMessage((message) => {
            const command = message.command;
            const payload = message.payload;
            switch (command) {
                case "hello":
                    vscode_1.window.showInformationMessage(payload);
                    return;
                case "sendDataToExtension":
                    console.log('Received data from webview:', payload);
                    // Perform actions with the received data here
                    return;
            }
        }, undefined, this._disposables);
    }
}
exports.HelloWorldPanel = HelloWorldPanel;
//# sourceMappingURL=HelloWorldPanel.js.map