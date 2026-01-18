import ReactDOM from "react-dom/client";
import { AuthProvider, AuthProviderProps } from "react-oidc-context";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import App from "./App.tsx";
import { AppShell } from "./AppShell.tsx";
import { userManager } from "./UserManager.tsx";
import { AuthRoute } from "./common/components";
import {
  AdminNavigation,
  Admins,
  Busses,
  Clients,
  Distributions,
  Goods,
  Shifts,
  Volunteers,
} from "./features/admin";
import {
  CardView,
  ClientSearch,
  DistributionAdd,
  DistributionOverview,
  MapView,
  OperatorNavigation,
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
          <AuthRoute roles={["ADMIN"]}>
            <AppShell navigation={<AdminNavigation />} />
          </AuthRoute>
        ),
        children: [
          { path: "", element: <Navigate relative="path" to="shifts" /> },
          {
            path: "shifts",
            element: <Shifts />,
          },
          {
            path: "admins",
            element: <Admins />,
          },
          {
            path: "busses",
            element: <Busses />,
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
          {
            path: "distributions",
            element: <Distributions />,
          },
        ],
      },
      {
        path: "",
        element: (
          <AuthRoute roles={["ADMIN", "OPERATOR"]}>
            <AppShell navigation={<OperatorNavigation />} />
          </AuthRoute>
        ),
        children: [
          { path: "", element: <Navigate relative="path" to="overview/map" /> },
          {
            path: "overview",
            element: <DistributionOverview />,
            children: [
              {
                path: "tiles",
                element: <CardView />,
              },
              {
                path: "map",
                element: <MapView />,
              },
              {
                path: "search",
                element: <ClientSearch />,
              },
            ],
          },
          {
            path: "add",
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
  userManager,
  onSigninCallback,
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider {...authProvProps}>
    <RouterProvider router={router} />
  </AuthProvider>,
);
