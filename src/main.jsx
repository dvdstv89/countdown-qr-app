import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Determinar entorno
const isGitHubPages = window.location.hostname.includes('github.io');
const isLocalDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname.includes('192.168.') ||
                          window.location.hostname.includes('172.') ||
                          window.location.hostname === '127.0.0.1';

console.log('🌍 Entorno detectado:', {
  hostname: window.location.hostname,
  isGitHubPages,
  isLocalDevelopment,
  href: window.location.href
});

// Router dinámico
if (isGitHubPages) {
  // Producción: HashRouter
  import('react-router-dom').then(({ HashRouter }) => {
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <HashRouter>
          <App />
        </HashRouter>
      </React.StrictMode>
    );
  });
} else {
  // Desarrollo: BrowserRouter
  import('react-router-dom').then(({ BrowserRouter }) => {
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
  });
}