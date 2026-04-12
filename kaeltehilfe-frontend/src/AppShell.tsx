import {
  Burger,
  Group,
  AppShell as Mantine_AppShell,
  rem,
} from "@mantine/core";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import React from "react";
import { Outlet } from "react-router-dom";
import { Kaeltehilfe } from "./common/brands";
import { UserMenu } from "./common/components";

export const AppShell = ({ navigation }: { navigation?: React.ReactNode }) => {
  const [opened, { toggle }] = useDisclosure();
  const hasNav = !!navigation;

  const { width } = useViewportSize();
  const isSmall = width < 450;

  return (
    <Mantine_AppShell
      header={{ height: rem(80) }}
      navbar={
        hasNav
          ? {
              width: 300,
              breakpoint: "md",
              collapsed: { mobile: !opened, desktop: !opened },
            }
          : undefined
      }
      padding="md"
    >
      <Mantine_AppShell.Header h="0" pos="relative" withBorder={false}>
        <Group
          gap={isSmall ? 0 : undefined}
          wrap="nowrap"
          px="md"
          pt="md"
          justify="space-between"
          h={rem(80)}
        >
          <Group className="burger-menu">
            {hasNav && <Burger opened={opened} onClick={toggle} size="sm" />}
            <Kaeltehilfe className="brand" />
          </Group>
          <Group className="user-menu">
            <UserMenu />
          </Group>
        </Group>
      </Mantine_AppShell.Header>
      {hasNav && (
        <Mantine_AppShell.Navbar p="md">{navigation}</Mantine_AppShell.Navbar>
      )}
      <Mantine_AppShell.Main mah="100dvh" id="main">
        <Outlet />
      </Mantine_AppShell.Main>
    </Mantine_AppShell>
  );
};
