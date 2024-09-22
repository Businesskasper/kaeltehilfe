import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getBasePost } from "../utils";

export type BatchDistribution = {
  locationName: string;
  clients: Array<{ id?: number; name?: string }>;
  goods: Array<{ id: number; quantity: number }>;
};

export const usePostBatchDistribution = () => {
  const httpPost = getBasePost<BatchDistribution>(`/BatchDistribution`);

  const queryClient = useQueryClient();

  const invalidateDistributions = () =>
    queryClient.invalidateQueries({
      queryKey: ["distributions"],
    });

  const post = useMutation({
    mutationFn: httpPost,
    onSettled: invalidateDistributions,
  });

  return post;
};
