import { useRef, useEffect } from "react";
import useStore from "../hooks/useStore";

import createMap from "../game-map/map";

export default function GameMap({ game }) {
  const mapRef = useRef(null);
  const { username, joinGame } = useStore("getUsername", "joinGame");

  useEffect(() => {
    if (!game) return;
    joinGame(game);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    createMap({ target: mapRef.current, username });
  }, [mapRef, username]);

  return <div id="map" className="bg-primary" ref={mapRef}></div>;
}
