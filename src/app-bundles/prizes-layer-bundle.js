import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Fill, Stroke, Text } from "ol/style";
import { GeoJSON } from "ol/format";
import { Feature } from "ol";
import circle from "@turf/circle";
import within from "@turf/boolean-within";

// eslint-disable-next-line no-undef
const apiRoot = __API_ROOT__;

function createPrizeFeature(prize, layer, store) {
  // center point of the prize, not actually rendered
  const feature = new GeoJSON().readFeature(prize);
  // timestamp in seconds for our animation
  const dt = 1;

  const prizeAreaFeature = new Feature();
  prizeAreaFeature.setId(prize.properties.id);
  prizeAreaFeature.setProperties(prize.properties);
  prizeAreaFeature.set("value", prize.properties.max_value);
  prizeAreaFeature.set(
    "timer",
    window.setInterval(() => {
      // clear timer when time runs out
      const startTime = prizeAreaFeature.get("startTime");
      const duration = prizeAreaFeature.get("duration") * 1000; // convert seconds to ms
      const maxValue = prizeAreaFeature.get("maxValue");
      const now = new Date();
      const elapsed = now.getTime() - startTime;
      if (elapsed > duration) {
        window.clearInterval(prizeAreaFeature.get("timer"));
        layer.getSource().removeFeature(prizeAreaFeature);
        return;
      }

      // calculate percentage of time elapsed
      const pctT = Math.ceil((elapsed / duration) * 100);

      // calculate new radius based on time elapsed
      const radius = 1 + 0.1 * Math.pow(pctT, 2);

      // calculate new value based on time elapsed
      const value = Math.ceil(
        maxValue * ((100 - 0.01 * Math.pow(pctT, 2)) / 100)
      );

      const prizeArea = circle(feature.getGeometry().getCoordinates(), radius, {
        units: "meters",
      });

      // check if user is within the prize area
      const myLocation = store.getMyLocationAsGeoJSON();
      if (myLocation && within(myLocation, prizeArea)) {
        console.log("You're in the prize area!");
        store.claimPrize(prizeAreaFeature.get("id"));
      }

      prizeAreaFeature.setGeometry(
        new GeoJSON().readGeometry(prizeArea.geometry)
      );
      prizeAreaFeature.set("value", value);
    }, dt * 1000)
  );
  layer.getSource().addFeature(prizeAreaFeature);
}

export default {
  name: "prizes",

  state: {
    layer: null,
  },

  getPrizesLayer: (state) => state.prizes.layer,

  createPrizesLayer:
    () =>
    ({ store, set }) => {
      const map = store.getMap();
      const existingLayer = store.getPrizesLayer();
      if (existingLayer) return;

      // @TODO need to implement a functional style for our prize areas
      const prizeAreaStyle = () => {};

      const layer = new VectorLayer({
        source: new VectorSource(),
        style: prizeAreaStyle,
      });

      map.addLayer(layer);
      set({
        layer,
      });
    },

  loadPrizes:
    () =>
    ({ store }) => {
      const layer = store.getPrizesLayer();
      const token = store.getToken();
      const joinCode = store.getJoinedGame();
      if (!token || !joinCode) return null;
      fetch(`${apiRoot}/games/${joinCode}/prizes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          } else {
            throw new Error("Failed to load prizes");
          }
        })
        .then((data) => {
          data.forEach((prize) => {
            createPrizeFeature(prize, layer, store);
          });
        });
    },

  addPrize:
    (prize) =>
    ({ store }) => {
      const layer = store.getPrizesLayer();
      createPrizeFeature(prize, layer, store);
    },

  clearPrize:
    ({ prizeId }) =>
    ({ store }) => {
      const layer = store.getPrizesLayer();
      const src = layer.getSource();
      const feature = src.getFeatureById(prizeId);
      const timer = feature.get("timer");
      window.clearInterval(timer);
      src.removeFeature(feature);
    },

  claimPrize:
    (prizeId) =>
    ({ store }) => {
      const token = store.getToken();
      const joinCode = store.getJoinedGame();
      if (!token || !joinCode) return null;
      fetch(`${apiRoot}/games/${joinCode}/prizes/${prizeId}/claim`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => {
        if (res.status === 200) {
          console.log("Got it!");
        }
      });
    },

  init: ({ store }) => {
    store.on("map-created", store.createPrizesLayer);
    store.on("game-joined", store.loadPrizes);
    store.on("new-prize-point", (e) => {
      store.addPrize(e.detail);
    });
    store.on("prize-claimed", (e) => {
      store.clearPrize(e.detail);
    });
  },
};
