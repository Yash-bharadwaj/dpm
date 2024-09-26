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

AuthorizedApolloProvider.propTypes = {
  children: PropTypes.node,
};

export default function AuthorizedApolloProvider(props) {
  const { token } = useParams();

  const [authToken, setAuthToken] = useState(token);
  const [refreshTokenExpiresAt, setRefreshTokenExpiresAt] = useState(null);

  const url = import.meta.env.VITE_REACT_APP_AWS_APPSYNC_GRAPHQLENDPOINT;
  const region = import.meta.env.VITE_REACT_APP_AWS_APPSYNC_REGION;

  const auth = {
    type: AUTH_TYPE.OPENID_CONNECT,
    jwtToken: authToken,
  };

  const link = ApolloLink.from([
    awsCreateAuthLink({ url, region, auth }),

    createHttpLink({ uri: url }),
  ]);

  const client = new ApolloClient({
    link,

    connectToDevTools: false,

    cache: new InMemoryCache({
      typePolicies: {
        // qquery: {
        //   fields: {
        //     getLogs: offsetLimitPagination(),
        //   },
        // },
        gquery: {
          fields: {
            productsByGroupID: offsetLimitPagination(),
          },
        },
      },
    }),
  });

  useEffect(() => {
    if (!authToken) {
      if (!keycloak.didInitialize) {
        keycloak
          .init({
            onLoad: "login-required",
            checkLoginIframe: false,
          })
          .then(
            (auth) => {
              if (!auth) {
                window.location.reload();
              } else {
                setAuthToken(keycloak.token);

                const refreshToken = keycloak.refreshTokenParsed;
                if (refreshToken && refreshToken.exp) {
                  setRefreshTokenExpiresAt(refreshToken.exp * 1000);
                }

                keycloak.onTokenExpired = () => {
                  keycloak.updateToken(30).catch(() => {
                    window.alert("Session expired. Please refresh the page.");
                    keycloak.logout();
                  });
                };

                const refreshTokenInterval = setInterval(() => {
                  keycloak
                    .updateToken(30)
                    .then((refreshed) => {
                      if (refreshed) {
                        setAuthToken(keycloak.token);
                      }
                    })
                    .catch(() => {
                      clearInterval(refreshTokenInterval);
                      window.alert("Session expired. Please refresh the page.");
                      keycloak.logout();
                    });
                }, 60000); // Check every 60 seconds

                return () => clearInterval(refreshTokenInterval);
              }
            },
            () => {
              console.log("Authentication Failed");
            }
          );
      }
    }
  }, [authToken]);

  useEffect(() => {
    if (refreshTokenExpiresAt) {
      const refreshTokenTimeout = refreshTokenExpiresAt - new Date().getTime();

      const timeoutId = setTimeout(() => {
        window.alert("Your session has expired. Please log in again.");
        keycloak.logout();
      }, refreshTokenTimeout);

      return () => clearTimeout(timeoutId);
    }
  }, [refreshTokenExpiresAt]);

  if (authToken !== null && authToken !== undefined) {
    // if (import.meta.env.VITE_REACT_APP_ENV === "development") {
    //   console.log("auth", authToken);
    // }

    return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
  }

  return <MainLoading />;
}
