"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarWebViewProvider = exports.registerWebViewProvider = void 0;
const vscode_1 = require("vscode");
const getNonce_1 = require("../utilities/getNonce");
function registerWebViewProvider(context, op) {
    const provider = new SidebarWebViewProvider(context.extensionUri, context);
    context.subscriptions.push(vscode_1.window.registerWebviewViewProvider('left-panel-webview', provider));
}
exports.registerWebViewProvider = registerWebViewProvider;
class SidebarWebViewProvider {
    constructor(_extensionUri, extensionContext) {
        this._extensionUri = _extensionUri;
        this.extensionContext = extensionContext;
    }
    resolveWebviewView(webviewView, webViewContext, token) {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((data) => __awaiter(this, void 0, void 0, function* () {
            switch (data.type) {
                case 'generate-tree': {
                    vscode_1.commands.executeCommand('rebot.showFileTree');
                    break;
                }
                case 'show-tree': {
                    vscode_1.commands.executeCommand('rebot.startRebot');
                    break;
                }
            }
        }));
    }
    _getHtmlForWebview(webview) {
        const styleResetUri = webview.asWebviewUri(vscode_1.Uri.joinPath(this._extensionUri, "assets", "css", "reset.css"));
        const scriptUri = webview.asWebviewUri(vscode_1.Uri.joinPath(this._extensionUri, "assets", "js", "rebot.js"));
        const styleVSCodeUri = webview.asWebviewUri(vscode_1.Uri.joinPath(this._extensionUri, "assets", "css", "vscode.css"));
        const nonce = (0, getNonce_1.getNonce)();
        return `<!DOCTYPE html>
        <html lang="en">
            <head>
              <meta charset="UTF-8">
              <!--
                 Use a content security policy to only allow loading images from https or from our extension directory,
                 and only allow scripts that have a specific nonce.
                 -->
              <meta http-equiv="Content-Security-Policy"
               content="
                 img-src ${webview.cspSource}
                 style-src ${webview.cspSource}
                 script-src 'nonce-${nonce}';">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <link href="${styleResetUri}" rel="stylesheet">
              <link href="${styleVSCodeUri}" rel="stylesheet">
              <script nonce="${nonce}"></script>
           </head>
           <body>
              <div>Rebot Actions:</div>
              <button type="button" class="generate-tree-data">Generate Files</button><br>
              <button type="button" class="show-tree-data">Start Rebot</button><br>
              <script nonce="${nonce}" src="${scriptUri}"></script>
           </body>
        </html>`;
    }
}
exports.SidebarWebViewProvider = SidebarWebViewProvider;
//# sourceMappingURL=sidepanel.js.map