import { Feature } from "ol";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Fill, Stroke, Icon, Text } from "ol/style";
import * as proj from "ol/proj";
import { Point } from "ol/geom";

// eslint-disable-next-line react-hooks/rules-of-hooks
proj.useGeographic();

// send position to the api via our web socket so that other players can see it

export default function createGpsLayer(map, options) {
  const gpsLayer = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
      image: new Icon({
        src: `http://localhost:3000/avatars/${options.username}.png`,
        scale: 0.7,
        anchor: [0.5, 0.8],
      }),
      text: new Text({
        text: `@${options.username}`,
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
  gpsLayer.getSource().addFeature(myLocation);

  if ("geolocation" in navigator) {
    console.log("geolocation available, starting watch");
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = [longitude, latitude];
        myLocation.setGeometry(new Point(coords));
        map.getView().fit(gpsLayer.getSource().getExtent(), { maxZoom: 18 });
      },
      console.error,
      { enableHighAccuracy: true }
    );
  }

  return gpsLayer;
}
