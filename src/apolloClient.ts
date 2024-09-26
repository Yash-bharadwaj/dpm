import { ApolloClient, InMemoryCache, ApolloLink, HttpLink } from "@apollo/client";
import keycloak from './keycloak'; 

// Creating an ApolloLink instance to set authorization headers
const authLink = new ApolloLink((operation, forward) => {
    // Get the Keycloak token
    const token = keycloak.token;

    // Set the authorization header with the token
    operation.setContext(({ headers = {} }) => ({
        headers: {
            ...headers,
            authorization: token ? `${token}` : '', // Ensure the token format is correct
        },
    }));

    // Call the next link in the chain
    return forward(operation);
});

// Creating a new HTTP link
const httpLink = new HttpLink({
    uri: import.meta.env.VITE_REACT_APP_AWS_APPSYNC_GRAPHQLENDPOINT,
});

// Creating a new ApolloClient instance with the specified URI, cache configuration, and link setup
export const gqlClient = new ApolloClient({
    link: authLink.concat(httpLink), // Combining the authLink and httpLink using ApolloLink.concat
    cache: new InMemoryCache({
        addTypename: false, // Disabling automatic adding of "__typename" fields in cache
    }),
});
