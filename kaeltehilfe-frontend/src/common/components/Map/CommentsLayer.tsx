import L from "leaflet";
import React from "react";
import { Popup, useMapEvent } from "react-leaflet";
import MarkerClusterGroup, {
  MarkerClusterGroupProps,
} from "react-leaflet-markercluster";
import { Flag } from ".";
import { Comment, GeoLocation } from "../../data";
import { formatDateTime } from "../../utils";
import { KeyedMarkerRegistry, useMarkerRegistry } from "./mapUtils";

import "./Map.scss";

const COMMENT_COLOR_SET: [string, string] = ["#818CF8", "#4F46E5"];

type CommentsLayerProps = {
  comments: Array<Comment>;
  focusedGeoLocation?: GeoLocation;
  resetFocusedGeoLocation: () => void;
  registryRef?: React.MutableRefObject<KeyedMarkerRegistry<unknown>>;
};

const getGeoLocation = (c: Comment) => c.geoLocation!;

export const CommentsLayer = ({
  comments,
  focusedGeoLocation,
  resetFocusedGeoLocation,
  registryRef: externalRegistryRef,
}: CommentsLayerProps) => {
  const commentsWithLocation = React.useMemo(
    () => comments.filter((c) => c.geoLocation !== null),
    [comments],
  );

  const { getMapEntry, tryFocus, onIconCreate, getFlagRef } =
    useMarkerRegistry({
      data: commentsWithLocation,
      getGeoLocation,
      registryRef: externalRegistryRef,
    });

  useMapEvent("moveend", () => {
    resetFocusedGeoLocation();
  });

  React.useEffect(() => {
    focusedGeoLocation && tryFocus(focusedGeoLocation);
  }, [focusedGeoLocation, tryFocus]);

  const clusterOptions = React.useMemo<MarkerClusterGroupProps>(
    () => ({
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 50,
      maxClusterRadius: (zoom: number) => {
        if (zoom <= 10) return 70;
        if (zoom <= 15) return 60;
        if (zoom <= 18) return 40;
        if (zoom <= 19) return 30;
        if (zoom === 20) return 20;
        return 10;
      },
      disableClusteringAtZoom: 21,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyDistanceMultiplier: 1.5,
      iconCreateFunction: (cluster) => {
        onIconCreate(cluster);

        const childMarkers = cluster.getAllChildMarkers();
        const div = document.createElement("div");
        const span = document.createElement("span");
        div.appendChild(span);

        let totalCount = 0;
        for (const childMarker of childMarkers) {
          const childLatLng = childMarker.getLatLng();
          const entry = getMapEntry(childLatLng);
          totalCount += entry?.data?.length || 0;
        }

        let className = "marker-cluster comment-cluster comment-cluster-";
        if (totalCount < 3) {
          className += "small";
        } else if (totalCount < 10) {
          className += "medium";
        } else {
          className += "large";
        }

        span.innerText = totalCount.toString();

        return L.divIcon({
          html: div,
          className,
          iconSize: new L.Point(30, 30),
        });
      },
    }),
    [getMapEntry, onIconCreate],
  );

  return (
    <MarkerClusterGroup {...clusterOptions}>
      {commentsWithLocation.map((comment) => (
        <CommentFlag
          key={comment.id}
          comment={comment}
          ref={getFlagRef(comment.geoLocation!)}
        />
      ))}
    </MarkerClusterGroup>
  );
};

type CommentFlagProps = {
  comment: Comment;
};

const CommentFlag = React.forwardRef<L.Marker, CommentFlagProps>(
  ({ comment }, ref) => {
    const { geoLocation } = comment;

    return !geoLocation ? (
      <></>
    ) : (
      <Flag
        lat={geoLocation.lat}
        lng={geoLocation.lng}
        height={60}
        width={35}
        className="numbered-distribution-marker"
        ref={ref}
        popup={<CommentFlagPopup comment={comment} />}
        marker={<CommentMarker colorSet={COMMENT_COLOR_SET} height={60} />}
      />
    );
  },
);

const CommentFlagPopup = ({ comment }: { comment: Comment }) => {
  return (
    <Popup
      autoPan={false}
      keepInView={false}
      closeButton
      autoPanPaddingBottomRight={[100, 100]}
      offset={[0, -55]}
      maxWidth={400}
    >
      <div
        style={{ fontSize: "0.9rem" }}
        // Comment text is HTML produced by the Tiptap rich text editor
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: comment.text }}
      />
      <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "gray" }}>
        {comment.displayName}
        {comment.locationName ? ` · ${comment.locationName}` : ""}
        {" · "}{formatDateTime(comment.addOn)}
      </div>
    </Popup>
  );
};

type CommentMarkerProps = {
  height?: number | string;
  colorSet: [string, string];
};

const CommentMarker = ({ height = 60, colorSet }: CommentMarkerProps) => {
  return (
    <svg
      height={height}
      width={35}
      preserveAspectRatio="xMidYMid meet"
      className="comment-marker"
      viewBox="0 0 35 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.5 0.5C26.8901 0.5 34.4997 8.08181 34.5 17.4365C34.5 19.7436 33.4399 23.5301 31.7969 27.9785C30.1629 32.4023 27.9808 37.4074 25.7959 42.1201C23.6116 46.8316 21.427 51.2441 19.7881 54.4785C18.9689 56.0951 18.2863 57.4172 17.8086 58.335C17.694 58.5551 17.5901 58.7518 17.5 58.9238C17.4099 58.7518 17.306 58.5551 17.1914 58.335C16.7137 57.4172 16.0311 56.0951 15.2119 54.4785C13.573 51.2441 11.3884 46.8316 9.2041 42.1201C7.01921 37.4074 4.83709 32.4023 3.20312 27.9785C1.56008 23.5301 0.5 19.7436 0.5 17.4365C0.500262 8.08181 8.10994 0.5 17.5 0.5Z"
        fill={colorSet[0]}
        stroke={colorSet[1]}
      />
      {/* Speech bubble icon */}
      <path
        d="M10 12h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-6l-3 3-3-3H10a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z"
        fill="white"
      />
    </svg>
  );
};
