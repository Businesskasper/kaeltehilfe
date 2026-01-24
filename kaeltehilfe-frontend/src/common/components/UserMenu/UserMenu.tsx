import {
  Group,
  Menu,
  rem,
  Switch,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconBus,
  IconLogout,
  IconMoon,
  IconSun,
  IconUserShield,
} from "@tabler/icons-react";
import { useAuth } from "react-oidc-context";
import { matchPath, useNavigate, useResolvedPath } from "react-router-dom";
import { useProfile } from "../../utils/useProfile";

export const UserMenu = () => {
  const auth = useAuth();
  const profile = useProfile();

  const navigate = useNavigate();

  const { toggleColorScheme, colorScheme } = useMantineColorScheme();

  const adminResolvedPath = useResolvedPath("/admin");
  const isOnAdminPage = !!matchPath(
    { path: adminResolvedPath.pathname, end: false },
    location.pathname,
  );

  return (
    <Group className="user-menu">
      <Menu withArrow zIndex={400}>
        <Menu.Target>
          <Text>
            {auth.isAuthenticated && <span>{auth?.user?.profile.name}</span>}
          </Text>
        </Menu.Target>
        <Menu.Dropdown>
          {!isOnAdminPage && profile?.role === "ADMIN" ? (
            <Menu.Item>
              <Group justify="space-between">
                <Text onClick={() => navigate("/admin")}>Admin Panel</Text>
                <IconUserShield />
              </Group>
            </Menu.Item>
          ) : (
            <Menu.Item onClick={() => navigate("/")}>
              <Group justify="space-between">
                <Text>Erfasser Seite</Text>
                <IconBus />
              </Group>
            </Menu.Item>
          )}
          <Menu.Item
            onClick={() =>
              auth
                .signoutSilent({
                  post_logout_redirect_uri: window.location.href,
                  silentRequestTimeoutInSeconds: 0,
                })
                .then(() => auth.signinRedirect())
            }
          >
            <Group justify="space-between">
              <Text>Ausloggen</Text>
              <IconLogout />
            </Group>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <Switch
        size="md"
        checked={colorScheme === "dark"}
        onChange={() => toggleColorScheme()}
        onLabel={<IconMoon style={{ padding: rem(2) }} />}
        offLabel={<IconSun style={{ padding: rem(2) }} />}
      />
    </Group>
  );
};
