// eslint-disable-next-line no-undef
const apiRoot = __API_ROOT__;

export default {
  name: "auth",

  state: {
    token: "",
    isLoggedIn: false,
    errorMsg: "",
  },

  persist: true,

  maxAge: 1000 * 60 * 60 * 12, // 12 hours

  getUsername: (state) => {
    const token = state.auth.token;
    if (!token) {
      return "";
    }
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    return decoded.username;
  },

  getToken: (state) => {
    return state.auth.token;
  },

  getIsLoggedIn: (state) => {
    return state.auth.isLoggedIn;
  },

  getErrorMsg: (state) => {
    return state.auth.errorMsg;
  },

  clearErrorMsg:
    () =>
    ({ set }) => {
      set({
        errorMsg: "",
      });
    },

  login:
    (username, password, avatar) =>
    ({ set, fire }) => {
      return fetch(`${apiRoot}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, avatar }),
      })
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          } else {
            throw new Error("Login failed, please try again.");
          }
        })
        .then((data) => {
          set({
            token: data.token,
            isLoggedIn: true,
            errorMsg: "",
            _event: "login",
          });
          fire("login");
        })
        .catch((err) => {
          set({
            token: "",
            isLoggedIn: false,
            errorMsg: err.message,
          });
        });
    },

  logout:
    () =>
    ({ set, fire }) => {
      set({
        token: "",
        isLoggedIn: false,
        errorMsg: "",
        _event: "logout",
      });
      fire("logout");
    },
};
