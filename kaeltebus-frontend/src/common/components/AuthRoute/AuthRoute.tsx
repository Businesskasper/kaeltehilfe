import { useAuth } from "react-oidc-context";

type PrivateRouteProps = React.PropsWithChildren;

export const AuthRoute = ({ children }: PrivateRouteProps) => {
  const auth = useAuth();

  const isLoggedIn = auth.isAuthenticated;

  if (!isLoggedIn) {
    // keycloak.init({ onLoad: "login-required" });
  }
  return isLoggedIn ? children : null;
};
