import { memo } from "react";
import { Handle, Position } from "reactflow";
import { FaRegFileCode } from "react-icons/fa6";
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
                  height: "40px",
                  minwidth: "100px",
                  paddingInline: "20px",
                  border: "2px solid black",
                  borderRadius: "10px",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
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
