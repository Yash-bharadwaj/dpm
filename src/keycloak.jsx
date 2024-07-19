import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_REACT_APP_BLUSAPPHIRE_KEYCLOAK_DOMAIN,
  realm: import.meta.env.VITE_REACT_APP_BLUSAPPHIRE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_REACT_APP_BLUSAPPHIRE_KEYCLOAK_CLIENT_ID,
  credentials: {
    secret: "FDIMTgY1txbSg7l99ZcryQHudgMSB2jC",
  },
});

export default keycloak;
