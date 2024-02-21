(function () {
    const vscode = acquireVsCodeApi();

    const generateTree = document.querySelector('.generate-tree-data');
    const showTree = document.querySelector('.show-tree-data');
    const folderSelect = document.getElementById('folder-select');


    generateTree.addEventListener('click', generateTreeBtnClicked);
    showTree.addEventListener('click', showTreeBtnClicked);
    folderSelect.addEventListener('change', handleFolderSelection);

    function generateTreeBtnClicked() {
        vscode.postMessage({
            type: 'generate-tree',
            value: 'generate-tree-data clicked'
        });
    }

    function showTreeBtnClicked() {
        vscode.postMessage({
            type: 'show-tree',
            value: 'show-tree-data clicked'
        });
    }

    function handleFolderSelection(event) {
        const folderPath = event.target.value;
        console.log(folderPath);
        vscode.postMessage({
          type: 'generate-tree',
          folderPath: folderPath
        });
      }

    window.addEventListener("message", async (event) => {
        const message = event.data;
        switch (message.type) {
            case "transferDataFromTsToUi":
                txtbox.value = message.data;
                break;
        }
    });

}());