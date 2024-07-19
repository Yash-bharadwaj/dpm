import "./App.css";
import MainNavbar from "./components/MainNavbar";
import "bootstrap/dist/css/bootstrap.min.css";

import { createBrowserHistory } from "history";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Routing from "./pages/Routing";

function App() {
  const browserHistory = createBrowserHistory();

  return (
    <div className="App">
      <Router history={browserHistory}>
        <MainNavbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/config" element={<Routing />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
