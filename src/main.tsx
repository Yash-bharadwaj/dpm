import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import AuthorizedApolloProvider from "./AuthorizedApolloProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthorizedApolloProvider>
      <App />
    </AuthorizedApolloProvider>
  </React.StrictMode>
);
