import { memo } from "react";
import { Handle, Position } from "reactflow";
import { CiFolderOn } from "react-icons/ci";

const FolderNode = memo(({ data }) => {
  return (
    <>
      <div
        style={{
          backgroundColor: "var(--vscode-button-background)",
          height: "100px",
          width: "200px",
          paddingInline: "10px",
          border: "2px solid black",
          borderRadius: "10px",
          display: "flex",
          cursor: "pointer",
          position: "relative",
        }}>
        <Handle type="target" position={Position.Top} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <CiFolderOn style={{ marginRight: "3px" }} size={"70px"}/>
          <div><p style={{ fontSize: "18px" }}>{data.label}</p></div>
        </div>
        <Handle type="source" position={Position.Bottom} id="a" />
      </div>
    </>
  );
});

export default FolderNode;
