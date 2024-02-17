import React, { useCallback, useEffect } from "react";
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

const initialNodes = [
  {
    id: "1",
    type: "default",
    position: {
      x: 444,
      y: 0,
    },
    data: {
      label: "src",
    },
    targetPosition: "top",
    sourcePosition: "bottom",
  },
  {
    id: "1-2",
    type: "default",
    position: {
      x: 0,
      y: 86,
    },
    data: {
      label: "App.css",
    },
    targetPosition: "top",
    sourcePosition: "bottom",
  },
  {
    id: "1-3",
    type: "default",
    position: {
      x: 222,
      y: 86,
    },
    data: {
      label: "App.js",
    },
    targetPosition: "top",
    sourcePosition: "bottom",
  },
  {
    id: "1-4",
    type: "default",
    position: {
      x: 444,
      y: 86,
    },
    data: {
      label: "components",
    },
    targetPosition: "top",
    sourcePosition: "bottom",
  },
  {
    id: "1-4-5",
    type: "default",
    position: {
      x: 333,
      y: 172,
    },
    data: {
      label: "header.js",
    },
    targetPosition: "top",
    sourcePosition: "bottom",
  },
  {
    id: "1-4-6",
    type: "default",
    position: {
      x: 555,
      y: 172,
    },
    data: {
      label: "navbar.js",
    },
    targetPosition: "top",
    sourcePosition: "bottom",
  },
  {
    id: "1-7",
    type: "default",
    position: {
      x: 666,
      y: 86,
    },
    data: {
      label: "index.css",
    },
    targetPosition: "top",
    sourcePosition: "bottom",
  },
  {
    id: "1-8",
    type: "default",
    position: {
      x: 888,
      y: 86,
    },
    data: {
      label: "index.js",
    },
    targetPosition: "top",
    sourcePosition: "bottom",
  },
];

const initialEdges = [
  {
    id: "1-1-2",
    source: "1",
    target: "1-2",
  },
  {
    id: "1-1-3",
    source: "1",
    target: "1-3",
  },
  {
    id: "1-4-1-4-5",
    source: "1-4",
    target: "1-4-5",
  },
  {
    id: "1-4-1-4-6",
    source: "1-4",
    target: "1-4-6",
  },
  {
    id: "1-1-4",
    source: "1",
    target: "1-4",
  },
  {
    id: "1-1-7",
    source: "1",
    target: "1-7",
  },
  {
    id: "1-1-8",
    source: "1",
    target: "1-8",
  },
];
const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setEdges((prev) => {
      return prev.map((edge: any) => ({
        ...edge,
        type: "smoothstep", // Set edge type to SmoothStepEdgeType
        animated: true,
      }));
    })
  }, []);

  const onConnect = useCallback((params) => setEdges((els) => addEdge(params, els)), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView>
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
};

export default Flow;
