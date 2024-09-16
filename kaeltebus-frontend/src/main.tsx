import { WebStorageStateStore } from "oidc-client-ts";
import ReactDOM from "react-dom/client";
import { AuthProvider, AuthProviderProps } from "react-oidc-context";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import App from "./App.tsx";
import { AuthRoute } from "./common/components";
import {
  AdminHome,
  Clients,
  Devices,
  Goods,
  Shifts,
  Volunteers,
} from "./features/admin";
import {
  DistributionAdd,
  DistributionOverview,
  OperatorHome,
} from "./features/operator";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-react-table/styles.css";

import "./index.scss";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "admin",
        element: (
          <AuthRoute>
            <AdminHome />
          </AuthRoute>
        ),
        children: [
          { path: "", element: <Navigate relative="path" to="shifts" /> },
          {
            path: "shifts",
            element: <Shifts />,
          },
          {
            path: "devices",
            element: <Devices />,
          },
          {
            path: "clients",
            element: <Clients />,
          },
          {
            path: "goods",
            element: <Goods />,
          },
          {
            path: "volunteers",
            element: <Volunteers />,
          },
        ],
      },
      {
        path: "operator",
        element: (
          <AuthRoute>
            <OperatorHome />
          </AuthRoute>
        ),
        children: [
          { path: "", element: <Navigate relative="path" to="overview" /> },
          {
            path: "overview",
            element: <DistributionOverview />,
          },
          {
            path: "addDistribution",
            element: <DistributionAdd />,
          },
        ],
      },
    ],
  },
]);

const onSigninCallback = (): void => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

const authProvProps: AuthProviderProps = {
  client_id: "kaeltebus",
  authority: "https://auth.lukaweis.de/realms/drk",
  redirect_uri: window.location.href,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  onSigninCallback,
  // automaticSilentRenew: true,
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider {...authProvProps}>
    <RouterProvider router={router} />
  </AuthProvider>
);
