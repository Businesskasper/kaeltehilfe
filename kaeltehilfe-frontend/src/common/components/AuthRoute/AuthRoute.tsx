import { useAuth } from "react-oidc-context";
import { UserRole } from "../../data";
import { useProfile } from "../../utils/useProfile";

type PrivateRouteProps = React.PropsWithChildren & { roles?: Array<UserRole> };

export const AuthRoute = ({ children, roles }: PrivateRouteProps) => {
  const auth = useAuth();
  const isLoggedIn = auth.isAuthenticated;

  const profile = useProfile();
  const isAuthorized =
    !roles ||
    roles?.length === 0 ||
    (profile?.role && roles.includes(profile.role));

  return isLoggedIn && isAuthorized ? children : null;
};
