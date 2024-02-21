import { useEffect } from "react";
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/base.css";
import FolderNode from "./customNodes/FolderNode";
import FileNode from "./customNodes/FileNode";
import { vscode } from "./utilities/vscode";
import RefactorButton from "./components/customComponents/refactorButton";

const nodeTypes = {
  FolderNode: FolderNode,
  FileNode: FileNode,
};

let initialNodes = [];

let initialEdges = [];

const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    vscode.postMessage({ command: "getReactflowData" });
  }, [])
  

  useEffect(() => {
    console.log("asdasdasgyudgausgdufyuasgdyuasgudgfuaysdgausd");
    const messageListener = (event) => {
      const message = event.data;
      // Handle messages from the extension
      switch (message.command) {
        case "sendDataToExtension":
          // Handle the received data from the extension
          console.log("Received data from extension:", message.payload);
          initialNodes = message.payload?.layoutedNodes;
          initialEdges = message.payload?.layoutedEdges;
          console.log("nodes:", initialNodes);
          setNodes((nodes) => initialNodes);
          setEdges((prev) => initialEdges);
          console.log("edges:", initialEdges);
          // Update nodes based on the received data
          break;
        // Add more cases for different commands if needed
        default:
          break;
      }
    };

    // Add event listener for messages from the extension
    window.addEventListener("message", messageListener);

    // Clean up event listener
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, []);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <ReactFlow
        style={{ height: "100%", width: "100vw" }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView>
        <Background />
        {/* <Controls /> */}
      </ReactFlow>
      <div
        style={{
          position: "absolute",
          zIndex: "1000",
          width: "100%",
          bottom: "20px",
          display: "flex",
          justifyContent: "center",
        }}>
        <RefactorButton nodes= {nodes}/>
      </div>
    </div>
  );
};

export default Flow;
