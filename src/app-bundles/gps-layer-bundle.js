import { Feature } from "ol";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Fill, Stroke, Icon, Text } from "ol/style";
import * as proj from "ol/proj";
import { Point } from "ol/geom";

// eslint-disable-next-line react-hooks/rules-of-hooks
proj.useGeographic();

export default {
  name: "gpsLayer",

  state: {
    layer: null,
    myLocation: null,
  },

  getGpsLayer: (state) => state.gpsLayer.layer,

  getMyLocation: (state) => state.gpsLayer.myLocation,

  broadcastLocationChange:
    () =>
    ({ store }) => {
      const socket = store.getSocket();
      const myLocation = store.getMyLocation();
      if (!myLocation) return;
      const coords = myLocation.getGeometry().getCoordinates();
      socket.send(
        JSON.stringify({
          type: "LOCATION_UPDATE",
          payload: {
            position: coords,
          },
        })
      );
    },

  createGpsLayer:
    () =>
    ({ store, set }) => {
      const username = store.getUsername();
      const map = store.getMap();

      const layer = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
          image: new Icon({
            src: `http://localhost:3000/avatars/${username}.png`,
            scale: 0.7,
            anchor: [0.5, 0.8],
          }),
          text: new Text({
            text: `@${username}`,
            font: "bold italic 12px sans-serif",
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
        }),
      });

      const myLocation = new Feature();
      layer.getSource().addFeature(myLocation);

      if ("geolocation" in navigator) {
        console.log("geolocation available, starting watch");
        navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const coords = [longitude, latitude];
            myLocation.setGeometry(new Point(coords));
            map.getView().fit(layer.getSource().getExtent(), { maxZoom: 18 });
            store.broadcastLocationChange();
          },
          console.error,
          { enableHighAccuracy: true }
        );
      }

      map.addLayer(layer);

      set({ layer: layer, myLocation: myLocation });
    },

  init: ({ store }) => {
    store.on("map-created", store.createGpsLayer);
  },
};
