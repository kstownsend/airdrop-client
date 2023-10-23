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
      if (existingMap) {
        existingMap.setTarget(target);
      } else {
        // implement map creation then fire 'map-created' event
      }
    },

  cleanUpMap:
    () =>
    ({ store }) => {
      const map = store.getMap();
      map.setTarget(null);
    },
};
