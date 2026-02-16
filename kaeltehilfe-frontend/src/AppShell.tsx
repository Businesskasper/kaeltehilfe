import { Burger, Group, AppShell as Mantine_AppShell } from "@mantine/core";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import React from "react";
import { Outlet } from "react-router-dom";
import { Kaeltehilfe } from "./common/brands";
import { UserMenu } from "./common/components";

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
            <Kaeltehilfe className="brand" />
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
