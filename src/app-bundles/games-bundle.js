const apiUrl = import.meta.env.VITE_API_URL;

export default {
  name: "games",

  state: {
    games: [],
    socket: null,
  },

  getGames: (state) => state.games.games,

  getSocket: (state) => state.games.socket,

  loadGames: (store) => {
    const token = store.getToken();
    if (!token) return null;
    return fetch(`${apiUrl}/games`, {
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
        return {
          games: data,
        };
      });
  },

  joinGame: (store, game) => {
    const { join_code } = game;
    const token = store.getToken();
    fetch(`${apiUrl}/auth/ws-token?joinCode=${join_code}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((data) => {
        const socketToken = data.wsToken;
        console.log("socket token", socketToken);
        const soc = new WebSocket(
          `${apiUrl.replace(
            "http",
            "ws"
          )}/soc?channel=${join_code}&wsToken=${socketToken}`
        );
        soc.onopen = () => {
          console.log("connected");
        };
        soc.onmessage = (e) => {
          console.log("message received", e.data);
        };
        soc.onerror = (e) => {
          console.log(e);
        };
        soc.onclose = (e) => {
          console.log(e);
        };
        return {
          socket: soc,
        };
      })
      .catch((error) => {
        console.error(error);
      });
  },

  init: (store) => {
    store.loadGames();
    store.on("login", () => {
      store.loadGames();
    });
  },
};
