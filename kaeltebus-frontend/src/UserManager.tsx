import {
  UserManager,
  UserManagerSettings,
  WebStorageStateStore,
} from "oidc-client-ts";

const { VITE_IDP_AUTHORITY } = import.meta.env;

const userManagerProps: UserManagerSettings = {
  client_id: "kaeltebus",
  authority: VITE_IDP_AUTHORITY,
  redirect_uri: window.location.href,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

export const userManager = new UserManager(userManagerProps);
