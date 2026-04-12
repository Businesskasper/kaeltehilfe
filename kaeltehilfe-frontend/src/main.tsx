import ReactDOM from "react-dom/client";
import { AuthProvider, AuthProviderProps } from "react-oidc-context";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import App from "./App.tsx";
import { AppShell } from "./AppShell.tsx";
import { initUserManager, userManager } from "./UserManager.tsx";
import { AuthRoute } from "./common/components";
import { initHttp } from "./common/utils/http.tsx";
import { loadConfig } from "./config.ts";
import {
  AdminComments,
  AdminNavigation,
  Admins,
  Busses,
  Clients,
  Distributions,
  Goods,
  ShiftRules,
  Shifts,
  Volunteers,
} from "./features/admin";
import {
  CommentAdd,
  DistributionAdd,
  MapView,
} from "./features/operator";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import "mantine-react-table/styles.css";

import "./index.scss";

const router = createBrowserRouter([
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
          { path: "", element: <Navigate relative="path" to="distributions" /> },
          {
            path: "shifts",
            element: <Shifts />,
          },
          {
            path: "shift-rules",
            element: <ShiftRules />,
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
          {
            path: "comments",
            element: <AdminComments />,
          },
        ],
      },
      {
        path: "",
        element: (
          <AuthRoute roles={["ADMIN", "OPERATOR"]}>
            <AppShell />
          </AuthRoute>
        ),
        children: [
          { path: "", element: <Navigate relative="path" to="map" /> },
          {
            path: "map",
            element: <MapView />,
          },
          {
            path: "add",
            element: <DistributionAdd />,
          },
          {
            path: "add-comment",
            element: <CommentAdd />,
          },
        ],
      },
    ],
  },
]);

async function bootstrap() {
  const config = await loadConfig();
  initHttp(config);
  initUserManager(config);

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
}

bootstrap();
