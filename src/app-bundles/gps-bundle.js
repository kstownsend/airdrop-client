export default {
  name: "gpsLayer",

  state: {
    myLocation: null,
  },

  getMyLocation: (state) => state.gpsLayer.myLocation,

  getMyLocationAsGeoJSON: (state) => {
    const myLocation = state.gpsLayer.myLocation;
    if (!myLocation) return null;
    const coords = myLocation;
    return {
      type: "Point",
      coordinates: coords,
    };
  },

  broadcastLocationChange:
    () =>
    ({ store }) => {
      const socket = store.getSocket();
      const myLocation = store.getMyLocation();
      if (!myLocation) return;
      socket.send(
        JSON.stringify({
          type: "LOCATION_UPDATE",
          payload: {
            position: myLocation,
          },
        })
      );
    },

  trackLocation:
    () =>
    ({ store, set }) => {
      if ("geolocation" in navigator) {
        let posId = 0;
        navigator.geolocation.watchPosition(
          (position) => {
            console.log("position", posId);
            const { latitude, longitude } = position.coords;
            const coords = [longitude, latitude];
            set({
              myLocation: coords,
            });
            store.broadcastLocationChange();
            posId++;
          },
          console.error,
          { enableHighAccuracy: true }
        );
      }
    },

  init: ({ store }) => {
    store.on("map-created", store.trackLocation);
  },
};
