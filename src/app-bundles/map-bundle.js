import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { OSM } from "ol/source";
import * as proj from "ol/proj";
proj.useGeographic();

export default {
  name: "map",

  state: {
    map: null,
  },

  getMap: (state) => state.map.map,

  createMap:
    (options) =>
    ({ set, fire }) => {
      const { target, layers = [] } = options;

      const map = new Map({
        target: target,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          ...layers,
        ],
        view: new View({
          center: [-96, 37.8],
          zoom: 5,
        }),
      });
      set({
        map: map,
      });
      fire("map-created");
    },
};
