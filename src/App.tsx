import "./App.css";
import MainNavbar from "./components/MainNavbar";
import "bootstrap/dist/css/bootstrap.min.css";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Routing from "./pages/Routing";

function App() {
  return (
    <div className="App">
      <Router>
        <MainNavbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/config/:orgcode/:devicecode" element={<Routing />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
