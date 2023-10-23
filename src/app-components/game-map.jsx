import { useRef, useEffect } from "react";
import useStore from "../hooks/useStore";

export default function GameMap({ game }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!game) return;
    // @TODO connect to a game socket here...

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    // @TODO create a map here...

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef]);

  return (
    <div id="map" className="bg-primary" ref={mapRef}>
      Map Goes Here
    </div>
  );
}
