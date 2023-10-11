import useStore from "../hooks/useStore";
import LoginForm from "./login-form";

export default function AuthWrapper({ children }) {
  const { isLoggedIn } = useStore("getIsLoggedIn");

  return <>{isLoggedIn ? children : <LoginForm />}</>;
}
