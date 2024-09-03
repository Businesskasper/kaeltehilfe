import React from "react";
import ReactDOM from "react-dom/client";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import App from "./App.tsx";
import {
  AdminHome,
  Clients,
  Goods,
  Shifts,
  Volunteers,
} from "./features/admin";
import { OperatorHome } from "./features/operator";

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
        element: <AdminHome />,
        children: [
          { path: "", element: <Navigate relative="path" to="shifts" /> },
          {
            path: "shifts",
            element: <Shifts />,
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
        element: <OperatorHome />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
