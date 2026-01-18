import { NotificationData, notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { userManager } from "../../UserManager";

const { VITE_API_BASE_URL } = import.meta.env;

export const http = axios.create({
  baseURL: VITE_API_BASE_URL,
});

const notificationProps: Partial<NotificationData> = {
  title: "Fehler bei der Übertragung",
  color: "red",
  icon: <IconX />,
  withBorder: false,
  withCloseButton: true,
  mb: "xs",
};
http.interceptors.request.use(async (request) => {
  request.withCredentials = true;
  const user = await userManager.getUser();
  const { access_token } = user || {};
  if (access_token) {
    request.headers.setAuthorization(`Bearer ${access_token}`);
  }
  return request;
});
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
  },
);

const getBaseQuery =
  <T,>(path: string) =>
  async (
    abortSignal?: AbortSignal,
    params?: Record<string, unknown>,
  ): Promise<Array<T>> => {
    const response = await http.get<Array<T>>(path, {
      baseURL: VITE_API_BASE_URL,
      signal: abortSignal,
      params,
    });
    return response.data;
  };

const getBaseGet =
  <T,>(path: string) =>
  async (
    abortSignal?: AbortSignal,
    params?: Record<string, unknown>,
  ): Promise<T> => {
    const response = await http.get<T>(path, {
      baseURL: VITE_API_BASE_URL,
      signal: abortSignal,
      params,
    });
    return response.data;
  };

const getBasePost =
  <T extends Record<string, unknown>, TResult = never>(path: string) =>
  async (
    item: T,
    abortSignal?: AbortSignal,
  ): Promise<AxiosResponse<TResult, unknown>> => {
    const itemKeys = Object.keys(item);
    const cleanedItem = itemKeys.reduce((obj, key) => {
      const value = item[key];
      return {
        ...obj,
        [key]: typeof value === "string" ? value?.trimStart().trimEnd() : value,
      };
    }, {} as T);

    return await http.post<T, AxiosResponse<TResult>>(path, cleanedItem, {
      baseURL: VITE_API_BASE_URL,
      signal: abortSignal,
    });
  };

const getBaseUpdate =
  <T,>(path: string) =>
  async (
    id: number,
    update: Partial<T>,
    abortSignal?: AbortSignal,
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
    abortSignal?: AbortSignal,
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

const downloadBase64 = async (
  filename: string,
  content: string,
  type: string,
) => {
  try {
    // Convert the Base64 content to a Blob
    const byteCharacters = atob(content);
    const byteNumbers = Array.from(byteCharacters, (char) =>
      char.charCodeAt(0),
    );
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create an anchor element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Append anchor to body
    a.click(); // Trigger download
    document.body.removeChild(a); // Remove anchor after download

    // Release the object URL after the download
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading the certificate:", error);
  }
};

export {
  downloadBase64,
  getBaseDelete,
  getBaseGet,
  getBasePost,
  getBasePut,
  getBaseQuery,
  getBaseUpdate,
};
