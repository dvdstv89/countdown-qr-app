import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import "./index.css";

// Detectar si estamos en producción (GitHub Pages) o desarrollo
const isGitHubPages = window.location.hostname.includes('github.io');
const basename = isGitHubPages ? '/countdown-qr-app' : '/';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);