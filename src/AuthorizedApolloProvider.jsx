import { useState, useEffect } from "react";
import keycloak from "./keycloak";
import { useParams } from "react-router-dom";

import { PropTypes } from "prop-types";

import {
  ApolloProvider,
  ApolloLink,
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";

import { offsetLimitPagination } from "@apollo/client/utilities";

import {
  AUTH_TYPE,
  createAuthLink as awsCreateAuthLink,
} from "aws-appsync-auth-link";
import MainLoading from "./components/MainLoading";

// Import our mock link for development
import { mockLink } from "./utils/mockLink";

// Dummy token for development
const DUMMY_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikphc3dhbnRoIiwiZW1haWwiOiJqYXN3YW50aEBibHVzYXBwaGlyZS5jb20iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

AuthorizedApolloProvider.propTypes = {
  children: PropTypes.node,
};

export default function AuthorizedApolloProvider(props) {
  const { token } = useParams();

  // For development, use the dummy token
  const [authToken, setAuthToken] = useState(DUMMY_TOKEN);
  const [refreshTokenExpiresAt, setRefreshTokenExpiresAt] = useState(null);

  const url = import.meta.env.VITE_REACT_APP_AWS_APPSYNC_GRAPHQLENDPOINT;
  const region = import.meta.env.VITE_REACT_APP_AWS_APPSYNC_REGION;

  const auth = {
    type: AUTH_TYPE.OPENID_CONNECT,
    jwtToken: authToken,
  };

  // Use mockLink for development
  const client = new ApolloClient({
    link: mockLink,
    connectToDevTools: import.meta.env.DEV,
    cache: new InMemoryCache({
      typePolicies: {
        gquery: {
          fields: {
            productsByGroupID: offsetLimitPagination(),
          },
        },
      },
    }),
  });

  // Skip the authentication process in development
  useEffect(() => {
    console.log("Using development mode with mock data");
  }, []);

  // Always render the children
  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
}
