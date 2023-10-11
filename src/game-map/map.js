import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { OSM } from "ol/source";
import * as proj from "ol/proj";
import createGpsLayer from "./gps-layer";

// eslint-disable-next-line react-hooks/rules-of-hooks
proj.useGeographic();

export default function createMap(options) {
  const map = new Map({
    target: options.target,
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: [-96, 37.8],
      zoom: 5,
    }),
  });
  const gpsLayer = createGpsLayer(map, options);
  map.addLayer(gpsLayer);
  return map;
}
