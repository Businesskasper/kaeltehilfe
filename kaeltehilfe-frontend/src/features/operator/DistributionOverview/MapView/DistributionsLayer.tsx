import L from "leaflet";
import React from "react";
import MarkerClusterGroup, {
  MarkerClusterGroupProps,
} from "react-leaflet-markercluster";
import { Distribution, GeoLocation } from "../../../../common/data";
import { compareByDateOnly, groupBy } from "../../../../common/utils";
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
};

export const DistributionsLayer = ({
  onClusterClick,
  distributions,
  selectedDate,
}: DistributionsLayerProps) => {
  // Filter distributions with valid geoLocation
  const distributionsToDisplay = React.useMemo(
    () =>
      distributions?.filter(
        (
          dist,
        ): dist is Distribution & {
          geoLocation: GeoLocation;
        } =>
          !!dist?.geoLocation &&
          compareByDateOnly(dist.timestamp, selectedDate) === 0,
      ) || [],
    [distributions, selectedDate],
  );

  const byGeoLocation = React.useMemo(
    () =>
      groupBy(distributionsToDisplay, (d) =>
        // JSON.stringify({ ...d.geoLocation, clientId: d.client.id }),
        JSON.stringify({ ...d.geoLocation }),
      ),
    [distributionsToDisplay],
  );

  const keys = React.useMemo(
    () => Array.from(byGeoLocation.keys()),
    [byGeoLocation],
  );

  const clusterOptions = React.useMemo<MarkerClusterGroupProps>(
    () => ({
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 50,
      maxClusterRadius: (zoom: number) => {
        if (zoom <= 10) return 70;
        if (zoom <= 15) return 50;
        if (zoom <= 18) return 30;
        if (zoom === 20) return 20;
        return 10;
      },
      disableClusteringAtZoom: 21,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyDistanceMultiplier: 1.5,
      iconCreateFunction: (cluster) => {
        // const childCount = cluster.getChildCount();

        let totalChildCount = 0;
        const childMarkers = cluster.getAllChildMarkers();
        for (const childMarker of childMarkers) {
          const childCount =
            childMarker?.options?.icon?.options?.html?.attributes?.getNamedItem(
              "x-child-count",
            )?.value;
          if (childCount) {
            totalChildCount += Number.parseInt(childCount);
          }
        }

        let className = "marker-cluster-";

        if (totalChildCount < 3) {
          className += "small";
        } else if (totalChildCount < 10) {
          className += "medium";
        } else {
          className += "large";
        }

        return L.divIcon({
          html: "<div><span>" + totalChildCount + "</span></div>",
          className: "marker-cluster " + className,
          iconSize: new L.Point(30, 30),
        });
      },
      eventHandlers: {
        clusterclick: onClusterClick,
      },
    }),
    [onClusterClick],
  );

  return (
    <MarkerClusterGroup {...clusterOptions}>
      {keys.map((geoLocation) => {
        const distributions = byGeoLocation.get(geoLocation);
        if (!distributions || distributions.length === 0) return null;

        const clientCount = Array.from(
          groupBy(distributions, (d) => d.client.id).keys(),
        ).length;

        return (
          <ExistingDistributionFlag
            colorSet={colorSets.RED}
            lat={distributions[0].geoLocation.lat}
            lng={distributions[0].geoLocation.lng}
            // count={distributions.length}
            count={clientCount}
            key={geoLocation}
          />
        );
      })}
    </MarkerClusterGroup>
  );
};
