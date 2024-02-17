import { workspace, window } from "vscode";
import * as path from "path";
import * as fs from "fs";

export const getNodesAndEdges = () => {
    let reactFlowData = { nodes: [], edges: []}
    const rootPath = workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!rootPath) {
            window.showErrorMessage('No workspace opened');
            return;
        }

        // Construct the path to the reactFlowData.json file
        const jsonFilePath = path.join(rootPath, 'metadata', 'reactFlowData.json');

        // Check if the file exists
        if (fs.existsSync(jsonFilePath)) {
            // Read the file
            fs.readFile(jsonFilePath, 'utf8', (err, data) => {
                if (err) {
                    window.showErrorMessage('Error reading JSON file');
                    return;
                }

                try {
                    reactFlowData = JSON.parse(data);
                    console.log(reactFlowData);
                    // Use reactFlowData in your React component
                } catch (error) {
                    window.showErrorMessage('Error parsing JSON data');
                }
            });
        } else {
            window.showErrorMessage('reactFlowData.json file not found');
        }
        // return reactFlowData;
}