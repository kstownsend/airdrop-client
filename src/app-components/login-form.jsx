import { useEffect, useState } from "react";
import useStore from "../hooks/useStore";

export default function LoginForm() {
  const { login, errorMsg, clearErrorMsg } = useStore(
    "login",
    "getErrorMsg",
    "clearErrorMsg"
  );
  const [userPath, setUserPath] = useState("Login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [focused, setFocused] = useState(false);

  const borderClass = focused ? "border-secondary" : "border-primary";

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password, avatar);
  };

  useEffect(() => {
    return () => {
      setUsername("");
      setPassword("");
      setAvatar("");
    };
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
      <div className={`card ${borderClass} mb-3`}>
        <div className="card-body">
          <h4 className="card-title">{userPath}</h4>
          <form
            onSubmit={handleSubmit}
            onFocus={() => {
              setFocused(true);
            }}
            onBlur={() => {
              setFocused(false);
            }}
          >
            <div className="form-group mb-2">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                className="form-control"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  clearErrorMsg();
                }}
              />
            </div>
            <div className="form-group mb-2">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="form-control"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearErrorMsg();
                }}
              />
              {errorMsg && <p className="text-danger mt-2">{errorMsg}</p>}
            </div>
            {userPath === "Create Account" && (
              <div className="form-group mb-4">
                <label htmlFor="password">Avatar</label>
                <div className="row">
                  <div className="col-9">
                    <input
                      id="avatar"
                      className="form-control"
                      type="text"
                      placeholder="avatar"
                      value={avatar}
                      onChange={(e) => {
                        setAvatar(e.target.value);
                        clearErrorMsg();
                      }}
                    />
                  </div>
                  <div className="col-3">
                    <img
                      src={`https://www.avatarsinpixels.com/minipix/${avatar}/1/show.png`}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="mt-4 d-flex flex-row justify-content-between">
              {userPath === "Login" ? (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      setUserPath("Create Account");
                    }}
                  >
                    Create Account
                  </button>
                  <button className="btn btn-secondary" type="submit">
                    Login
                  </button>
                </>
              ) : (
                // userPath === 'Create Account'
                <>
                  <button
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      setUserPath("Login");
                    }}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-secondary" type="submit">
                    Create and Login
                  </button>
                </>
              )}
            </div>
            <p className="read-the-docs mt-3">
              Login or create an account to get started
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
