import { Feature } from "ol";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Fill, Stroke, Icon, Text } from "ol/style";
import { Point } from "ol/geom";

// eslint-disable-next-line no-undef
const apiRoot = __API_ROOT__;

// utility function to create a player feature
function createPlayerFeature(player) {
  const { username, score, position } = player;
  const feature = new Feature({
    geometry: new Point(position),
  });
  feature.set("username", username);
  feature.set("score", score);
  return feature;
}

export default {
  name: "players",

  state: {
    layer: null,
    players: {},
  },

  getPlayersLayer: (state) => state.players.layer,

  getPlayers: (state) => state.players.players,

  getScores: (state) => state.players.scores,

  createPlayersLayer:
    () =>
    ({ store, set }) => {
      const map = store.getMap();
      const existingLayer = store.getPlayersLayer();
      if (existingLayer) return;

      const layer = new VectorLayer({
        source: new VectorSource(),
        style: (f) => {
          const username = f.get("username");
          const score = f.get("score");
          return new Style({
            image: new Icon({
              src: `${apiRoot}/avatars/${username}.png`,
              scale: 0.7,
              anchor: [0.5, 0.8],
            }),
            text: new Text({
              text: `@${username}: ${score}`,
              font: "bold italic 16px sans-serif",
              offsetY: -45,
              overflow: true,
              fill: new Fill({
                color: "#fff",
              }),
              stroke: new Stroke({
                color: "#000",
                width: 3,
              }),
            }),
          });
        },
      });

      map.addLayer(layer);
      set({ layer });
    },

  loadPlayers:
    () =>
    ({ store, set, fire }) => {
      const token = store.getToken();
      const joinCode = store.getJoinedGame();
      if (!token || !joinCode) return null;
      fetch(`${apiRoot}/games/${joinCode}/players`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          } else {
            throw new Error("Failed to load players");
          }
        })
        .then((data) => {
          set({
            players: data
              .map((p) => {
                if (!p.position) return null;
                return {
                  ...p,
                  position: p.position.split(",").map(parseFloat),
                };
              })
              .filter((p) => !!p)
              .reduce((acc, p) => {
                const { username } = p;
                acc[username] = createPlayerFeature(p);
                return acc;
              }, {}),
          });
          fire("players-loaded");
        });
    },

  addPlayersToMap:
    () =>
    ({ store }) => {
      const players = store.getPlayers();
      const layer = store.getPlayersLayer();
      const features = Object.values(players);
      layer.getSource().addFeatures(features);
    },

  updatePlayerLocation:
    (e) =>
    ({ store, set }) => {
      // @TODO update the player feature, or add it to the map if it does not already exist
      console.log("need to update", e.detail);
    },

  init: ({ store }) => {
    store.on("map-created", store.createPlayersLayer);
    store.on("game-joined", store.loadPlayers);
    store.on("players-loaded", store.addPlayersToMap);
    store.on("user-location-update", store.updatePlayerLocation);
    store.on("prize-claimed", store.updatePlayerLocation);
  },
};
