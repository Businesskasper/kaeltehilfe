import { AppShell, Burger, Group, useMantineColorScheme } from "@mantine/core";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import {
  IconBedFlat,
  IconBus,
  IconCalendar,
  IconCubeSend,
  IconLogin,
  IconSoup,
  IconUser,
} from "@tabler/icons-react";
import { Outlet } from "react-router-dom";
import LogoLight from "../../common/assets/drk_logo.png";
import LogoDark from "../../common/assets/drk_logo_dark.png";
import {
  NavigationItem,
  NavigationSection,
  UserMenu,
} from "../../common/components";

import "./AdminHome.scss";

export const AdminHome = () => {
  const [opened, { toggle }] = useDisclosure();

  const { colorScheme } = useMantineColorScheme();

  const { width } = useViewportSize();
  const isSmall = width < 450;

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
      <AppShell.Navbar p="md">
        <NavigationSection label="Verwaltung">
          <NavigationItem
            // onNavigate={toggle}
            label="Admins-Logins"
            Icon={IconLogin}
            target="admins"
          />
        </NavigationSection>
        <NavigationSection label="Schichtplanung">
          <NavigationItem
            // onNavigate={toggle}
            label="Freiwillige"
            Icon={IconUser}
            target="volunteers"
          />
          <NavigationItem
            // onNavigate={toggle}
            label="Schichtträger"
            Icon={IconBus}
            target="busses"
          />
          <NavigationItem
            // onNavigate={toggle}
            label="Schichten"
            Icon={IconCalendar}
            target="shifts"
          />
        </NavigationSection>
        <NavigationSection label="Ausgaben">
          <NavigationItem
            // onNavigate={toggle}
            label="Güter"
            target="goods"
            Icon={IconSoup}
          />
          <NavigationItem
            // onNavigate={toggle}
            label="Klienten"
            target="clients"
            Icon={IconBedFlat}
          />
          <NavigationItem
            // onNavigate={toggle}
            label="Ausgaben"
            target="distributions"
            Icon={IconCubeSend}
          />
        </NavigationSection>
      </AppShell.Navbar>
      <AppShell.Main id="admin-main">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
