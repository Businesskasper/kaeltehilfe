import {
  UserManager,
  UserManagerSettings,
  WebStorageStateStore,
} from "oidc-client-ts";

const { VITE_IDP_AUTHORITY, VITE_IDP_CLIENT } = import.meta.env;

const userManagerProps: UserManagerSettings = {
  client_id: VITE_IDP_CLIENT,
  authority: VITE_IDP_AUTHORITY,
  redirect_uri: window.location.href,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  extraQueryParams: {
    theme: localStorage.getItem("mantine-color-scheme-value") || "light",
  },
  scope: "openid profile roles",
};

export const userManager = new UserManager(userManagerProps);
