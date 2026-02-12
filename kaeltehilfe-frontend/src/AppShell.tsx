import {
  Burger,
  Group,
  AppShell as Mantine_AppShell,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import React from "react";
import { Outlet } from "react-router-dom";
import { UserMenu } from "./common/components";

const cupDark = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
    >
      <g
        fill="none"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path d="M17 11.6V15a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-3.4a.6.6 0 0 1 .6-.6h12.8a.6.6 0 0 1 .6.6M12 9c0-1 .714-2 2.143-2v0A2.857 2.857 0 0 0 17 4.143V3.5M8 9v-.5a3 3 0 0 1 3-3v0a2 2 0 0 0 2-2V3" />
        <path d="M16 11h2.5a2.5 2.5 0 0 1 0 5H17" />
      </g>
    </svg>
  );
};
const cupLight = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
    >
      <g
        fill="none"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path d="M17 11.6V15a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-3.4a.6.6 0 0 1 .6-.6h12.8a.6.6 0 0 1 .6.6M12 9c0-1 .714-2 2.143-2v0A2.857 2.857 0 0 0 17 4.143V3.5M8 9v-.5a3 3 0 0 1 3-3v0a2 2 0 0 0 2-2V3" />
        <path d="M16 11h2.5a2.5 2.5 0 0 1 0 5H17" />
      </g>
    </svg>
  );
};
export const Logo = () => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <div className="brand">
      {colorScheme === "dark" ? cupLight() : cupDark()}
      <span className="company">kältehilfe</span>
    </div>
  );
};

export const AppShell = ({ navigation }: { navigation?: React.ReactNode }) => {
  const [opened, { toggle }] = useDisclosure();

  const { width } = useViewportSize();
  const isSmall = width < 450;

  return (
    <Mantine_AppShell
      header={{ height: 80 }}
      navbar={{
        width: 300,
        breakpoint: "md",
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      padding="md"
      // padding={0}
    >
      <Mantine_AppShell.Header h="0" pos="relative" withBorder={false}>
        <Group
          gap={isSmall ? 0 : undefined}
          wrap="nowrap"
          px="md"
          justify="space-between"
        >
          <Group className="burger-menu">
            <Burger opened={opened} onClick={toggle} size="sm" />

            <Logo />
          </Group>
          <Group className="user-menu">
            <UserMenu />
          </Group>
        </Group>
      </Mantine_AppShell.Header>
      <Mantine_AppShell.Navbar p="md">{navigation}</Mantine_AppShell.Navbar>
      <Mantine_AppShell.Main id="main">
        <Outlet />
      </Mantine_AppShell.Main>
    </Mantine_AppShell>
  );
};
