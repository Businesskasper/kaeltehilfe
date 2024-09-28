import {
  UserManager,
  UserManagerSettings,
  WebStorageStateStore,
} from "oidc-client-ts";

const userManagerProps: UserManagerSettings = {
  client_id: "kaeltebus",
  authority: "https://auth.lukaweis.de/realms/drk",
  redirect_uri: window.location.href,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

export const userManager = new UserManager(userManagerProps);
