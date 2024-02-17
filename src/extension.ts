import { commands, ExtensionContext, FileStat, window, Uri, workspace } from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import * as path from "path";
import * as fs from "fs";
import * as dagre from 'dagre';

interface FileNode {
  name: string;
  type: string;
  path: string;
  children?: FileNode[];
  content?: string;
}

interface Node {
  id: string;
  type: string;
  data?: any;
  position?: { x: number, y: number};
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  data?: any;
}



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


function generateReactFlowData(fileTree: FileNode): { layoutedNodes: Node[], layoutedEdges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let nodeIdCounter = 1;

  const traverse = (node: FileNode, parentId?: string) => {
      const nodeId = parentId ? `${parentId}-${nodeIdCounter++}` : `${nodeIdCounter++}`;
      const newNode: Node = { 
        id: nodeId,
        type: 'default', // Set type to 'default'
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

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    nodes,
    edges
  );

  return { layoutedNodes, layoutedEdges };
}

function findFolderInWorkspace(folderName: string): Uri | undefined {
  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders) {
    for (const workspaceFolder of workspaceFolders) {
      const folderUri = Uri.joinPath(workspaceFolder.uri, folderName);
      if (fs.existsSync(folderUri.fsPath) && fs.statSync(folderUri.fsPath).isDirectory()) {
        return folderUri;
      }
    }
  }
  return undefined;
}

function getFileTree(uri: Uri): FileNode {
  const stats = fs.statSync(uri.fsPath);

  const fileNode: FileNode = {
    name: path.basename(uri.fsPath),
    type: stats.isDirectory() ? "folder" : "file",
    path: uri.fsPath,
  };

  if (stats.isDirectory()) {
    const children = fs
      .readdirSync(uri.fsPath)
      .map((child) => getFileTree(Uri.file(path.join(uri.fsPath, child))));
    fileNode.children = children;
  } else {
    // fileNode.content = fs.readFileSync(uri.fsPath, "utf8");
  }

  return fileNode;
}

function createDirectoryIfNotExists(directoryPath: string): void {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }
}

export function activate(context: ExtensionContext) {
  // Create the show hello world command
  const showHelloWorldCommand = commands.registerCommand("hello-world.showHelloWorld", () => {
    HelloWorldPanel.render(context.extensionUri);
  });

  // Add command to the extension context
  context.subscriptions.push(showHelloWorldCommand);

  let disposable = commands.registerCommand("hello-world.showFileTree", () => {
    // Get the root path of the workspace
    // Find the folder in the workspace
    const folderUri = findFolderInWorkspace("src");
    const rootFolderPath = workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!rootFolderPath) {
      window.showErrorMessage("No workspace opened");
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

      window.showInformationMessage(
        `Folder tree JSON saved to folderTree.json in ${"src"} folder.`
      );
    } else {
      window.showErrorMessage(`Folder "${"src"}" not found in workspace.`);
    }
  });

  context.subscriptions.push(disposable);
}
