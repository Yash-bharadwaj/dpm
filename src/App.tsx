import "./App.css";
import MainNavbar from "./components/MainNavbar";
import "bootstrap/dist/css/bootstrap.min.css";
import Versions from "./pages/Versions";
import Breadcrumbs from "./components/BreadCrumbs";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Routing from "./pages/Routing";

function App() {
  return (
    <div className="App">
      <Router>
        <MainNavbar />
        <div style={{ marginTop:'5rem' , marginBottom:'0'}}> 
        <Breadcrumbs  /> 
        </div>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/config/:orgcode/:devicecode" element={<Routing />} />
          <Route path="/versions" element={<Versions />} /> 
        </Routes>

      </Router>
    </div>
  );
}

export default App;
