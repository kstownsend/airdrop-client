import { useRef, useEffect } from "react";
import useStore from "../hooks/useStore";

export default function GameMap({ game }) {
  const mapRef = useRef(null);
  const { isSocketOpened, joinGame, createMap } = useStore(
    "getIsSocketOpen",
    "joinGame",
    "createMap"
  );

  useEffect(() => {
    if (!game) return;
    if (isSocketOpened) return;
    joinGame(game);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    createMap({ target: mapRef.current });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef]);

  return <div id="map" className="bg-primary" ref={mapRef}></div>;
}
