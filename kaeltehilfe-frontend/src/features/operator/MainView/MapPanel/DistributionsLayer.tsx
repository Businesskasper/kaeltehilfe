import L, { Marker } from "leaflet";
import React from "react";
import { useMap, useMapEvent } from "react-leaflet";
import MarkerClusterGroup, {
  MarkerClusterGroupProps,
} from "react-leaflet-markercluster";
import { Distribution, GeoLocation } from "../../../../common/data";
import { compareByDateOnly, groupBy } from "../../../../common/utils";
import { ExistingDistributionFlag } from "./MapControls";

type Cluster = object & { spiderfy: () => void };
type ClusterAndMarker = {
  distributionIds: Array<number>;
  geoLocation: GeoLocation;
  cluster: Cluster | null;
  marker: Marker | null;
};

const hasParent = (obj: unknown): obj is object & { __parent: object } => {
  return !!obj && typeof obj === "object" && "__parent" in obj;
};

const isCluster = (obj: unknown): obj is Cluster => {
  return !!obj && typeof obj === "object" && "spiderfy" in obj;
};

const colorSets = {
  RED: ["#E46450", "#A51E0F"],
  // BLUE: ["#3f93cf", "#3882b6"],
  // GREEN: ["#4CAF50", "#357a38"],
  CYAN: ["#00FFFF", "#00E0E0"],
  ORANGE: ["#F59E0B", "#D97706"],
} satisfies { [key: string]: [string, string] };

type DistributionsLayerProps = {
  selectedDate: Date;
  distributions?: Array<Distribution>;
  onClusterClick?: () => void;
  focusedGeoLocation?: string;
  resetFocusedGeoLocation: () => void;
};

export const DistributionsLayer = ({
  onClusterClick,
  distributions,
  selectedDate,
  focusedGeoLocation,
  resetFocusedGeoLocation,
}: DistributionsLayerProps) => {
  const selectedDateByGeoLocation = React.useMemo(() => {
    const selectedDateDistributions =
      distributions?.filter(
        (dist) => compareByDateOnly(dist.timestamp, selectedDate) === 0,
      ) || [];
    return groupBy(selectedDateDistributions, (d) =>
      JSON.stringify(d.geoLocation),
    );
  }, [distributions, selectedDate]);

  const keys = Array.from(selectedDateByGeoLocation.keys());

  const clusterRef = React.useRef<{ [key: string]: ClusterAndMarker }>({});
  const getClusterAndMarker = (focusedGeoLocation: string) =>
    clusterRef.current[focusedGeoLocation];
  const map = useMap();

  // Reset cluster ref when date changed to avoid overlaps with same geo locations
  React.useEffect(() => {
    clusterRef.current = {};
    const keys = Array.from(selectedDateByGeoLocation.keys());
    for (const geoLocationKey of keys) {
      const distributions = selectedDateByGeoLocation.get(geoLocationKey);
      if (!distributions || distributions.length === 0) continue;
      clusterRef.current[geoLocationKey] = {
        geoLocation: distributions[0].geoLocation,
        cluster: null,
        distributionIds: distributions.map((d) => d.id),
        marker: null,
      };
    }
  }, [selectedDateByGeoLocation]);

  // TODO: not sure if necessary
  // Could avoid problems when the layer is rerendered(?)
  useMapEvent("moveend", () => {
    resetFocusedGeoLocation();
  });

  // Go to marker after distribution has been selected
  React.useEffect(() => {
    if (!focusedGeoLocation) return;

    const clusterAndMarker = getClusterAndMarker(focusedGeoLocation);
    if (clusterAndMarker?.marker) {
      const { lat, lng } = clusterAndMarker.marker.getLatLng();
      map.setView(
        // Slight offset to avoid overlap with the current location marker
        { lat: lat - 0.00005, lng: lng - 0.00005 },
        map.getMaxZoom(),
        { animate: false },
      );
    }
    setTimeout(() => {
      const isRendered = map.hasLayer(clusterAndMarker.marker as L.Layer);
      if (!isRendered) {
        clusterAndMarker?.cluster?.spiderfy();
      }
      clusterAndMarker?.marker?.openPopup();
    }, 400);

    // const spiderfyAndOpen = () => {
    //   const clusterAndMarker = getMarkerAndCluster(focusedGeoLocation);
    //   const isRendered = map.hasLayer(clusterAndMarker.marker as L.Layer);
    //   if (!isRendered) {
    //     clusterAndMarker?.cluster?.spiderfy();
    //   }
    //   clusterAndMarker?.marker?.openPopup();
    // };

    // const clusterAndMarker = getMarkerAndCluster(focusedGeoLocation);
    // if (clusterAndMarker?.marker) {
    //   const { lat, lng } = clusterAndMarker.marker.getLatLng();
    //   map.setView(
    //     // Slight offset to avoid overlap with the current location marker
    //     { lat: lat - 0.00005, lng: lng - 0.00005 },
    //     map.getMaxZoom(),
    //     { animate: false },
    //   );
    // }

    // setTimeout(() => {
    //   spiderfyAndOpen();
    // }, 400);

    // setTimeout(() => {
    //   spiderfyAndOpen();
    // }, 600);
  }, [focusedGeoLocation, map]);

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
        const childMarkers = cluster.getAllChildMarkers();

        const div = document.createElement("div");
        const span = document.createElement("span");
        div.appendChild(span);

        let totalChildCount = 0;
        let className = "marker-cluster marker-cluster-";

        for (const childMarker of childMarkers) {
          const childLatLng = childMarker.getLatLng();

          const childGeoLocationKey = JSON.stringify(childLatLng);
          const clusterAndMarker = clusterRef.current[childGeoLocationKey];
          if (!clusterAndMarker) continue;

          // Update cluster and marker as safe guard in case anything changed
          clusterAndMarker.cluster = cluster;
          clusterAndMarker.marker = childMarker;

          // Collect total supplied client count to display in the cluster icon
          const dists = clusterAndMarker.distributionIds.map((id) =>
            distributions?.find((d) => d.id === id),
          );
          const clientCount = Array.from(
            groupBy(dists, (d) => d?.client.id).keys(),
          ).length;
          totalChildCount += clientCount;
        }

        if (totalChildCount < 3) {
          className += "small";
        } else if (totalChildCount < 10) {
          className += "medium";
        } else {
          className += "large";
        }

        span.innerText = totalChildCount.toString();

        return L.divIcon({
          html: div,
          className,
          iconSize: new L.Point(30, 30),
        });
      },
      eventHandlers: {
        clusterclick: onClusterClick,
      },
    }),
    [distributions, onClusterClick],
  );

  return (
    <MarkerClusterGroup {...clusterOptions}>
      {keys.map((geoLocationKey) => {
        const distributions = selectedDateByGeoLocation.get(geoLocationKey);
        if (!distributions || distributions.length === 0) return null;

        const clientCount = Array.from(
          groupBy(distributions, (d) => d.client.id).keys(),
        ).length;

        return (
          <ExistingDistributionFlag
            colorSet={colorSets.RED}
            count={clientCount}
            distributions={distributions}
            key={geoLocationKey}
            ref={(m) => {
              const clm = clusterRef.current[geoLocationKey];
              if (!clm) return;
              clm.marker = m;
              if (hasParent(m) && isCluster(m.__parent)) {
                clm.cluster = m.__parent;
              }
            }}
          />
        );
      })}
    </MarkerClusterGroup>
  );
};
