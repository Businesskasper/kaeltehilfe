import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const { VITE_API_BASE_URL } = import.meta.env;

export type Client = {
  name: string;
};

const getClients = async (
  abortSignal?: AbortSignal
): Promise<Array<Client>> => {
  const response = await axios.get<Array<Client>>("/clients", {
    baseURL: VITE_API_BASE_URL,
    signal: abortSignal,
  });

  return response.data;
};

const postClient = async (
  client: Client,
  abortSignal?: AbortSignal
): Promise<void> => {
  await axios.post<Client>("/clients", client, {
    baseURL: VITE_API_BASE_URL,
    signal: abortSignal,
  });
};

const patchClient = async (
  id: string,
  update: Partial<Client>,
  abortSignal?: AbortSignal
): Promise<void> => {
  await axios.patch<Partial<Client>>(`/clients/${id}`, update, {
    baseURL: VITE_API_BASE_URL,
    signal: abortSignal,
  });
};

export const useClients = () => {
  const queryClient = useQueryClient();

  const clients = useQuery({
    queryKey: ["clients"],
    queryFn: ({ signal }) => getClients(signal),
  });

  const invalidateClients = () =>
    queryClient.invalidateQueries({
      queryKey: ["clients"],
    });

  const addClientMutation = useMutation({
    mutationFn: postClient,
    onSuccess: invalidateClients,
  });

  const updateClientMutation = useMutation<
    void,
    unknown,
    { id: string; update: Partial<Client> },
    unknown
  >({
    mutationFn: ({ id, update }) => patchClient(id, update),
    onSuccess: () => invalidateClients,
  });

  return {
    addClientMutation,
    updateClientMutation,
    invalidateClients,
    clients,
  };
};
