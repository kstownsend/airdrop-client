import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Stroke, Fill, Style } from "ol/style";
import { GeoJSON } from "ol/format";

export default {
  name: "boundary",

  state: {
    layer: null,
  },

  getBoundaryLayer: (state) => state.boundary.layer,

  createBoundaryLayer:
    () =>
    ({ store, set }) => {
      console.log("should create the boundary layer");
      const map = store.getMap();
      const existingLayer = store.getBoundaryLayer();
      if (existingLayer) return;

      const layer = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
          stroke: new Stroke({
            color: "rgba(148, 12, 201)",
            lineDash: [4],
            width: 3,
          }),
          fill: new Fill({
            color: "rgba(148, 12, 201, 0.05)",
          }),
        }),
      });

      map.addLayer(layer);
      set({ layer });
    },

  setBoundary:
    () =>
    ({ store }) => {
      console.log("should add the boundary");
      const map = store.getMap();
      const layer = store.getBoundaryLayer();
      const src = layer.getSource();
      const games = store.getGamesByJoinCode();
      const joinedGame = store.getJoinedGame();
      const game = games[joinedGame];
      const boundary = new GeoJSON().readFeatures(JSON.parse(game.geometry));
      src.addFeatures(boundary);
      console.log(src.getExtent());
      map
        .getView()
        .fit(src.getExtent(), {
          duration: 1000,
          callback: () => console.log("done"),
        });
    },

  init: ({ store }) => {
    store.on("map-created", store.createBoundaryLayer);
    store.on("game-joined", store.setBoundary);
  },
};
