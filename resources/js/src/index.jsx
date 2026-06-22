import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// ✅ BON CHEMIN
import App from "./App";

// ✅ IMPORT CSS GLOBAL
import "./assets/styles/Home.css";

const root = createRoot(document.getElementById("app"));

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
