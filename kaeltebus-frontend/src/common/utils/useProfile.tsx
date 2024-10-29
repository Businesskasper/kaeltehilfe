import React from "react";
import { useAuth } from "react-oidc-context";
import { userManager } from "../../UserManager";
import { UserRole } from "../app";

export const useProfile = (): KbProfile | undefined => {
  const auth = useAuth();

  // if (!auth || !auth.isAuthenticated) return undefined;

  const profile = React.useMemo<KbProfile | undefined>(() => {
    if (!auth?.isAuthenticated) return;

    const username = auth.user?.profile.preferred_username;

    const clientId = userManager.settings.client_id;
    const kbprofile = auth.user?.profile as KcProfile<typeof clientId>;
    const roles = kbprofile.resource_access?.[clientId]?.roles;

    return {
      username,
      role: roles?.find((r) => r.toUpperCase() === "ADMIN")
        ? "ADMIN"
        : roles?.find((r) => r.toUpperCase() === "OPERATOR")
        ? "OPERATOR"
        : undefined,
      registrationNumber: kbprofile.registrationNumber || "",
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated]);

  return profile;
};

type KbProfile = {
  username?: string;
  role?: UserRole;
  registrationNumber?: string;
};

type KcProfile<TClientId extends string> = {
  resource_access?: {
    [key in TClientId]?: {
      roles?: Array<UserRole>;
    };
  };
  registrationNumber?: string;
};
