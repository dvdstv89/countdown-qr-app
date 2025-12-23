import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Router condicional basado en el entorno
const isGitHubPages = import.meta.env.PROD && window.location.hostname.includes('github.io');
const RouterComponent = isGitHubPages 
  ? require('react-router-dom').HashRouter
  : require('react-router-dom').BrowserRouter;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterComponent basename={isGitHubPages ? '/countdown-qr-app' : '/'}>
      <App />
    </RouterComponent>
  </React.StrictMode>
);