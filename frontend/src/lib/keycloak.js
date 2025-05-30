import Keycloak from "keycloak-js";

let keycloakInstance = null;

const getKeycloakInstance = () => {
  if (typeof window !== "undefined" && !keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
    });
  }
  return keycloakInstance;
};

export default getKeycloakInstance;
