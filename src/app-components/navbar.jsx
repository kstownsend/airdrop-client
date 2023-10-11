import useStore from "../hooks/useStore";

export default function Navbar() {
  const { logout, isLoggedIn } = useStore("logout", "getIsLoggedIn");

  return (
    <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          Airdrop
        </a>
        {isLoggedIn && (
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={logout}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
