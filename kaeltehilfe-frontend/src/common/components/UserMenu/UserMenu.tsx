import {
  Avatar,
  Button,
  Group,
  Menu,
  Modal,
  rem,
  Switch,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
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
import { useSelectedBus } from "../../utils/useSelectedBus";
import { FormSelect } from "../Form/FormSelect/FormSelect";
import { Bus } from "../../data";
import React from "react";

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

  const { selectedRegistrationNumber, setSelectedRegistrationNumber, busses, isOperator } =
    useSelectedBus();

  const [busModalOpened, { open: openBusModal, close: closeBusModal }] =
    useDisclosure(false);

  const busForm = useForm<{ registrationNumber: string }>({
    mode: "controlled",
    initialValues: { registrationNumber: selectedRegistrationNumber || "" },
  });

  // Sync form value when selected bus changes externally (e.g. default set after busses load)
  React.useEffect(() => {
    if (selectedRegistrationNumber && busForm.values.registrationNumber !== selectedRegistrationNumber) {
      busForm.setFieldValue("registrationNumber", selectedRegistrationNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegistrationNumber]);

  const handleBusSubmit = (values: { registrationNumber: string }) => {
    if (values.registrationNumber) {
      setSelectedRegistrationNumber!(values.registrationNumber);
    }
    closeBusModal();
  };

  const isBus = !!profile?.registrationNumber;
  const avatarIcon = isBus ? <IconBus size={16} /> : <IconUser size={16} />;

  const userName = isOperator
    ? profile?.registrationNumber
    : auth?.user?.profile.name;

  const colorSwitch = (
    <Switch
      size="md"
      checked={colorScheme === "dark"}
      onChange={() => toggleColorScheme()}
      onLabel={<IconMoon style={{ padding: rem(2) }} />}
      offLabel={<IconSun style={{ padding: rem(2) }} />}
    />
  );

  return (
    <>
      {!isMobile && colorSwitch}
      {auth.isAuthenticated && (
        <>
          <Menu zIndex={400} width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap={5}>
                  <Avatar size={30}>{avatarIcon}</Avatar>
                  <Text size="sm">
                    {userName}
                  </Text>
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Benutzer Menü</Menu.Label>
              {!isOnAdminPage && profile?.role === "ADMIN" ? (
                <Menu.Item
                  leftSection={<IconUserShield size={16} />}
                  onClick={() => navigate("/admin")}
                >
                  Admin Seite
                </Menu.Item>
              ) : (
                <Menu.Item onClick={() => navigate("/")} leftSection={<IconBus size={16} />}>
                  Erfasser Seite
                </Menu.Item>
              )}
              {!isOperator && !isOnAdminPage && busses && busses.length > 0 && (
                <Menu.Item leftSection={<IconBus size={16} />} onClick={openBusModal}>
                  {selectedRegistrationNumber || "Schichtträger wählen"}
                </Menu.Item>
              )}
              {isMobile && (
                <Group px="sm" py="xs">
                  <Text size="sm">{colorScheme === "light" ? "Hell" : "Dunkel"}</Text>
                  {colorSwitch}
                </Group>
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

          {!isOperator && busses && (
            <Modal
              opened={busModalOpened}
              onClose={closeBusModal}
              title="Schichtträger wählen"
              centered
              zIndex={500}
            >
              <form onSubmit={busForm.onSubmit(handleBusSubmit)}>
                <FormSelect<Bus>
                  items={busses}
                  valueGetter="registrationNumber"
                  sort
                  label="Schichtträger"
                  withAsterisk
                  formProps={busForm.getInputProps("registrationNumber")}
                  onItemSelected={(item) => {
                    if (item) busForm.setFieldValue("registrationNumber", item.registrationNumber);
                  }}
                  zIndex={500}
                />
                <Button type="submit" fullWidth mt="xl">
                  Übernehmen
                </Button>
              </form>
            </Modal>
          )}
        </>
      )}
    </>
  );
};
