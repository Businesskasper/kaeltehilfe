import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React from "react";
import {
  getBaseQuery,
  toNormalizedDate,
  useCrudHook,
} from "../utils";
import { GeoLocation } from "./geoLocation";

export type Distribution = {
  id: number;
  timestamp: Date;
  bus: {
    id: number;
    registrationNumber: string;
  };
  client: {
    id: number;
    name: string;
  };
  good: {
    id: number;
    name: string;
  };
  quantity: number;
  locationName: string;
  geoLocation: GeoLocation;
};

type DistributionUpdate = {
  quantity: number;
};

type DistributionsQueryParams = {
  from: Date | null;
  to: Date | null;
};

export const useDistributions = (params: DistributionsQueryParams) =>
  useCrudHook<
    Distribution,
    DistributionsQueryParams,
    never,
    DistributionUpdate
  >({
    key: "distributions",
    params,
    additionalInvalidation: ["distributionsPaginated"],
    enabled: !!params?.from && !!params?.to,
  });

export const useDistributionsPaginated = () => {
  const httpGet = getBaseQuery<Distribution>(`/distributions`);

  const queryClient = useQueryClient();

  // Track empty results to stop pagination
  const emptyPageCountRef = React.useRef(0);

  const now = new Date();
  const oneHourAhead = new Date(now.setHours(now.getHours() + 1));
  const oneMonthBefore = toNormalizedDate(
    new Date(new Date(now).setMonth(now.getMonth() - 1).valueOf()),
  )!;

  const queryDistributionsPaginated = useInfiniteQuery<
    Distribution[],
    Error,
    InfiniteData<Distribution>,
    ["distributionsPaginated"],
    { from: Date; to: Date }
  >(
    {
      queryKey: ["distributionsPaginated"],
      queryFn: (params) => httpGet(params.signal, params.pageParam),
      initialPageParam: {
        from: oneMonthBefore,
        to: oneHourAhead,
      },
      getNextPageParam: (lastPage, _allPages, lastPageParams) => {
        // If last page returned no data, increase the emptyPageCountRef counter
        if (!lastPage || lastPage?.length === 0) {
          emptyPageCountRef.current++;
        } else {
          emptyPageCountRef.current = 0; // Reset if we have data
        }

        // Stop fetching if the last 3 pages yielded no results
        if (emptyPageCountRef.current >= 3) {
          return undefined; // Return undefined to stop fetching more pages
        }

        // Calculate the next pages "from" and "to" date range
        const to = lastPageParams.from;
        const from = new Date(
          new Date(to).setMonth(to.getMonth() - 1).valueOf(),
        );
        return {
          from,
          to,
        };
      },
    },
    queryClient,
  );

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["distributionsPaginated"],
    });
  };

  return { queryDistributionsPaginated, invalidate };
};
