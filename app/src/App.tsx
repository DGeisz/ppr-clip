import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./routes/landing/landing";
import Editor from "./routes/editor/editor";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/editor" element={<Editor />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
