import L, { Marker } from "leaflet";
import React from "react";
import { useMap, useMapEvent } from "react-leaflet";
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
  focusedDistributionId?: number;
  resetFocusedDistributionId?: () => void;
};

export const DistributionsLayer = ({
  onClusterClick,
  distributions,
  selectedDate,
  focusedDistributionId,
  resetFocusedDistributionId,
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

  useMapEvent("moveend", () => {
    resetFocusedDistributionId?.();
  });
  type ClusterAndMarker = {
    distributionIds: Array<number>;
    geoLocation: GeoLocation;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cluster?: any;
    marker: Marker | null;
  };
  const clusterRef = React.useRef<Array<ClusterAndMarker>>([]);
  const getMarkerAndCluster = (distributionId: number) =>
    clusterRef.current.find((c) => c.distributionIds.includes(distributionId));

  const map = useMap();

  React.useEffect(() => {
    if (!focusedDistributionId) return;
    const clusterAndMarker = getMarkerAndCluster(focusedDistributionId);
    if (clusterAndMarker?.marker) {
      map.setView(
        map.containerPointToLatLng(
          map
            .latLngToContainerPoint(clusterAndMarker.marker.getLatLng())
            .subtract(new L.Point(20, 20)),
        ),
        map.getMaxZoom(),
      );
      clusterAndMarker.marker.openPopup();
    }
    if (clusterAndMarker?.cluster) {
      clusterAndMarker.cluster.zoomToBounds();
      setTimeout(() => {
        const clusterAndMarker = getMarkerAndCluster(focusedDistributionId);
        clusterAndMarker?.cluster?.spiderfy();
      }, 400);
    }
  }, [focusedDistributionId, map]);

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
        const childMarkers = cluster.getAllChildMarkers();
        for (const marker of childMarkers) {
          const { lat, lng } = marker.getLatLng();
          const markerAndCluster = {
            geoLocation: { lat, lng },
            cluster,
            marker,
            distributionIds: [],
          };
          const existing = clusterRef.current.find(
            (c) => c.geoLocation.lat === lat && c.geoLocation.lng === lng,
          );
          if (!existing) {
            clusterRef.current.push(markerAndCluster);
          } else {
            existing.cluster = cluster;
            existing.marker = marker;
          }
        }

        let totalChildCount = 0;
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

        const clms = new Array<ClusterAndMarker>();

        for (const dist of distributions) {
          let clusterAndMarker = clusterRef.current.find(
            (c) =>
              c.geoLocation.lat === dist.geoLocation.lat &&
              c.geoLocation.lng === dist.geoLocation.lng,
          );
          if (!clusterAndMarker) {
            clusterAndMarker = {
              geoLocation: dist.geoLocation,
              cluster: null,
              marker: null,
              distributionIds: [],
            };
            clusterRef.current.push(clusterAndMarker);
          }

          const existingDist = clusterAndMarker.distributionIds.indexOf(
            dist.id,
          );
          if (existingDist === -1) {
            clusterAndMarker.distributionIds.push(dist.id);
          }
          clms.push(clusterAndMarker);
        }

        return (
          <ExistingDistributionFlag
            colorSet={colorSets.RED}
            lat={distributions[0].geoLocation.lat}
            lng={distributions[0].geoLocation.lng}
            count={clientCount}
            key={geoLocation}
            ref={(m) => {
              for (const clm of clms) {
                clm.marker = m;
              }
            }}
          />
        );
      })}
    </MarkerClusterGroup>
  );
};
