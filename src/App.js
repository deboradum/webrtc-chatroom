import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Host from "./components/Host";
import Client from "./components/Client";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/host" element={<Host />} />
                <Route path="/client" element={<Client />} />
            </Routes>
        </Router>
    );
}

export default App;
