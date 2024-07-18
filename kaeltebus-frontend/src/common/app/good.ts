import {
  IconProps,
  IconShirt,
  IconToiletPaper,
  IconToolsKitchen2,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ComponentType } from "react";
import { http } from "../utils/http";

const { VITE_API_BASE_URL } = import.meta.env;

export type GoodType = "CONSUMABLE" | "CLOTHING" | "FOOD";

export type Good = {
  id: string;
  name?: string;
  description?: string;
  tags: Array<string>;
  goodType?: GoodType;
};

export const GoodTypeTranslation: {
  [key in GoodType]: { label: string; icon: ComponentType<IconProps> };
} = {
  CLOTHING: {
    label: "Kleidung",
    icon: IconShirt,
  },
  CONSUMABLE: {
    label: "Verbrauchsartikel",
    icon: IconToiletPaper,
  },
  FOOD: {
    label: "Nahrung",
    icon: IconToolsKitchen2,
  },
};

export const getGoods = async (
  abortSignal?: AbortSignal
): Promise<Array<Good>> => {
  const response = await http.get<Array<Good>>("/goods", {
    baseURL: VITE_API_BASE_URL,
    signal: abortSignal,
  });
  return response.data;
};

type GoodPostModel = Omit<Good, "id">;
const postSingleGood = async (
  good: GoodPostModel,
  abortSignal?: AbortSignal
): Promise<void> => {
  await http.post<Good>("/goods", good, {
    baseURL: VITE_API_BASE_URL,
    signal: abortSignal,
  });
};

const patchSingleGood = async (
  id: string,
  update: Partial<Good>,
  abortSignal?: AbortSignal
): Promise<void> => {
  await http.patch<Partial<Good>>(`/goods/${id}`, update, {
    baseURL: VITE_API_BASE_URL,
    signal: abortSignal,
  });
};

const deleteSingleGood = async (
  id: string,
  abortSignal?: AbortSignal
): Promise<void> => {
  await http.delete(`/goods/${id}`, {
    baseURL: VITE_API_BASE_URL,
    signal: abortSignal,
  });
};

export const useGoods = () => {
  const queryClient = useQueryClient();

  const goods = useQuery({
    queryKey: ["goods"],
    queryFn: ({ signal }) => getGoods(signal),
  });

  const invalidateGoods = () =>
    queryClient.invalidateQueries({
      queryKey: ["goods"],
    });

  const addGood = useMutation({
    mutationFn: postSingleGood,
    onSettled: invalidateGoods,
  });

  const updateGood = useMutation<
    void,
    unknown,
    { id: string; update: Partial<Good> },
    unknown
  >({
    mutationFn: ({ id, update }) => patchSingleGood(id, update),
    onSettled: invalidateGoods,
  });

  const deleteGood = useMutation({
    mutationFn: deleteSingleGood,
    onSettled: invalidateGoods,
  });

  return {
    addGood,
    updateGood,
    deleteGood,
    goods,
  };
};
