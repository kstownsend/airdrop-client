import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
// bootstrap css
import "./css/bootstrap/bootstrap.vapor.min.css";
// openlayers css
import "ol/ol.css";
// any custom css overrides
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
