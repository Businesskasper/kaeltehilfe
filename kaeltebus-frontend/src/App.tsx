import { MantineProvider, colorsTuple } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React from "react";
import { hasAuthParams, useAuth } from "react-oidc-context";

import "./App.scss";

import { DatesProvider } from "@mantine/dates";
import dayjs from "dayjs";
import "dayjs/locale/de";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Outlet } from "react-router-dom";
import { classes, useBreakpoint } from "./common/utils";
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
      !auth.isLoading
      // !hasTriedSignin
    ) {
      // if (!hasTriedSignin) {
      //   auth
      //     .signinSilent()
      //     .then(() => console.log("asdf"))
      //     .catch(() => {
      //       console.log("bsdf");
      //       return auth.signinRedirect();
      //     })
      //     .finally(() => setHasTriedSignin(true));
      // } else {
      //   auth.signinSilent();
      // }

      if (!hasTriedSignin) {
        auth.signinRedirect();
        setHasTriedSignin(true);
      } else {
        auth.signinSilent();
      }
    }
  }, [auth, hasTriedSignin]);

  const isDev = import.meta.env.DEV;
  React.useEffect(() => {
    if (!auth || !isDev) return;

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
  }, [auth, isDev]);

  // Prevent automatic zoom in on iPhones
  const isIphone = navigator?.userAgent?.includes("iPhone");
  React.useLayoutEffect(() => {
    if (!isIphone) return;

    const metaTags = document.getElementsByTagName("meta");
    const viewportMetaTag = Array.from(metaTags).find(
      (meta) => meta.name === "viewport"
    );
    if (viewportMetaTag) {
      viewportMetaTag.content =
        "minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no";
    } else {
      const newViewportMetaTag = document.createElement("meta");
      newViewportMetaTag.name = "viewport";
      newViewportMetaTag.content =
        "minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no";
      document.getElementsByTagName("head")[0].appendChild(newViewportMetaTag);
    }
  }, [isIphone]);

  // const openFirstModal = () => {
  //   modals.open({
  //     modalId: "asdf",
  //     title: "asdf",
  //     children: (
  //       <>
  //         <Button onClick={() => modals.close("asdf")}>Close</Button>
  //         <Button
  //           onClick={() =>
  //             modals.open({
  //               title: "Modal 2",
  //               modalId: "bsdf",
  //               children: (
  //                 <>
  //                   <Button onClick={() => modals.close("bsdf")}>
  //                     Close All
  //                   </Button>
  //                 </>
  //               ),
  //             })
  //           }
  //         >
  //           Open Next
  //         </Button>
  //       </>
  //     ),
  //   });
  // };
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "BASE" || breakpoint === "XS";

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
          // Should prevent iphones from zooming in on select focus
          // Does not work, the problem is solved with above meta tag
          // fontSizes: {
          //   xs: "16px",
          // },
        }}
      >
        <DatesProvider settings={{ locale: "de" }}>
          <Notifications position="bottom-center" />
          <QueryClientProvider client={queryClient}>
            <ModalsProvider
              modalProps={{
                fullScreen: isMobile,
                centered: true,
                transitionProps: { transition: "fade", duration: 200 },
                className: classes({
                  modal: true,
                  "full-width": !!isMobile,
                }),
              }}
            >
              {/* <Button onClick={openFirstModal}>Open</Button> */}
              <Outlet />
            </ModalsProvider>
          </QueryClientProvider>
        </DatesProvider>
      </MantineProvider>
    </React.StrictMode>
  );
}

export default App;
