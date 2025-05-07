import Keycloak from "keycloak-js";

// Hard-coded credentials for development
const hardcodedUsername = "jaswanth@blusapphire.com";
const hardcodedPassword = "su7@H9Vq1";

// Create the Keycloak instance
const keycloak = new Keycloak({
  url: import.meta.env.VITE_REACT_APP_BLUSAPPHIRE_KEYCLOAK_DOMAIN,
  realm: import.meta.env.VITE_REACT_APP_BLUSAPPHIRE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_REACT_APP_BLUSAPPHIRE_KEYCLOAK_CLIENT_ID,
  credentials: {
    secret: "FDIMTgY1txbSg7l99ZcryQHudgMSB2jC",
  },
});

// Extend the keycloak object with credentials
keycloak.login = async function(options) {
  console.log("Logging in with hardcoded credentials:", hardcodedUsername);
  try {
    // Use original login but with the hardcoded credentials
    return this.originalLogin({
      ...options,
      username: hardcodedUsername,
      password: hardcodedPassword,
      loginHint: hardcodedUsername
    });
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

// Store the original login function
keycloak.originalLogin = keycloak.login;

export default keycloak;
