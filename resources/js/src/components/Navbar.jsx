import { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, Bell, User, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import "../assets/styles/Navbar.css";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/talents", label: "Talents" },
  { href: "/messages", label: "Messages" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  const isActive = (href) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-row">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">
              <span>T</span>
            </div>
            <span className="navbar-logo-text">
              Talent<span className="navbar-logo-accent">Togo</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="navbar-links">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`navbar-link ${isActive(link.href) ? "navbar-link-active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            <button className="navbar-icon-btn" aria-label="Rechercher">
              <Search size={18} />
            </button>

            {isAuthenticated && (
              <button className="navbar-icon-btn navbar-icon-btn-bell" aria-label="Notifications">
                <Bell size={18} />
                <span className="navbar-bell-dot" />
              </button>
            )}

            {isAuthenticated ? (
              <div className="navbar-profile-wrap">
                <button onClick={() => setProfileOpen(!profileOpen)} className="navbar-profile-btn">
                  <img
                    src={user?.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.nom || "U")}
                    alt={user?.nom}
                    className="navbar-profile-avatar"
                  />
                  <span className="navbar-profile-name">{user?.nom}</span>
                </button>
                {profileOpen && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-header">
                      <p className="navbar-dropdown-name">{user?.nom}</p>
                      <p className="navbar-dropdown-role">{user?.role}</p>
                    </div>
                    <Link to="/profile" className="navbar-dropdown-link" onClick={() => setProfileOpen(false)}>
                      <User size={15} /> Mon profil
                    </Link>
                    <Link to="/admin" className="navbar-dropdown-link" onClick={() => setProfileOpen(false)}>
                      <LayoutDashboard size={15} /> Tableau de bord
                    </Link>
                    <Link to="/settings" className="navbar-dropdown-link" onClick={() => setProfileOpen(false)}>
                      <Settings size={15} /> Paramètres
                    </Link>
                    <hr className="navbar-dropdown-divider" />
                    <button className="navbar-dropdown-link navbar-dropdown-logout" onClick={handleLogout}>
                      <LogOut size={15} /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="navbar-login-btn">
                  Se connecter
                </Link>
                <Link to="/register" className="navbar-cta">
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="navbar-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar-mobile">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className={`navbar-mobile-link ${isActive(link.href) ? "navbar-mobile-link-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">
                Mon profil
              </Link>
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">
                Tableau de bord
              </Link>
              <button onClick={handleLogout} className="navbar-mobile-link navbar-mobile-logout">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">
                Se connecter
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="navbar-mobile-cta">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}