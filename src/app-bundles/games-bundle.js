// eslint-disable-next-line no-undef
const apiRoot = __API_ROOT__;

export default {
  name: "games",

  state: {
    joinedGame: null,
    games: [],
    socket: null,
  },

  getGames: (state) => state.games.games,

  getGamesByJoinCode: (state) => {
    const games = state.games.games;
    const gamesByJoinCode = {};
    games.forEach((game) => {
      gamesByJoinCode[game.join_code] = game;
    });
    return gamesByJoinCode;
  },

  getJoinedGame: (state) => state.games.joinedGame,

  getSocket: (state) => state.games.socket,

  getIsSocketOpen: (state) => {
    const socket = state.games.socket;
    return !!socket;
  },

  clearCurrentGame:
    () =>
    ({ set }) => {
      set({
        joinedGame: null,
        socket: null,
      });
    },

  loadGames:
    () =>
    ({ store, set }) => {
      const token = store.getToken();
      if (!token) return null;
      fetch(`${apiRoot}/games`, {
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
            games: data,
          });
        });
    },

  joinGame:
    (game) =>
    ({ store, set, fire }) => {
      const joinedGame = store.getJoinedGame();
      const { join_code } = game;

      // sort circuit if already joined
      if (joinedGame === join_code) return null;

      set({ joinedGame: join_code });
      const token = store.getToken();
      fetch(`${apiRoot}/auth/ws-token?joinCode=${join_code}`, {
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
          // @TODO need to wire up the websocket to make this realtime
          console.log(socketToken);
        })
        .catch((error) => {
          console.error(error);
        });
    },

  init: ({ store }) => {
    store.loadGames();
    store.on("login", () => {
      store.loadGames();
    });
    store.on("logout", () => {
      store.clearCurrentGame();
    });
  },
};
