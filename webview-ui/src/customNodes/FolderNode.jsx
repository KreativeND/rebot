import { memo } from "react";
import { Handle, Position } from "reactflow";
import { FaRegFolder } from "react-icons/fa";

const FolderNode = memo(({ data }) => {
  return (
    <>
      <div
        style={{
          backgroundColor: "var(--vscode-button-background)",
          height: "40px",
          minwidth: "100px",
          paddingInline: "20px",
          border: "2px solid black",
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          position: "relative",
        }}>
        <Handle type="target" position={Position.Top} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaRegFolder style={{ marginRight: "3px" }} />
          <strong>{data?.label}</strong>
        </div>
        <Handle type="source" position={Position.Bottom} id="a" />
      </div>
    </>
  );
});

export default FolderNode;
