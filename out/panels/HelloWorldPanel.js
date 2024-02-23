"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWorldPanel = void 0;
const vscode_1 = require("vscode");
const getUri_1 = require("../utilities/getUri");
const getNonce_1 = require("../utilities/getNonce");
const extension_1 = require("../extension");
const fs = require("fs");
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
    refactorDone() {
        if (this._panel) {
            this._panel.webview.postMessage({ command: "refactorDone" });
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
        vscode_1.window.showInformationMessage("ReBot Start working on refactoring your code 🚀");
        console.log("data from react", data);
        console.log("refactored code", data);
        console.log(data);
        let isError = false;
        let completedCount = 1; // Counter to track completed iterations
        const totalCount = data.length; // Total number of iterations
        data.forEach((file) => {
            // Create metadata folder if it does not exist
            const filePath = path.join(rootFolderPath, file.metadata.path);
            if (filePath) {
                let content = file.metadata.refactoredcontent || file.metadata.content;
                fs.writeFileSync(filePath, content);
                // window.showInformationMessage(`Refactoring ${file.data.label}`);
            }
            else {
                vscode_1.window.showErrorMessage(`Folder "${file.data.label}" not found in workspace.`);
                isError = true;
            }
            completedCount++; // Increment completed count
            // Check if all iterations are completed
            if (completedCount === totalCount && !isError) {
                vscode_1.window.showInformationMessage(`Refactoring done 👍`);
                this.refactorDone();
            }
        });
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
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; connect-src http://127.0.0.1:8000;">
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
                    return;
            }
        }, undefined, this._disposables);
    }
}
exports.HelloWorldPanel = HelloWorldPanel;
//# sourceMappingURL=HelloWorldPanel.js.map