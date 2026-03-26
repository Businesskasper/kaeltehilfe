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
  IconUserShield,
} from "@tabler/icons-react";
import { useAuth } from "react-oidc-context";
import { matchPath, useNavigate, useResolvedPath } from "react-router-dom";
import { useProfile } from "../../utils/useProfile";
import { getUserInitials } from "./helper";

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

  const userInitials = getUserInitials(auth?.user?.profile.name);

  return (
    <Group className="user-menu">
      <Switch
        size="md"
        checked={colorScheme === "dark"}
        onChange={() => toggleColorScheme()}
        onLabel={<IconMoon style={{ padding: rem(2) }} />}
        offLabel={<IconSun style={{ padding: rem(2) }} />}
      />

      {auth.isAuthenticated && (
        <Menu zIndex={400} width={200}>
          <Menu.Target>
            <UnstyledButton>
              <Group gap="xs">
                <Avatar name={userInitials} />
                <Text size="sm">
                  {auth?.user?.profile.name}
                </Text>
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
