import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getConfig } from "../../config";
import { http } from "../utils";

export type Address = {
  street?: string;
  housenumber?: string;
  city?: string;
  postcode?: string;
  distance?: number;
};

type AddressQueryParams = { lat?: number; lng?: number };
export const useAddressLookup = ({ lat, lng }: AddressQueryParams) => {
  const getAddress = async (abortSignal?: AbortSignal) => {
    if (lat === undefined || lng === undefined) return undefined;
    const response = await http.get<Address>(`address`, {
      baseURL: getConfig().API_GEO_URL,
      signal: abortSignal,
      params: { lat, lng },
    });
    return response.data;
  };

  const queryClient = useQueryClient();

  const query = useQuery<
    Address | undefined,
    Error,
    Address,
    ["address", number | undefined, number | undefined]
  >(
    {
      queryKey: ["address", lat, lng],
      queryFn: async ({ signal }) => await getAddress(signal),
      refetchOnWindowFocus: "always",
      refetchOnReconnect: "always",
    },
    queryClient,
  );

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["address", lat, lng],
      refetchType: "all",
      stale: true,
      type: "all",
    });
    queryClient.refetchQueries();
  };

  return {
    query,
    invalidate,
  };
};
