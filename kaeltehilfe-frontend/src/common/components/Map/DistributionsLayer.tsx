import L from "leaflet";
import React from "react";
import { useMapEvent } from "react-leaflet";
import MarkerClusterGroup, {
  MarkerClusterGroupProps,
} from "react-leaflet-markercluster";
import { DistributionFlag, FitBoundsButton } from ".";
import { Distribution, GeoLocation } from "../../data";
import { groupBy } from "../../utils";
import { useMarkerRegistry } from "./mapUtils";

import "./Map.scss";

const colorSets = {
  RED: ["#E46450", "#A51E0F"],
  // BLUE: ["#3f93cf", "#3882b6"],
  // GREEN: ["#4CAF50", "#357a38"],
  CYAN: ["#00FFFF", "#00E0E0"],
  ORANGE: ["#F59E0B", "#D97706"],
} satisfies { [key: string]: [string, string] };

type DistributionsLayerProps = {
  distributions: Array<Distribution>;
  onClusterClick?: () => void;
  focusedGeoLocation?: GeoLocation;
  resetFocusedGeoLocation: () => void;
};

const getGeoLocation = (d: Distribution) => d.geoLocation;

export const DistributionsLayer = ({
  onClusterClick,
  distributions,
  focusedGeoLocation,
  resetFocusedGeoLocation,
}: DistributionsLayerProps) => {
  const dateDistsByGeoLocation = React.useMemo(
    () => groupBy(distributions, getGeoLocation),
    [distributions],
  );

  const geoLocations = Array.from(dateDistsByGeoLocation.keys());

  // Reset cluster ref when date changed to avoid overlaps with same geo locations
  const { getMapEntry, tryFocus, onIconCreate, getFlagRef, registryRef } =
    useMarkerRegistry({
      data: distributions,
      getGeoLocation,
    });

  // TODO: not sure if necessary
  // Could avoid problems when the layer is rerendered(?)
  useMapEvent("moveend", () => {
    resetFocusedGeoLocation();
  });

  // Go to marker after distribution has been selected
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
        // Let the marker registry handle cluster and marker registrations
        onIconCreate(cluster);

        // Collect total supplied client count to display in the cluster icon
        const childMarkers = cluster.getAllChildMarkers();
        const div = document.createElement("div");
        const span = document.createElement("span");
        div.appendChild(span);

        const totalSuppliedClientIds = new Array<number>();
        for (const childMarker of childMarkers) {
          const childLatLng = childMarker.getLatLng();
          const clusterAndMarker = getMapEntry(childLatLng);
          totalSuppliedClientIds.push(
            ...(clusterAndMarker?.data || []).map((d) => d.client.id),
          );
        }
        const totalChildCount = Array.from(
          new Set(totalSuppliedClientIds),
        ).length;

        let className = "marker-cluster marker-cluster-";
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
    [getMapEntry, onClusterClick, onIconCreate],
  );

  return (
    <>
      <FitBoundsButton registry={registryRef.current} />
      <MarkerClusterGroup {...clusterOptions}>
        {geoLocations.map((geoLocation) => {
          const distributions = dateDistsByGeoLocation.get(geoLocation);
          if (!distributions || distributions.length === 0) return null;

          const clientCount = Array.from(
            groupBy(distributions, (d) => d.client.id).keys(),
          ).length;

          return (
            <DistributionFlag
              colorSet={colorSets.RED}
              count={clientCount}
              distributions={distributions}
              key={JSON.stringify(geoLocation)}
              // Set marker and cluster in registry to be able to open popup and spiderfy later
              ref={getFlagRef(geoLocation)}
            />
          );
        })}
      </MarkerClusterGroup>
    </>
  );
};
