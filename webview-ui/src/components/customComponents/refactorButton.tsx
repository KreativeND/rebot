import { vscode } from '@/utilities/vscode'
import React from 'react'
import { LuRocket } from 'react-icons/lu'

const RefactorButton = ({ nodes }) => {

    const onClick = () => {
        vscode.postMessage({ command: "refactorStarted"});
        let fileNodes = nodes.filter((item: { data: { isDirectory: any } }) => !item.data.isDirectory);
        console.log("before refactor code", fileNodes);
        fileNodes = fileNodes.map((element: any) => {
            const refactoredText = element.metadata.content + "\n/* Code Refactored by Rebot */";
            console.log(refactoredText);
            return element = { ...element, metadata: { ...element.metadata, refactoredcontent: refactoredText}}
        });
        console.log("refactored code", fileNodes);
        vscode.postMessage({ command: "refactorCode", data: fileNodes});
    }
    return (
        <div>
            <button onClick={onClick} className="Btn">
                <div className="sign">
                    <LuRocket size="40px" />
                </div>
                <div className="text">Refactor</div>
            </button>
        </div>
    )
}

export default RefactorButton;