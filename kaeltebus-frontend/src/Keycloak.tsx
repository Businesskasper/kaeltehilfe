import Keycloak from "keycloak-js";
import React from "react";

export const useKeycloakSetup = () => {
  const keycloak = React.useMemo(
    () =>
      new Keycloak({
        url: "https://auth.lukaweis.de",
        realm: "drk",
        clientId: "kaeltebus",
      }),
    []
  );

  React.useEffect(() => {
    if (!keycloak) return;

    const refreshTokenInterval = 60000; // 1 minute

    // Initialize keycloak
    keycloak
      .init({
        onLoad: "check-sso", // Check if user is already authenticated
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        if (!authenticated) {
          keycloak.login(); // Force login if not authenticated
        } else {
          // Refresh the token right away if it's expired
          keycloak.updateToken(5).catch(() => {
            keycloak.login(); // Login again if the token refresh fails
          });
        }
      });

    // Set up the token refresh interval
    const intervalId = setInterval(() => {
      keycloak.updateToken(30).catch(() => {
        keycloak.login(); // If token refresh fails, redirect to login
      });
    }, refreshTokenInterval);

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, [keycloak]);

  return keycloak;
};

// import Keycloak from "keycloak-js";
// import React from "react";

// export const useKeycloakSetup = () => {
//   const keycloak = React.useMemo(
//     () =>
//       new Keycloak({
//         url: "https://auth.lukaweis.de",
//         realm: "drk",
//         clientId: "kaeltebus",
//       }),
//     []
//   );

//   React.useEffect(() => {
//     if (!keycloak) return;

//     keycloak.onReady = (isAuthenticated: boolean) => {
//       if (!isAuthenticated) keycloak.login();
//     };

//     // keycloak.onAuthSuccess = () =>
//     //   keycloak
//     //     .updateToken(5)
//     //     .then((a) => console.log("jo", a))
//     //     .catch((err) => console.log("no", err));

//     keycloak
//       .updateToken(6000)
//       .then((a) => {
//         console.log("refreshed", a);
//       })
//       .catch((err) => {
//         console.log("err", err);
//       });
//   }, [keycloak]);

//   // useInterval(() => {
//   //   keycloak.updateToken()
//   // }, 120)

//   return keycloak;
// };
