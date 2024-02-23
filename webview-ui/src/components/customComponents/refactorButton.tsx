import { vscode } from '@/utilities/vscode'
import axios from 'axios'
import React, { useEffect } from 'react'
import { LuRocket } from 'react-icons/lu'

const RefactorButton = ({ nodes, setLoading }) => {

    const onClick = () => {
        // vscode.postMessage({ command: "refactorStarted" });
        // let fileNodes = nodes.filter((item) => !item.data.isDirectory);
        // console.log("before refactor code", fileNodes);

        // // Make the API calls concurrently using Promise.all
        // vscode.postMessage({ command: "refactorCode", data: fileNodes });
        setLoading(true);

        // vscode.postMessage({ command: "refactorStarted" });
        let fileNodes = nodes.filter((item) => !item.data.isDirectory);
        console.log("before refactor code", fileNodes);

        // Make the API calls concurrently using Promise.all
        Promise.all(fileNodes.map((element) => {

            return axios.post("http://127.0.0.1:8000/refactor-code", {
                code: element.metadata.content
            }).then((res) => {
                const refactoredText = res.data.refactor_code;
                return { ...element, metadata: { ...element.metadata, refactoredcontent: refactoredText } };
            });
        })).then((refactoredNodes) => {
            fileNodes = refactoredNodes;
            console.log("refactored code", fileNodes);
            vscode.postMessage({ command: "refactorCode", data: fileNodes });
        });

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