import { Feature } from "ol";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Fill, Stroke, Icon, Text } from "ol/style";
import * as proj from "ol/proj";
import { Point } from "ol/geom";

// eslint-disable-next-line react-hooks/rules-of-hooks
proj.useGeographic();

// eslint-disable-next-line no-undef
const apiRoot = __API_ROOT__;

export default {
  name: "players",

  state: {
    layer: null,
    players: {},
  },

  getPlayersLayer: (state) => state.players.layer,

  getPlayers: (state) => state.players.players,

  createPlayersLayer:
    () =>
    ({ store, set }) => {
      const map = store.getMap();

      const layer = new VectorLayer({
        source: new VectorSource(),
        style: (f) => {
          const username = f.get("username");
          return new Style({
            image: new Icon({
              src: `${apiRoot}/avatars/${username}.png`,
              scale: 0.7,
              anchor: [0.15, 0.8],
            }),
            text: new Text({
              text: `@${username}`,
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
    ({ store, set }) => {
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
            throw new Error("Failed to load games");
          }
        })
        .then((data) => {
          set({
            players: data
              .map((p) => {
                return {
                  ...p,
                  position: p.position.split(",").map(parseFloat),
                };
              })
              .reduce((acc, p) => {
                const { username } = p;
                const feature = store.createPlayerFeature(p);
                acc[username] = feature;
                return acc;
              }, {}),
          });
        });
    },

  // needs to be outside the store, or just not abstracted
  createPlayerFeature:
    (player) =>
    ({ store }) => {
      const layer = store.getPlayersLayer();
      const src = layer.getSource();
      const { username, score, position } = player;
      const feature = new Feature({
        geometry: new Point(position),
      });
      feature.set("username", username);
      feature.set("score", score);
      src.addFeature(feature);
      return feature;
    },

  updatePlayerLocation:
    (e) =>
    ({ store, set }) => {
      const layer = store.getPlayersLayer();
      const players = store.getPlayers();
      const { username, position } = e.detail;
      const playerFeature = players[username];
      if (!playerFeature) {
        const feature = store.createPlayerFeature(e.detail);
        players[username] = feature;
        set({ players: { ...players } });
      } else {
        playerFeature.setGeometry(new Point(position));
        layer.changed();
      }
    },

  init: ({ store }) => {
    store.on("map-created", store.createPlayersLayer);
    store.on("game-joined", store.loadPlayers);
    store.on("user-location-update", store.updatePlayerLocation);
  },
};
