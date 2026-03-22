import {
  UserManager,
  UserManagerSettings,
  WebStorageStateStore,
} from "oidc-client-ts";
import { AppConfig } from "./config";

export let userManager: UserManager = null!;

export function initUserManager(config: AppConfig): void {
  const { IDP_AUTHORITY, IDP_CLIENT } = config;
  const settings: UserManagerSettings = {
    client_id: IDP_CLIENT,
    authority: IDP_AUTHORITY,
    redirect_uri: window.location.href,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    extraQueryParams: {
      theme: localStorage.getItem("mantine-color-scheme-value") || "light",
    },
    scope: "openid profile roles",
  };
  userManager = new UserManager(settings);
}
