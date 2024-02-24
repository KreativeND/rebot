import { memo } from "react";
import { Handle, Position } from "reactflow";
import { CiFileOn } from "react-icons/ci";
 import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const FileNode = memo(({ data }) => {
  const vscodeForeground = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--vscode-foreground");
  return (
    <>
      <Sheet>
        <SheetTrigger>
          <HoverCard style={{ backgroundColor: "var(--vscode-button-background)" }}>
            <HoverCardTrigger>
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
                }}>
                <Handle
                  type="target"
                  position={Position.Top}
                  onConnect={(params) => console.log("handle onConnect", params)}
                />
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CiFileOn style={{ marginRight: "3px" }} size={"70px"} />
                  <div><p style={{ fontSize: "18px" }}>{data.label}</p></div>
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="bg-slate-900">
              The React Framework – created and maintained by @vercel.
            </HoverCardContent>
          </HoverCard>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{data?.label}</SheetTitle>
            <SheetDescription>
              This action cannot be undone. This will permanently delete your account and remove
              your data from our servers.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  );
});

export default FileNode;
