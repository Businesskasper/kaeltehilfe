import {
  Group,
  Menu,
  Switch,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { IconLogout, IconMoon, IconSun } from "@tabler/icons-react";
import { useAuth } from "react-oidc-context";

export const UserMenu = () => {
  const auth = useAuth();

  const { toggleColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Group className="UserMenu">
      <Menu withArrow>
        <Menu.Target>
          <Text>
            {auth.isAuthenticated && <span>{auth?.user?.profile.name}</span>}
          </Text>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onClick={
              () =>
                auth
                  .signoutSilent({
                    post_logout_redirect_uri: window.location.href,
                    silentRequestTimeoutInSeconds: 0,
                  })
                  .then(() => auth.signinRedirect())
              // .then(() => (window.location.href = `${window.location.href}`))
            }
          >
            <Group>
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
        onLabel={<IconMoon style={{ padding: "2px" }} />}
        offLabel={<IconSun style={{ padding: "2px" }} />}
      />
    </Group>
  );
  //   return auth.isAuthenticated ? (
  //     <Menu withArrow>
  //       <Menu.Target>
  //         <ActionIcon h={40} w={40} variant="outline" radius="50%">
  //           <IconUser />
  //         </ActionIcon>
  //       </Menu.Target>
  //       <Menu.Dropdown miw={150}>
  //         <Group py={4} px={20} style={{ rowGap: "4px" }} className="UserMen">
  //           <div>{auth.user?.profile.name}</div>
  //           <Switch
  //             size="md"
  //             checked={colorScheme === "dark"}
  //             onChange={() => toggleColorScheme()}
  //             onLabel={<IconMoon style={{ padding: "2px" }} />}
  //             offLabel={<IconSun style={{ padding: "2px" }} />}
  //           />
  //         </Group>
  //         <Select py={4} px={20}></Select>
  //       </Menu.Dropdown>
  //     </Menu>
  //   ) : (
  //     <Skeleton height={40} circle animate />
  //   );
};
