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
      // @TODO send our location to the api and all the other users
    },

  trackLocation:
    () =>
    ({ store, set }) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
          (position) => {
            // @TODO do something with this position
            console.log(position);
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
