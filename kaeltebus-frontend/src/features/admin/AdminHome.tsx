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
  IconMoon,
  IconSoup,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import { Outlet } from "react-router-dom";
import LogoLight from "../../common/assets/drk_logo.png";
import LogoDark from "../../common/assets/drk_logo_dark.png";
import { NavigationItem, NavigationItemProps } from "../../common/components";

import "./AdminHome.scss";

const links: Array<NavigationItemProps> = [
  {
    label: "Schichten",
    target: "shifts",
    Icon: IconBus,
  },
  {
    label: "Klienten",
    target: "clients",
    Icon: IconBedFlat,
  },
  {
    label: "Freiwillige",
    target: "volunteers",
    Icon: IconUser,
  },
  {
    label: "Güter",
    target: "goods",
    Icon: IconSoup,
  },
];

export const AdminHome = () => {
  const [opened, { toggle }] = useDisclosure();

  const { toggleColorScheme, colorScheme } = useMantineColorScheme();

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
          <Switch
            size="md"
            checked={colorScheme === "dark"}
            onChange={() => toggleColorScheme()}
            onLabel={<IconMoon style={{ padding: "2px" }} />}
            offLabel={<IconSun style={{ padding: "2px" }} />}
          />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {links.map((link) => (
          <NavigationItem key={link.target} {...link} onNavigate={toggle} />
        ))}
      </AppShell.Navbar>
      <AppShell.Main id="admin-main">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
