import { CancellationToken, commands, ExtensionContext, OutputChannel, ProgressLocation, Uri, Webview, WebviewView, WebviewViewProvider, WebviewViewResolveContext, window, workspace } from "vscode";
import { getNonce } from "../utilities/getNonce";
import * as fs from 'fs';
import * as path from 'path';

export function registerWebViewProvider(context: ExtensionContext, op: OutputChannel) {
    const provider = new SidebarWebViewProvider(context.extensionUri, context);
    context.subscriptions.push(window.registerWebviewViewProvider('left-panel-webview', provider));
}

export class SidebarWebViewProvider implements WebviewViewProvider {
    constructor(private readonly _extensionUri: Uri, public extensionContext: ExtensionContext) { }
    view?: WebviewView;

    resolveWebviewView(webviewView: WebviewView,
        webViewContext: WebviewViewResolveContext,
        token: CancellationToken) {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,

            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'generate-tree': {
                    console.log("folder changed", data.folderPath);
                    commands.executeCommand('rebot.showFileTree', data.folderPath);
                    break;
                }
                case 'show-tree': {
                    commands.executeCommand('rebot.startRebot');
                    break;
                }
                case "noFolderSelected":
                {
                    window.showInformationMessage("Please Select a Folder");
                    break;
                }
            }
        });
    }

    private getAllFoldersInWorkspace(excludeFolders: string[]): string[] {
        const folderNames: string[] = [];

        // Retrieve the current workspace folder
        const workspaceFolders = workspace.workspaceFolders;
        if (!workspaceFolders) {
            return folderNames; // No workspace opened
        }

        // Include root workspace folder
        workspaceFolders.forEach(workspaceFolder => {
            const workspacePath = workspaceFolder.uri.fsPath;
            const rootFolderName = path.basename(workspacePath);
            folderNames.push(rootFolderName);
            traverseDirectory(workspacePath);
        });

        // Recursive function to traverse directories
        function traverseDirectory(dirPath: string) {
            const files = fs.readdirSync(dirPath);
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    if (!excludeFolders.includes(file)) { // Check if folder is not in exclude list
                        folderNames.push(file); // Add folder name to the list
                        traverseDirectory(filePath); // Continue traversing subdirectories
                    }
                }
            }
        }

        return folderNames;
    }

    excludedFolders = ['node_modules', 'dist'];
    folders = this.getAllFoldersInWorkspace(this.excludedFolders);

    // Map folders to option elements
    folderOptions = this.folders.map(folder => {
        return `<option value="${folder}">${folder}</option>`;
    }).join('');

    private _getHtmlForWebview(webview: Webview) {
        const styleResetUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, "assets", "css", "reset.css"));
        const scriptUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, "assets", "js", "rebot.js"));
        const styleVSCodeUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, "assets", "css", "vscode.css"));

        const nonce = getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <!-- Use a content security policy to only allow loading images from https or from our extension directory,
                     and only allow scripts that have a specific nonce. -->
                <meta http-equiv="Content-Security-Policy"
                    content="img-src ${webview.cspSource} style-src ${webview.cspSource} script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }

                    h2 {
                        margin-bottom: 20px;
                    }

                    label {
                        font-size: 16px;
                        margin-bottom: 10px;
                        display: block;
                    }

                    select {
                        font-size: 16px;
                        padding: 8px;
                        width: 100%;
                        margin-bottom: 20px;
                    }

                    button {
                        padding: 10px 20px;
                        font-size: 16px;
                        cursor: pointer;
                    }

                    .generate-tree-data {
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                    }

                    .show-tree-data {
                        background-color: #008CBA;
                        color: white;
                        border: none;
                    }
                </style>
            </head>
            <body>
                <h2>Rebot:</h2>
                <label for="folder-select">Select a folder:</label>
                <select id="folder-select">
                    <option value="">-- Select Folder --</option>
                    ${this.folderOptions}
                </select>
                <button type="button" class="generate-tree-data">Generate Files</button><br>
                <button type="button" class="show-tree-data">Start Rebot</button><br>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
        </html>`;
    }
}
