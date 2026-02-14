import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getBasePost } from "../utils";
import { Gender } from "./gender";
import { GeoLocation } from "./geoLocation";

export type BatchDistribution = {
  locationName: string;
  geoLocation: GeoLocation;
  busRegistrationNumber: string;
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
    onSettled: () => {
      console.log("DEBUG: invalidate from hook");
      invalidateDistributions();
    },
  });

  return post;
};
