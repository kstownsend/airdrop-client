import { useState } from "react";
import GameList from "./game-list";
import GameMap from "./game-map";

export default function GameNav() {
  const [selectedGame, setSelectedGame] = useState(null);
  return (
    <>
      {selectedGame ? (
        <GameMap game={selectedGame} />
      ) : (
        <GameList onSelect={setSelectedGame} />
      )}
    </>
  );
}
