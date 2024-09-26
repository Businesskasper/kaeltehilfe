import {
  AppShell,
  Burger,
  Group,
  Switch,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBedFlat,
  IconBus,
  IconCalendar,
  IconMoon,
  IconSoup,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import { useAuth } from "react-oidc-context";
import { Outlet } from "react-router-dom";
import LogoLight from "../../common/assets/drk_logo.png";
import LogoDark from "../../common/assets/drk_logo_dark.png";
import { NavigationItem, NavigationSection } from "../../common/components";

import "./AdminHome.scss";

export const AdminHome = () => {
  const [opened, { toggle }] = useDisclosure();

  const { toggleColorScheme, colorScheme } = useMantineColorScheme();

  const auth = useAuth();

  return (
    <AppShell
      header={{ height: 80 }}
      navbar={{
        width: 300,
        breakpoint: "md",
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      padding="md"
    >
      <AppShell.Header withBorder={false}>
        <Group px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} size="sm" />
            <img
              height={80}
              src={colorScheme === "dark" ? LogoDark : LogoLight}
            />
          </Group>
          <Group>
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
      <AppShell.Navbar p="md">
        <NavigationSection label="Schichtplanung">
          <NavigationItem
            onNavigate={toggle}
            label="Freiwillige"
            Icon={IconUser}
            target="volunteers"
          />
          <NavigationItem
            onNavigate={toggle}
            label="Schichtträger"
            Icon={IconBus}
            target="devices"
          />
          <NavigationItem
            onNavigate={toggle}
            label="Schichten"
            Icon={IconCalendar}
            target="shifts"
          />
        </NavigationSection>
        <NavigationSection label="Ausgabeverwaltung">
          <NavigationItem
            onNavigate={toggle}
            label="Güter"
            target="goods"
            Icon={IconSoup}
          />
          <NavigationItem
            onNavigate={toggle}
            label="Klienten"
            target="clients"
            Icon={IconBedFlat}
          />
          <NavigationItem
            onNavigate={toggle}
            label="Ausgaben"
            target="distributions"
            Icon={IconBedFlat}
          />
        </NavigationSection>
      </AppShell.Navbar>
      <AppShell.Main id="admin-main">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
