import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from "./App";
import "./index.css";

// Determinar qué router usar
const isGitHubPages = window.location.hostname.includes('github.io');
const Router = isGitHubPages ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router basename={isGitHubPages ? '/countdown-qr-app' : '/'}>
      <App />
    </Router>
  </React.StrictMode>
);
Paso 2: Actualiza vite.config.js - SIMPLIFIC