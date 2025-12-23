import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from 'react-router-dom'; // Usar SOLO HashRouter para GitHub Pages
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);