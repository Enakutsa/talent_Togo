import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// ✅ BON CHEMIN
import App from "./App";

// ✅ IMPORT CSS GLOBAL
import "./assets/styles/Home.css";

// ✅ THEME GLOBAL — variables CSS (couleurs, polices, espacements)
// Importé APRÈS Home.css volontairement : en cas de règle en conflit à
// spécificité égale (ex: les deux définissent font-family sur body),
// c'est la dernière règle chargée qui l'emporte dans la cascade CSS.
// Ça garantit que les polices/couleurs du thème global priment sur
// d'éventuelles règles génériques restées dans les fichiers par page.
import "./assets/styles/theme.css";

const root = createRoot(document.getElementById("app"));

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);