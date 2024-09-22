import { MantineProvider, colorsTuple } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { hasAuthParams, useAuth } from "react-oidc-context";
import { Outlet } from "react-router-dom";

import "./App.scss";

import { DatesProvider } from "@mantine/dates";
import dayjs from "dayjs";
import "dayjs/locale/de";
import customParseFormat from "dayjs/plugin/customParseFormat";
import React from "react";
dayjs.extend(customParseFormat);

function App() {
  const queryCache = new QueryCache();
  const queryClient = new QueryClient({
    queryCache,
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
      },
    },
  });

  const auth = useAuth();

  const [hasTriedSignin, setHasTriedSignin] = React.useState(false);

  // automatically sign-in
  React.useEffect(() => {
    if (
      !hasAuthParams() &&
      !auth.isAuthenticated &&
      !auth.activeNavigator &&
      !auth.isLoading &&
      !hasTriedSignin
    ) {
      auth.signinRedirect();
      setHasTriedSignin(true);
    }
  }, [auth, hasTriedSignin]);

  React.useEffect(() => {
    if (!auth) return;

    auth.events.addAccessTokenExpiring((a) => {
      console.log("Access token is about to expire...", a);
    });

    auth.events.addAccessTokenExpired(() => {
      console.log("Access token has expired...");
      auth.signinSilent().catch((error) => {
        console.error("Silent sign-in failed", error);
      });
    });

    auth.events.addSilentRenewError((error) => {
      console.error("Silent renew error:", error);
    });

    auth.events.addUserLoaded((user) => {
      console.log("New user profile loaded:", user);
    });
  }, [auth]);

  return (
    <React.StrictMode>
      <MantineProvider
        defaultColorScheme="light"
        theme={{
          // scale: 1.2,
          colors: {
            red: colorsTuple("#e60005"),
            soft_red: colorsTuple("#e46450"),
            dark_red: colorsTuple("#a51e0f"),
            light_blue: colorsTuple("#EBF5FF"),
            blue: colorsTuple("#2275D0"),
            middle_blue: colorsTuple("#008CCD"),
            dark_blue: colorsTuple("#002D55"),
            light_gray: colorsTuple("#EFEEEA"),
            middle_gray: colorsTuple("#B4B4B4"),
            dark_gray: colorsTuple("#554F4A"),
            country_gray: colorsTuple("#D9D9D9"),
          },
          primaryColor: "blue",
        }}
      >
        <DatesProvider settings={{ locale: "de" }}>
          <Notifications position="bottom-center" />
          <QueryClientProvider client={queryClient}>
            <Outlet />
          </QueryClientProvider>
        </DatesProvider>
      </MantineProvider>
    </React.StrictMode>
  );
}

export default App;
