import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import axios, { isAxiosError } from "axios";
const { VITE_API_BASE_URL } = import.meta.env;

const http = axios.create({
  baseURL: VITE_API_BASE_URL,
});

const notificationProps = {
  title: "Fehler bei der Übertragung",
  color: "red",
  className: "AppNotification AppNotificationDanger",
  icon: <IconX />,
  withBorder: false,
  withCloseButton: false,
};
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error)) {
      if (error.status === 404) {
        notifications.show({
          ...notificationProps,
          message: "Das Objekt wurde nicht gefunden",
        });
      } else if (error.status?.toString()[0] === "4") {
        notifications.show({
          ...notificationProps,
          message: "Bitte überprüfen Sie Ihre Eingabe",
        });
      } else if (error.status?.toString()[0] === "5") {
        notifications.show({
          ...notificationProps,
          message: "Bitte versuchen Sie es später erneut",
        });
      }
    }

    throw error;
  }
);

export { http };
