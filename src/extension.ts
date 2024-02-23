import { commands, ExtensionContext, FileStat, window, Uri, workspace, extensions, languages, DiagnosticSeverity } from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import * as path from "path";
import * as fs from "fs";
import * as dagre from "dagre";
import { registerWebViewProvider } from "./panels/sidepanel";

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
  metadata?: {
    path: string;
    content?: string;
    relativePath?: string; // Add relativePath field
  };
  position?: { x: number; y: number };
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

const nodeWidth = 300;
const nodeHeight = 200;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const isHorizontal = direction === "LR";
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
    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";

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

interface Problem {
  line: number;
  message: string;
  severity: DiagnosticSeverity;
}


async function getProblemsForFile(filePath: string): Promise<Problem[]> {
  const document = await workspace.openTextDocument(filePath);
  const diagnostics = languages.getDiagnostics(document.uri);
  const problems: Problem[] = diagnostics.map(diagnostic => {
    return {
      line: diagnostic.range.start.line,
      message: diagnostic.message,
      severity: diagnostic.severity || DiagnosticSeverity.Error
    };
  });
  return problems;
}

async function generateReactFlowData(fileTree: FileNode): Promise<{
  layoutedNodes: Node[];
  layoutedEdges: Edge[];
}> {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let nodeIdCounter = 1;

  // Get the current workspace folder
  const workspaceFolders = workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    throw new Error("No workspace is opened.");
  }
  const workspaceFolder = workspaceFolders[0]; // Assuming only one workspace is opened
  const workspaceUri = workspaceFolder.uri;
  const workspacePath = workspaceUri.fsPath;

  const traverse = (node: FileNode, parentId?: string, parentPath?: string) => {
    const nodeId = parentId ? `${parentId}-${nodeIdCounter++}` : `${nodeIdCounter++}`;
    const absolutePath = path.join(parentPath || "", node.name);
    const relativePath = path.relative(workspacePath, absolutePath);

    // Ensure relative path does not contain the workspace directory
    const relativePathWithoutWorkspace = relativePath.startsWith("..")
      ? relativePath
      : `./${relativePath}`;
    const newNode: Node = {
      id: nodeId,
      type: node.type === "folder" ? "FolderNode" : "FileNode",
      position: { x: 0, y: 0 },
      data: { label: node.name, isDirectory: node.type === "folder" },
      metadata: {
        path: absolutePath,
        content: node.content,
        relativePath: relativePathWithoutWorkspace,
      }, // Populate metadata
    };

    nodes.push(newNode);

    if (node.children) {
      node.children.forEach((child) => {
        const childId = traverse(child, nodeId, absolutePath);
        edges.push({ id: `${nodeId}-${childId}`, source: nodeId, target: childId });
      });
    }

    return nodeId;
  };

  traverse(fileTree);

  let { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);

  layoutedEdges = layoutedEdges.map((edge: any) => ({
    ...edge,
    type: "smoothstep", // Set edge type to SmoothStepEdgeType
    animated: true,
    style: { strokeWidth: 2 },
  }));

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
    fileNode.content = fs.readFileSync(uri.fsPath, "utf8");
  }

  return fileNode;
}

function createDirectoryIfNotExists(directoryPath: string): void {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }
}

export async function readJsonFileAtRoot(fileName) {
  const workspaceFolders = workspace.workspaceFolders;
  if (!workspaceFolders) {
    window.showErrorMessage("No workspace folders are opened.");
    return;
  }

  // Get the first workspace folder (assuming there's only one)
  const rootUri = workspaceFolders[0].uri;

  // Construct the URI of the JSON file
  const fileUri = Uri.joinPath(rootUri, "/.metadata", fileName);

  try {
    // Read the file contents
    const fileContents = await workspace.fs.readFile(fileUri);
    // Convert the file contents buffer to string
    const fileContentsString = Buffer.from(fileContents).toString("utf-8");
    // Parse the JSON string into an object
    const jsonData = JSON.parse(fileContentsString);
    return jsonData;
  } catch (error) {
    window.showErrorMessage(`Failed to read JSON file: ${error.message}`);
  }
}

export function activate(context: ExtensionContext) {
  const op = window.createOutputChannel('ReBOT');
  registerWebViewProvider(context, op);
  let reactFlowData: any = null;

  // Create the show hello world command
  const showHelloWorldCommand = commands.registerCommand("rebot.startRebot", () => {
    const fileName = "reactFlowData.json"; // Specify the name of the JSON file you want to read

    readJsonFileAtRoot(fileName).then((data) => {
      if (data) {
        console.log(data); // Do something with the JSON data
        HelloWorldPanel.render(context.extensionUri);
        HelloWorldPanel.currentPanel.sendDataToWebview(data);
      }
    });
  });

  // Add command to the extension context
  context.subscriptions.push(showHelloWorldCommand);

  let activityBarDisposable = commands.registerCommand("rebot.showHelloWorldPanel", () => {
    const fileName = "reactFlowData.json"; // Specify the name of the JSON file you want to read

    readJsonFileAtRoot(fileName).then((data) => {
      if (data) {
        console.log(data); // Do something with the JSON data
        HelloWorldPanel.render(context.extensionUri);
        HelloWorldPanel.currentPanel.sendDataToWebview(data);
      }
    });
  });
  context.subscriptions.push(activityBarDisposable);

  let disposable = commands.registerCommand("rebot.showFileTree", async (rootFolder = 'src') => {
    // Get the root path of the workspace
    // Find the folder in the workspace
    const folderUri = findFolderInWorkspace(rootFolder);
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
      reactFlowData = await generateReactFlowData(folderTree);
      // Convert React flow data to JSON
      const jsonFlowData = JSON.stringify(reactFlowData, null, 2);

      // Write JSON to a file in the metadata folder
      const flowDataPath = path.join(metadataFolderPath, "reactFlowData.json");
      fs.writeFileSync(flowDataPath, jsonFlowData);

      window.showInformationMessage(
        `Folder tree JSON saved to folderTree.json in ${rootFolder} folder.`
      );
      commands.executeCommand('rebot.startRebot');
    } else {
      window.showErrorMessage(`Folder "${rootFolder}" not found in workspace.`);
    }
  });

  context.subscriptions.push(disposable);
}
