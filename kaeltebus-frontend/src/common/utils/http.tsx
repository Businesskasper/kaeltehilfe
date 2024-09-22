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
      if (error.response?.status === 404) {
        notifications.show({
          ...notificationProps,
          message: "Das Objekt wurde nicht gefunden",
        });
      } else if (error.response?.status?.toString()[0] === "4") {
        if (error.response?.data.Code === "DUPLICATE") {
          notifications.show({
            ...notificationProps,
            message: "Ein Objekt mit angegebenem Schlüssel existiert bereits.",
          });
        } else {
          notifications.show({
            ...notificationProps,
            message: "Bitte überprüfen Sie Ihre Eingabe",
          });
        }
      } else if (error.response?.status?.toString()[0] === "5") {
        notifications.show({
          ...notificationProps,
          message: "Bitte versuchen Sie es später erneut",
        });
      }
    }

    throw error;
  }
);

const getBaseQuery =
  <T,>(path: string) =>
  async (abortSignal?: AbortSignal): Promise<Array<T>> => {
    const response = await http.get<Array<T>>(path, {
      baseURL: VITE_API_BASE_URL,
      signal: abortSignal,
    });
    return response.data;
  };

const getBasePost =
  <T extends Record<string, unknown>>(path: string) =>
  async (item: T, abortSignal?: AbortSignal): Promise<void> => {
    const itemKeys = Object.keys(item);
    const cleanedItem = itemKeys.reduce((obj, key) => {
      const value = item[key];
      return {
        ...obj,
        [key]: typeof value === "string" ? value?.trimStart().trimEnd() : value,
      };
    }, {} as T);

    await http.post<T>(path, cleanedItem, {
      baseURL: VITE_API_BASE_URL,
      signal: abortSignal,
    });
  };

const getBaseUpdate =
  <T,>(path: string) =>
  async (
    id: number,
    update: Partial<T>,
    abortSignal?: AbortSignal
  ): Promise<void> => {
    await http.patch<Partial<T>>(`${path}/${id}`, update, {
      baseURL: VITE_API_BASE_URL,
      signal: abortSignal,
    });
  };

const getBasePut =
  <T extends Record<string, unknown>>(path: string) =>
  async (
    id: number,
    update: Partial<T>,
    abortSignal?: AbortSignal
  ): Promise<void> => {
    const itemKeys = Object.keys(update);
    const cleanedUpdate = itemKeys.reduce((obj, key) => {
      const value = update[key];
      return {
        ...obj,
        [key]: typeof value === "string" ? value?.trimStart().trimEnd() : value,
      };
    }, {} as T);

    await http.put<Partial<T>>(`${path}/${id}`, cleanedUpdate, {
      baseURL: VITE_API_BASE_URL,
      signal: abortSignal,
    });
  };

const getBaseDelete =
  (path: string) =>
  async (id: number, abortSignal?: AbortSignal): Promise<void> => {
    await http.delete(`${path}/${id}`, {
      baseURL: VITE_API_BASE_URL,
      signal: abortSignal,
    });
  };

export { getBaseDelete, getBasePost, getBasePut, getBaseQuery, getBaseUpdate };
