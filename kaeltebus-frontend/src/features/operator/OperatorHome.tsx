import { AppShell, Group, useMantineColorScheme } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import React from "react";
import { Outlet } from "react-router-dom";
import LogoLight from "../../common/assets/drk_logo.png";
import LogoDark from "../../common/assets/drk_logo_dark.png";
import { UserMenu } from "../../common/components";
import { OperatorContextType } from "./OperatorContext";

import "./OperatorHome.scss";

export const OperatorHome = () => {
  const { colorScheme } = useMantineColorScheme();

  const { width } = useViewportSize();
  const isSmall = width < 450;

  const lastLocationState = React.useState<string>();

  return (
    <AppShell header={{ height: 80 }} padding="md">
      <AppShell.Header h="0" pos="relative" withBorder={false}>
        <Group
          gap={isSmall ? 0 : undefined}
          wrap="nowrap"
          px="md"
          justify="space-between"
        >
          <Group className="BurgerMenu">
            <img
              height={80}
              src={colorScheme === "dark" ? LogoDark : LogoLight}
            />
          </Group>
          {/* <Group className="UserMenu">
            {auth.isAuthenticated && <span>{auth?.user?.profile.name}</span>}
            <Switch
              size="md"
              checked={colorScheme === "dark"}
              onChange={() => toggleColorScheme()}
              onLabel={<IconMoon style={{ padding: "2px" }} />}
              offLabel={<IconSun style={{ padding: "2px" }} />}
            />
          </Group> */}
          <Group className="UserMenu">
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main id="operator-main">
        <Outlet context={{ lastLocationState } satisfies OperatorContextType} />
      </AppShell.Main>
    </AppShell>
  );
};
