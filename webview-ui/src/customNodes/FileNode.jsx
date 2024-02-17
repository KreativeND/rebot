import { memo } from "react";
import { Handle, Position } from "reactflow";
import { FaRegFileCode } from "react-icons/fa6";

const FileNode = memo(({ data }) => {
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
          cursor: "pointer"
        }}>
        <Handle
          type="target"
          position={Position.Top}
          onConnect={(params) => console.log("handle onConnect", params)}
        />
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaRegFileCode style={{ marginRight: "3px" }} />
          <strong>{data?.label}</strong>
        </div>
      </div>
    </>
  );
});

export default FileNode;
