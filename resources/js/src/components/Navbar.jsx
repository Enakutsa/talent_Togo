import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import "../assets/styles/Home.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: "Accueil", to: "/" },
    { label: "Trouver un talent", to: "/recherche" },
  ];

  const isActive = (to) => (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to));

  return (
    <nav className="nav2">
      <div className="nav2-inner">
        {/* Logo */}
        <Link to="/" className="nav2-logo">
          <div className="nav2-logo-icon">
            <span>T</span>
          </div>
          <span className="nav2-logo-text">
            Talent<span className="nav2-logo-accent">Togo</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="nav2-links">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={`nav2-link ${isActive(l.to) ? "nav2-link-active" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="nav2-actions">
          <button onClick={() => navigate("/recherche")} className="nav2-icon-btn" aria-label="Rechercher">
            <Search size={18} />
          </button>
          <Link to="/login" className="nav2-btn-outline">
            Connexion
          </Link>
          <Link to="/inscription" className="nav2-btn-primary">
            S&apos;inscrire
          </Link>
        </div>

        {/* Mobile burger */}
        <button className="nav2-burger" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="nav2-mobile">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="nav2-mobile-link">
              {l.label}
            </Link>
          ))}
          <div className="nav2-mobile-actions">
            <Link to="/login" onClick={() => setOpen(false)} className="nav2-mobile-action-btn nav2-btn-outline">
              Connexion
            </Link>
            <Link to="/inscription" onClick={() => setOpen(false)} className="nav2-mobile-action-btn nav2-btn-primary">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}