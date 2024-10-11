import { AppShell, Group, Switch, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import React from "react";
import { useAuth } from "react-oidc-context";
import { Outlet } from "react-router-dom";
import LogoLight from "../../common/assets/drk_logo.png";
import LogoDark from "../../common/assets/drk_logo_dark.png";
import { OperatorContextType } from "./OperatorContext";

import "./OperatorHome.scss";

export const OperatorHome = () => {
  const { toggleColorScheme, colorScheme } = useMantineColorScheme();

  const auth = useAuth();

  const lastLocationState = React.useState<string>();

  return (
    <AppShell header={{ height: 80 }} padding="md">
      <AppShell.Header h="0" pos="relative" withBorder={false}>
        <Group wrap="nowrap" px="md" justify="space-between">
          <Group>
            <img
              height={80}
              src={colorScheme === "dark" ? LogoDark : LogoLight}
            />
          </Group>
          <Group className="UserMenu">
            {auth.isAuthenticated && <span>{auth?.user?.profile.name}</span>}
            <Switch
              size="md"
              checked={colorScheme === "dark"}
              onChange={() => toggleColorScheme()}
              onLabel={<IconMoon style={{ padding: "2px" }} />}
              offLabel={<IconSun style={{ padding: "2px" }} />}
            />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main id="operator-main">
        <Outlet context={{ lastLocationState } satisfies OperatorContextType} />
      </AppShell.Main>
    </AppShell>
  );
};
