import useStore from "../hooks/useStore";

export default function GameList({ onSelect }) {
  const { games } = useStore("getGames");
  return (
    <div className="mt-5 mx-5">
      <h3>Active Games</h3>
      <ul className="list-group">
        {games.map((game) => (
          <li
            key={game.id}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            onClick={() => onSelect(game)}
          >
            {game.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
