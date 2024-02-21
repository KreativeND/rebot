import { vscode } from '@/utilities/vscode'
import axios from 'axios'
import React from 'react'
import { LuRocket } from 'react-icons/lu'

const RefactorButton = ({ nodes }) => {

    const onClick = () => {
        vscode.postMessage({ command: "refactorStarted" });
        let fileNodes = nodes.filter((item) => !item.data.isDirectory);
        console.log("before refactor code", fileNodes);

        // Make the API calls concurrently using Promise.all
        vscode.postMessage({ command: "refactorCode", data: fileNodes });

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