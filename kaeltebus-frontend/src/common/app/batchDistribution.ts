import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getBasePost } from "../utils";
import { Gender } from "./gender";

export type BatchDistribution = {
  locationName: string;
  clients: Array<{
    id?: number;
    name?: string;
    gender: Gender;
    approxAge: number;
  }>;
  goods: Array<{ id: number; quantity: number }>;
};

export const usePostBatchDistribution = () => {
  const httpPost = getBasePost<BatchDistribution>(`/BatchDistributions`);

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
