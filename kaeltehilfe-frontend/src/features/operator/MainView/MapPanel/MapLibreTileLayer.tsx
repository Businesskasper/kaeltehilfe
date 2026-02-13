import "@maplibre/maplibre-gl-leaflet";
import { type LayerProps } from "@react-leaflet/core";
import L from "leaflet";

export interface MapLibreTileLayerProps
  extends L.LeafletMaplibreGLOptions, LayerProps {
  url: string;
  attribution: string;
}

// export const MapLibreTileLayer = createTileLayerComponent<
//   L.MaplibreGL,
//   MapLibreTileLayerProps
// >(
//   function createTileLayer({ url, attribution, ...options }, context) {
//     const layer = L.maplibreGL(
//       { style: url, attributionControl: { customAttribution: attribution } },
//       //   withPane(options, context),
//     );
//     return createElementObject(layer, context);
//   },
//   function updateTileLayer(layer, props, prevProps) {
//     updateGridLayer(layer as any, props as any, prevProps);

//     const { url, attribution } = props;
//     if (url != null && url !== prevProps.url) {
//       layer.getMaplibreMap().setStyle(url);
//     }

//     if (attribution != null && attribution !== prevProps.attribution) {
//       layer.options.attribution = attribution;
//     }
//   },
// );
