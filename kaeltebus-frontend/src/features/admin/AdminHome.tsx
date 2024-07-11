import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBedFlat, IconBus, IconSoup, IconUser } from "@tabler/icons-react";
import { Outlet } from "react-router-dom";
import Logo from "../../common/assets/drk_logo.png";
import { NavigationItem, NavigationItemProps } from "../../common/components";

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

  return (
    <AppShell
      className="App"
      header={{ height: 80 }}
      navbar={{
        width: 300,
        breakpoint: "xs",
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      padding="md"
    >
      <AppShell.Header withBorder={false}>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} size="sm" />
          <img height={80} src={Logo} />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {links.map((link) => (
          <NavigationItem key={link.target} {...link} />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
      ;
    </AppShell>
  );
};
