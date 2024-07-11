import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export type GoodType = "CONSUMABLE" | "CLOTHING" | "FOOD";
export type Good = {
  id: string;
  name?: string;
  description?: string;
  tags: Array<string>;
  goodType?: GoodType;
};

const getGoods = async (abortSignal?: AbortSignal): Promise<Array<Good>> => {
  const response = await axios.get<Array<Good>>("/goods", {
    signal: abortSignal,
  });
  return response.data;
};

const postGood = async (
  good: Good,
  abortSignal?: AbortSignal
): Promise<void> => {
  await axios.post<Good>("/goods", good, { signal: abortSignal });
};

const patchGood = async (
  id: string,
  update: Partial<Good>,
  abortSignal?: AbortSignal
): Promise<void> => {
  await axios.patch<Partial<Good>>(`/goods/${id}`, update, {
    signal: abortSignal,
  });
};

export const useGoods = () => {
  const queryClient = useQueryClient();

  const goods = useQuery({
    queryKey: ["goods"],
    queryFn: ({ signal }) => getGoods(signal),
  });

  const invalidateGoods = queryClient.invalidateQueries({
    queryKey: ["goods"],
  });

  const addGoodMutation = useMutation({
    mutationFn: postGood,
    onSuccess: () => invalidateGoods,
  });

  const updateGoodMutation = useMutation<
    void,
    unknown,
    { id: string; update: Partial<Good> },
    unknown
  >({
    mutationFn: ({ id, update }) => patchGood(id, update),
    onSuccess: () => invalidateGoods,
  });

  return {
    addGoodMutation,
    updateGoodMutation,
    invalidateGoods,
    goods,
  };
};
