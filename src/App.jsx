import AuthWrapper from "./app-components/auth-wrapper";
import GameNav from "./app-components/game-nav";
import Navbar from "./app-components/navbar";

function App() {
  return (
    <>
      <Navbar />
      <AuthWrapper>
        <GameNav />
      </AuthWrapper>
    </>
  );
}

export default App;
