import L from "leaflet";
import React from "react";
import MarkerClusterGroup, {
  MarkerClusterGroupProps,
} from "react-leaflet-markercluster";
import {
  Distribution,
  GeoLocation,
  useDistribtions,
} from "../../../../common/data";
import { ExistingDistributionFlag } from "./MapControls";

const colorSets = {
  RED: ["#E46450", "#A51E0F"],
  // BLUE: ["#3f93cf", "#3882b6"],
  // GREEN: ["#4CAF50", "#357a38"],
  CYAN: ["#00FFFF", "#00E0E0"],
  ORANGE: ["#F59E0B", "#D97706"],
} satisfies { [key: string]: [string, string] };

export const DistributionsLayer = ({
  onClusterClick,
}: {
  onClusterClick?: () => void;
}) => {
  const now = new Date();
  const queryTo = new Date(now.setHours(23, 59, 59, 999));
  const yesterday = new Date(now.setDate(now.getDate() - 1));
  const queryFrom = new Date(yesterday.setHours(0, 0, 0, 0));
  const {
    query: { data: distributions },
  } = useDistribtions({ from: queryFrom, to: queryTo });

  // Filter distributions with valid geoLocation
  const validDistributions = React.useMemo(
    () =>
      distributions?.filter(
        (
          dist,
        ): dist is Distribution & {
          geoLocation: GeoLocation;
        } => !!dist?.geoLocation,
      ) || [],
    [distributions],
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
        const childCount = cluster.getChildCount();
        let className = "marker-cluster-";

        if (childCount < 3) {
          className += "small";
        } else if (childCount < 10) {
          className += "medium";
        } else {
          className += "large";
        }

        return L.divIcon({
          html: "<div><span>" + childCount + "</span></div>",
          className: "marker-cluster " + className,
          iconSize: new L.Point(40, 40),
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
      {validDistributions.map((dist) => (
        <ExistingDistributionFlag
          colorSet={colorSets.RED}
          lat={dist.geoLocation.lat}
          lng={dist.geoLocation.lng}
          key={dist.id}
        />
      ))}
    </MarkerClusterGroup>
  );
};
