import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { XYZ } from "ol/source";
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
    ({ store, set, fire }) => {
      const { target, layers = [] } = options;
      const existingMap = store.getMap();
      if (existingMap) return;

      const map = new Map({
        target: target,
        layers: [
          new TileLayer({
            source: new XYZ({
              url: "https://cartodb-basemaps-{a-c}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
            }),
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
