import { vscode } from '@/utilities/vscode'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { LuRocket } from 'react-icons/lu'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import RefactorPanel from './refactorPanel'

const RefactorButton = ({ nodes, setLoading }) => {

    const [fileNodes, setFileNodes] = useState(nodes.filter((item) => !item.data.isDirectory))
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
            setFileNodes(refactoredNodes);
            console.log("refactored code", fileNodes);
            vscode.postMessage({ command: "refactorCode", data: fileNodes });
        });

    }

    return (
        <div>
            <Sheet>
                <SheetTrigger>

                    <button className="Btn">
                        <div className="sign">
                            <LuRocket size="40px" />
                        </div>
                        <div className="text">Refactor</div>
                    </button>
                </SheetTrigger>
                <RefactorPanel fileNodes={fileNodes}/>
            </Sheet>
        </div>
    )
}

export default RefactorButton;