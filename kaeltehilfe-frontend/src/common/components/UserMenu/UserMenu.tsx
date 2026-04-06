import {
  Avatar,
  Group,
  Menu,
  rem,
  Switch,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconBus,
  IconLogout,
  IconMoon,
  IconSun,
  IconUser,
  IconUserShield,
} from "@tabler/icons-react";
import { useAuth } from "react-oidc-context";
import { matchPath, useNavigate, useResolvedPath } from "react-router-dom";
import { useProfile } from "../../utils/useProfile";
import { useBreakpoint } from "../../utils";

export const UserMenu = () => {
  const auth = useAuth();
  const profile = useProfile();

  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "BASE" || breakpoint === "XS";

  const navigate = useNavigate();

  const { toggleColorScheme, colorScheme } = useMantineColorScheme();

  const adminResolvedPath = useResolvedPath("/admin");
  const isOnAdminPage = !!matchPath(
    { path: adminResolvedPath.pathname, end: false },
    location.pathname,
  );

  const isBus = !!profile?.registrationNumber;
  const avatarIcon = isBus ? <IconBus size={16} /> : <IconUser size={16} />;
  const userName = isBus ? profile?.registrationNumber : auth?.user?.profile.name;


  const colorSwitch = <Switch
    size="md"
    checked={colorScheme === "dark"}
    onChange={() => toggleColorScheme()}
    onLabel={<IconMoon style={{ padding: rem(2) }} />}
    offLabel={<IconSun style={{ padding: rem(2) }} />}
  />
  return (
    <Group className="user-menu">
      {!isMobile && colorSwitch}
      {auth.isAuthenticated && (
        <Menu zIndex={400} width={200}>
          <Menu.Target>
            <UnstyledButton>
              <Group gap={5}>
                <Avatar size={30}>{avatarIcon}</Avatar>
                <Text size="sm">{userName}</Text>
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Benutzer Menü</Menu.Label>
            {!isOnAdminPage && profile?.role === "ADMIN" ? (
              <Menu.Item leftSection={<IconUserShield size={16} />} onClick={() => navigate("/admin")}>
                Admin Seite
              </Menu.Item>
            ) : (
              <Menu.Item onClick={() => navigate("/")} leftSection={<IconBus size={16} />}>
                Erfasser Seite
              </Menu.Item>
            )}
            {isMobile &&
              <Group px="sm" py="xs">
                <Text size="sm">{colorScheme === "light" ? "Hell" : "Dunkel"}</Text>
                {colorSwitch}
              </Group>}

            <Menu.Item
              onClick={() =>
                auth
                  .signoutSilent({
                    post_logout_redirect_uri: window.location.href,
                    silentRequestTimeoutInSeconds: 0,
                  })
                  .then(() => auth.signinRedirect())
              }
              leftSection={<IconLogout size={16} />}
              color="red"
            >
              Ausloggen
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
    </Group>
  );
};
