import { vscode } from "./utilities/vscode";
import "./App.css";
import Flow from "./flow";

function App() {
  function handleHowdyClick() {
    vscode.postMessage({
      command: "hello",
      text: "Hey there partner! 🤠",
    });
  }

  return (
    <main style={{height: "100vh"}}>
      <Flow />
    </main>
  );
}

export default App;
