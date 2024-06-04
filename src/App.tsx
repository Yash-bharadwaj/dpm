import "./App.css";
import MainNavbar from "./components/MainNavbar";
import "bootstrap/dist/css/bootstrap.min.css";
import Routing from "./pages/Routing";

function App() {
  //   const browserHistory = createBrowserHistory();

  return (
    <div className="App">
      <MainNavbar />

      <Routing />
    </div>
  );
}

export default App;
