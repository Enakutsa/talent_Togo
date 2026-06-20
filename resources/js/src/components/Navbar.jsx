import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, Bell } from "lucide-react";
import "../assets/styles/Navbar.css";

// TODO: brancher l'état réel de connexion via le contexte d'authentification
// (ex: const { user, isAuthenticated } = useAuth();)
// Pour l'instant, on affiche la navbar version "visiteur non connecté".

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/talents", label: "Talents" },
    { href: "/messages", label: "Messages" },
  ];

  const isActive = (href) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">
              <span>T</span>
            </div>
            <span className="navbar-logo-text">
              Talent<span className="accent">Togo</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="navbar-links">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`navbar-link ${isActive(link.href) ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            <button className="icon-button" aria-label="Rechercher">
              <Search size={18} />
            </button>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={18} />
              <span className="notif-dot" />
            </button>

            {/* Visiteur non connecté : connexion / inscription */}
            <Link to="/login" className="navbar-btn-outline">
              Se connecter
            </Link>
            <Link to="/inscription" className="navbar-cta">
              S&apos;inscrire
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`navbar-mobile ${menuOpen ? "open" : ""}`}>
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            onClick={() => setMenuOpen(false)}
            className={`navbar-mobile-link ${isActive(link.href) ? "active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
        <Link to="/login" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">
          Se connecter
        </Link>
        <Link to="/inscription" onClick={() => setMenuOpen(false)} className="navbar-mobile-cta">
          S&apos;inscrire
        </Link>
      </div>
    </nav>
  );
}