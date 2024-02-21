"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWorldPanel = void 0;
const vscode_1 = require("vscode");
const getUri_1 = require("../utilities/getUri");
const getNonce_1 = require("../utilities/getNonce");
const extension_1 = require("../extension");
const fs = require("fs");
const axios_1 = require("axios");
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
    refactorCode(data) {
        var _a, _b;
        // window.showInformationMessage(`Refactoring ${data.filename}`);
        const rootFolderPath = (_b = (_a = vscode_1.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.uri.fsPath;
        if (!rootFolderPath) {
            vscode_1.window.showErrorMessage("No workspace opened");
            return;
        }
        console.log("data from react", data);
        data.forEach((file) => {
            axios_1.default.post("http://127.0.0.1:8000/refactor-code", {
                code: file.metadata.content
            }).then((res) => {
                const refactoredText = res.data.refactor_code;
                let isError = false;
                // Create metadata folder if it does not exist
                const filePath = path.join(rootFolderPath, file.metadata.path);
                if (filePath) {
                    fs.writeFileSync(filePath, refactoredText);
                    console.log(`Refactoring started - ${file.data.label}`);
                    vscode_1.window.showInformationMessage(`Refactoring done - ${file.data.label}`);
                }
                else {
                    vscode_1.window.showErrorMessage(`Folder "${file.data.label}" not found in workspace.`);
                    isError = true;
                }
            });
        });
        // Promise.all(data.map((element) => {
        //   return axios.post("http://127.0.0.1:8000/refactor-code", {
        //     code: element.metadata.content
        //   }).then((res) => {
        //     const refactoredText = res.data.refactor_code;
        //     return { ...element, metadata: { ...element.metadata, refactoredcontent: refactoredText } };
        //   });
        // })).then((refactoredNodes) => {
        //   console.log("refactored code", refactoredNodes);
        //   console.log(refactoredNodes);
        //   let isError = false;
        //   refactoredNodes.forEach((file) => {
        //     // Create metadata folder if it does not exist
        //     const filePath = path.join(rootFolderPath, file.metadata.path);
        //     if (filePath) {
        //       fs.writeFileSync(filePath, file.metadata.refactoredcontent);
        //     } else {
        //       window.showErrorMessage(`Folder "${file.data.label}" not found in workspace.`);
        //       isError = true;
        //     }
        //   });
        //   if (!isError) {
        //     window.showInformationMessage(`Refactoring done 👍`);
        //   }
        // });
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
                case "getReactflowData":
                    const fileName = "reactFlowData.json"; // Specify the name of the JSON file you want to read
                    (0, extension_1.readJsonFileAtRoot)(fileName).then((data) => {
                        if (data) {
                            console.log(data); // Do something with the JSON data
                            this.sendDataToWebview(data);
                        }
                    });
                    return;
                case "refactorCode":
                    this.refactorCode(message.data);
                    return;
                case "refactorStarted":
                    vscode_1.window.showInformationMessage("ReBot Start working on refactor your code 🚀");
            }
        }, undefined, this._disposables);
    }
}
exports.HelloWorldPanel = HelloWorldPanel;
//# sourceMappingURL=HelloWorldPanel.js.map