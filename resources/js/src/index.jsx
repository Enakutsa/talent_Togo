import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// ✅ BON CHEMIN
import App from "./App";

// ✅ THEME GLOBAL — variables CSS (couleurs, polices, espacements)
import "./assets/styles/theme.css";

// ✅ IMPORT CSS GLOBAL
import "./assets/styles/Home.css";

const root = createRoot(document.getElementById("app"));

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);