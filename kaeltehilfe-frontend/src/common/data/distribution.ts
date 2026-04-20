import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React from "react";
import { getBaseQuery, toDate, toNormalizedDate, useCrudHook } from "../utils";
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
    transformer: { timestamp: (value) => toDate(value)! },
    additionalInvalidation: ["distributionsPaginated"],
    enabled: !!params?.from && !!params?.to,
  });
