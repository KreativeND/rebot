"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode_1 = require("vscode");
const HelloWorldPanel_1 = require("./panels/HelloWorldPanel");
const path = require("path");
const fs = require("fs");
const dagre = require("dagre");
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 172;
const nodeHeight = 36;
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });
    dagre.layout(dagreGraph);
    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';
        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
        return node;
    });
    return { nodes, edges };
};
function generateReactFlowData(fileTree) {
    const nodes = [];
    const edges = [];
    let nodeIdCounter = 1;
    const traverse = (node, parentId) => {
        const nodeId = parentId ? `${parentId}-${nodeIdCounter++}` : `${nodeIdCounter++}`;
        const newNode = {
            id: nodeId,
            type: 'default',
            position: { x: 0, y: 0 },
            data: { label: node.name, isDirectory: node.type === 'folder' } // Add isDirectory property
        };
        nodes.push(newNode);
        if (node.children) {
            node.children.forEach(child => {
                const childId = traverse(child, nodeId);
                edges.push({ id: `${nodeId}-${childId}`, source: nodeId, target: childId });
            });
        }
        return nodeId;
    };
    traverse(fileTree);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    return { layoutedNodes, layoutedEdges };
}
function findFolderInWorkspace(folderName) {
    const workspaceFolders = vscode_1.workspace.workspaceFolders;
    if (workspaceFolders) {
        for (const workspaceFolder of workspaceFolders) {
            const folderUri = vscode_1.Uri.joinPath(workspaceFolder.uri, folderName);
            if (fs.existsSync(folderUri.fsPath) && fs.statSync(folderUri.fsPath).isDirectory()) {
                return folderUri;
            }
        }
    }
    return undefined;
}
function getFileTree(uri) {
    const stats = fs.statSync(uri.fsPath);
    const fileNode = {
        name: path.basename(uri.fsPath),
        type: stats.isDirectory() ? "folder" : "file",
        path: uri.fsPath,
    };
    if (stats.isDirectory()) {
        const children = fs
            .readdirSync(uri.fsPath)
            .map((child) => getFileTree(vscode_1.Uri.file(path.join(uri.fsPath, child))));
        fileNode.children = children;
    }
    else {
        // fileNode.content = fs.readFileSync(uri.fsPath, "utf8");
    }
    return fileNode;
}
function createDirectoryIfNotExists(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }
}
function activate(context) {
    // Create the show hello world command
    const showHelloWorldCommand = vscode_1.commands.registerCommand("hello-world.showHelloWorld", () => {
        HelloWorldPanel_1.HelloWorldPanel.render(context.extensionUri);
    });
    // Add command to the extension context
    context.subscriptions.push(showHelloWorldCommand);
    let disposable = vscode_1.commands.registerCommand("hello-world.showFileTree", () => {
        var _a, _b;
        // Get the root path of the workspace
        // Find the folder in the workspace
        const folderUri = findFolderInWorkspace("src");
        const rootFolderPath = (_b = (_a = vscode_1.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.uri.fsPath;
        if (!rootFolderPath) {
            vscode_1.window.showErrorMessage("No workspace opened");
            return;
        }
        // Create metadata folder if it does not exist
        const metadataFolderPath = path.join(rootFolderPath, ".metadata");
        createDirectoryIfNotExists(metadataFolderPath);
        if (folderUri) {
            // Generate the file tree for the specific folder
            const folderTree = getFileTree(folderUri);
            // Convert file tree to JSON
            const jsonFolderTree = JSON.stringify(folderTree, null, 2);
            // Write JSON to a file in the folder directory
            const filePath = path.join(metadataFolderPath, "metadata.json");
            fs.writeFileSync(filePath, jsonFolderTree);
            // Generate React flow data
            const reactFlowData = generateReactFlowData(folderTree);
            // Convert React flow data to JSON
            const jsonFlowData = JSON.stringify(reactFlowData, null, 2);
            // Write JSON to a file in the metadata folder
            const flowDataPath = path.join(metadataFolderPath, "reactFlowData.json");
            fs.writeFileSync(flowDataPath, jsonFlowData);
            vscode_1.window.showInformationMessage(`Folder tree JSON saved to folderTree.json in ${"src"} folder.`);
        }
        else {
            vscode_1.window.showErrorMessage(`Folder "${"src"}" not found in workspace.`);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map