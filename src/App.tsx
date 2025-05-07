import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import MainNavbar from "./components/MainNavbar";
import Home from "./pages/Home";
import Routing from "./pages/Routing";
import Versions from "./pages/Versions";
import { DeviceProvider } from "./utils/DeviceContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./components/common/Loader";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading for demonstration purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Loader
        isFullPage={true}
        size="lg"
        variant="spinner"
        text="Loading application..."
      />
    );
  }

  return (
    <DeviceProvider>
      <div className="app-container fade-in">
        <Router>
          <MainNavbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/routing" element={<Routing />} />
              <Route path="/versions" element={<Versions />} />
            </Routes>
          </div>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </DeviceProvider>
  );
}

export default App;
