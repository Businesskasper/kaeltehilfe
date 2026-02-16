import L from "leaflet";
import React from "react";
import { useMapEvent } from "react-leaflet";
import MarkerClusterGroup, {
  MarkerClusterGroupProps,
} from "react-leaflet-markercluster";
import { Distribution, GeoLocation } from "../../../../common/data";
import {
  compareByDateOnly,
  groupBy,
  useMarkerRegistry,
} from "../../../../common/utils";
import { ExistingDistributionFlag } from "./MapControls";

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
  focusedGeoLocation?: GeoLocation;
  resetFocusedGeoLocation: () => void;
};

const getGeoLocation = (d: Distribution) => d.geoLocation;

export const DistributionsLayer = ({
  onClusterClick,
  distributions,
  selectedDate,
  focusedGeoLocation,
  resetFocusedGeoLocation,
}: DistributionsLayerProps) => {
  const selectedDateDists = React.useMemo(
    () =>
      distributions?.filter(
        (dist) => compareByDateOnly(dist.timestamp, selectedDate) === 0,
      ) || [],
    [distributions, selectedDate],
  );
  const dateDistsByGeoLocation = React.useMemo(
    () => groupBy(selectedDateDists, getGeoLocation),
    [selectedDateDists],
  );

  const geoLocations = Array.from(dateDistsByGeoLocation.keys());

  // Reset cluster ref when date changed to avoid overlaps with same geo locations
  const { getMapEntry, tryFocus, onIconCreate, getFlagRef } = useMarkerRegistry(
    {
      data: selectedDateDists,
      getGeoLocation,
    },
  );

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

        let totalChildCount = 0;
        let className = "marker-cluster marker-cluster-";

        for (const childMarker of childMarkers) {
          const childLatLng = childMarker.getLatLng();
          const clusterAndMarker = getMapEntry(childLatLng);
          if (!clusterAndMarker) continue;
          const clientCount = Array.from(
            groupBy(clusterAndMarker.data, (d) => d?.client.id).keys(),
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
    [getMapEntry, onClusterClick, onIconCreate],
  );

  return (
    <MarkerClusterGroup {...clusterOptions}>
      {geoLocations.map((geoLocation) => {
        const distributions = dateDistsByGeoLocation.get(geoLocation);
        if (!distributions || distributions.length === 0) return null;

        const clientCount = Array.from(
          groupBy(distributions, (d) => d.client.id).keys(),
        ).length;

        return (
          <ExistingDistributionFlag
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
  );
};
