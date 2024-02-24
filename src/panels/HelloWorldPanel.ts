import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn, workspace, ProgressLocation } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { readJsonFileAtRoot } from "../extension";
import * as fs from "fs";
const path = require('path');

export class HelloWorldPanel {
  public static currentPanel: HelloWorldPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

    this._setWebviewMessageListener(this._panel.webview);
  }

  public static render(extensionUri: Uri) {
    if (HelloWorldPanel.currentPanel) {
      HelloWorldPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      const panel = window.createWebviewPanel(
        "startRebot",
        "REBOT",
        ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            Uri.joinPath(extensionUri, "out"),
            Uri.joinPath(extensionUri, "webview-ui/build"),
          ],
        }
      );

      HelloWorldPanel.currentPanel = new HelloWorldPanel(panel, extensionUri);
    }
  }

  public dispose() {
    HelloWorldPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }


  public sendDataToWebview(data: any) {
    if (this._panel) {
      this._panel.webview.postMessage({ command: "sendDataToExtension", payload: data });
    }
  }

  public refactorDone() {
    if (this._panel) {
      this._panel.webview.postMessage({ command: "refactorDone" });
    }
  }

  public refactorCode(data: any) {
    // window.showInformationMessage(`Refactoring ${data.filename}`);
    const rootFolderPath = workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!rootFolderPath) {
      window.showErrorMessage("No workspace opened");
      return;
    }

    window.showInformationMessage("ReBot Start working on refactoring your code 🚀");
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
      } else {
        window.showErrorMessage(`Folder "${file.data.label}" not found in workspace.`);
        isError = true;
      }

      completedCount++; // Increment completed count

      // Check if all iterations are completed
      if (completedCount === totalCount && !isError) {
        window.showInformationMessage(`Refactoring done 👍`);
        this.refactorDone();
      }
    });
  }


  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.css"]);
    const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.js"]);

    const nonce = getNonce();

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

  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const payload = message.payload;

        switch (command) {
          case "hello":
            window.showInformationMessage(payload);
            return;
          case "sendDataToExtension":
            console.log('Received data from webview:', payload);
            // Perform actions with the received data here
            return;
          case "getReactflowData":
            const fileName = "reactFlowData.json"; // Specify the name of the JSON file you want to read

            readJsonFileAtRoot(fileName).then((data) => {
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
            window.showInformationMessage("ReBot Start working on refactor your code 🚀");
            return;
          
        }
      },
      undefined,
      this._disposables
    );
  }
}
