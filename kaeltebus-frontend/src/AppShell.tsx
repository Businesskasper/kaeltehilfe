import {
  Burger,
  Group,
  AppShell as Mantine_AppShell,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import React from "react";
import { Outlet } from "react-router-dom";
import LogoLight from "./common/assets/drk_logo.png";
import LogoDark from "./common/assets/drk_logo_dark.png";
import { UserMenu } from "./common/components";

export const AppShell = ({ navigation }: { navigation?: React.ReactNode }) => {
  const [opened, { toggle }] = useDisclosure();

  const { colorScheme } = useMantineColorScheme();

  const { width } = useViewportSize();
  const isSmall = width < 450;

  // const lastLocationState = React.useState<string>();

  // Add required html tags for using the map view
  React.useEffect(() => {
    // const { head } = document;
    // const existingLeafletStylesheet = head.querySelector(
    //   'link[rel="stylesheet"][href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]'
    // );
    // if (!existingLeafletStylesheet) {
    //   const leafletStylesheet = document.createElement("link");
    //   leafletStylesheet.rel = "stylesheet";
    //   leafletStylesheet.href =
    //     "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    //   leafletStylesheet.integrity =
    //     "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    //   leafletStylesheet.crossOrigin = "";
    //   head.appendChild(leafletStylesheet);
    // }
    // const existingLeafletScript = head.querySelector(
    //   'script[src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"]'
    // );
    // if (!existingLeafletScript) {
    //   const leafletScript = document.createElement("script");
    //   leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    //   leafletScript.integrity =
    //     "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    //   leafletScript.crossOrigin = "";
    //   head.appendChild(leafletScript);
    // }
    // const existingMapContainer = document.getElementById("map");
    // if (!existingMapContainer) {
    //   const mapContainer = document.createElement("div");
    //   mapContainer.id = "map";
    //   mapContainer.style.height = "500px";
    //   document.body.appendChild(mapContainer);
    // }
  }, []);

  return (
    <Mantine_AppShell
      header={{ height: 80 }}
      navbar={{
        width: 300,
        breakpoint: "md",
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      padding="md"
    >
      <Mantine_AppShell.Header h="0" pos="relative" withBorder={false}>
        <Group
          gap={isSmall ? 0 : undefined}
          wrap="nowrap"
          px="md"
          justify="space-between"
        >
          <Group className="BurgerMenu">
            <Burger opened={opened} onClick={toggle} size="sm" />
            <img
              height={80}
              src={colorScheme === "dark" ? LogoDark : LogoLight}
            />
          </Group>
          <Group className="UserMenu">
            <UserMenu />
          </Group>
        </Group>
      </Mantine_AppShell.Header>
      <Mantine_AppShell.Navbar p="md">{navigation}</Mantine_AppShell.Navbar>
      <Mantine_AppShell.Main id="main">
        <Outlet />
        {/* {children} */}
        {/* <Outlet context={{ lastLocationState } satisfies OperatorContextType} /> */}
      </Mantine_AppShell.Main>
    </Mantine_AppShell>
  );
};
