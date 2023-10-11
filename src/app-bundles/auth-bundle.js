const apiUrl = import.meta.env.VITE_API_URL;

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

  clearErrorMsg: () => {
    return {
      errorMsg: "",
    };
  },

  login: (_, username, password, avatar) => {
    return fetch(`${apiUrl}/auth/login`, {
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
        return {
          token: data.token,
          isLoggedIn: true,
          errorMsg: "",
          _event: "login",
        };
      })
      .catch((err) => {
        return {
          token: "",
          isLoggedIn: false,
          errorMsg: err.message,
        };
      });
  },

  logout() {
    return {
      token: "",
      isLoggedIn: false,
      errorMsg: "",
      _event: "logout",
    };
  },
};
