import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { gqlClient } from './apolloClient.ts';
// import { ApolloProvider } from "@apollo/client";
import AuthorizedApolloProvider from "./AuthorizedApolloProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  
    <AuthorizedApolloProvider client={gqlClient}> 
      <App />
    </AuthorizedApolloProvider>
 
);
