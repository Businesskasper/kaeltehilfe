import { useCrudHook } from "../utils";
import { GeoLocation } from "./geoLocation";

export type Comment = {
  id: number;
  text: string;
  isPinned: boolean;
  geoLocation: GeoLocation | null;
  locationName: string | null;
  displayName: string;
  addOn: Date;
};

type CommentCreate = {
  text: string;
  geoLocation: GeoLocation | null;
  locationName: string | null;
  displayName: string;
  isPinned: boolean;
};

type CommentUpdate = {
  text?: string;
  isPinned?: boolean;
};

type CommentsQueryParams = {
  from: Date | null;
  to: Date | null;
};

export const useComments = (params: CommentsQueryParams) =>
  useCrudHook<Comment, CommentsQueryParams, CommentCreate, CommentUpdate>({
    key: "comments",
    params,
    enabled:
      params.from === null && params.to === null
        ? true
        : !!params.from && !!params.to,
  });
