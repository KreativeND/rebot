import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Position,
} from "reactflow";
import "reactflow/dist/base.css";
import FolderNode from "./customNodes/FolderNode";
import FileNode from "./customNodes/FileNode";
import { LuRocket } from "react-icons/lu";

const nodeTypes = {
  FolderNode: FolderNode,
  FileNode: FileNode,
};

let initialNodes = [];

let initialEdges = [];

const Flow = () => {
  const vscodeForeground = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--vscode-foreground");
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
          setEdges((prev) => {
            return initialEdges.map((edge: any) => ({
              ...edge,
              type: "smoothstep", // Set edge type to SmoothStepEdgeType
              animated: true,
              style: { strokeWidth: 2 },
            }));
          });
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
        style={{ height: "100%", width: "100%" }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView>
        {/* <Background color={vscodeForeground}/> */}
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
        {/* <input
          style={{
            backgroundColor: "var(--vscode-button-background)",
            cursor: "pointer",
            border: "2px solid black",
            borderRadius: "10px",
            paddingInline: "20px",
          }}
          type="button"
          value="🚀 Refactor"
        /> */}
        <button className="Btn">
          <div className="sign">
            <LuRocket size="40px"/>
          </div>

          <div className="text">Refactor</div>
        </button>
      </div>
    </div>
  );
};

export default Flow;
