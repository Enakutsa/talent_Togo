import { useState, useContext, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  LayoutDashboard, User, MessageSquare, ClipboardList,
  Star, Bell, LogOut, Menu, X, ChevronDown,
  Wifi, WifiOff, Search, Image as ImageIcon
} from "lucide-react";
import "../../assets/styles/TalentDashboard.css";

const NAV_ITEMS = [
  { path: "/talent/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { path: "/talent/demandes",  label: "Demandes",         icon: ClipboardList, badge: 3 },
  { path: "/talent/messages",  label: "Messages",          icon: MessageSquare, badge: 5 },
  { path: "/talent/portfolio", label: "Portfolio",         icon: ImageIcon },
  { path: "/talent/avis",      label: "Avis",              icon: Star },
  { path: "/talent/profil",    label: "Profil",            icon: User },
];

export default function TalentLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [disponible, setDisponible] = useState(true);

  const menuRef = useRef(null);

  const prenom = user?.prenom || "Talent";
  const nom    = user?.nom    || "";
  const photo  = user?.profilTalent?.photo || null;
  const initiales = `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    setMobileNavOpen(false);
  };

  return (
    <div className="td-root">

      {/* ── Top navbar ── */}
      <header className="td-topnav">
        <div className="td-topnav-left">
          <div className="td-logo-icon"><span>T</span></div>
          <span className="td-logo-text">Talent<span className="td-logo-accent">Togo</span></span>
        </div>

        <nav className="td-topnav-links">
          {NAV_ITEMS.map(({ path, label, badge }) => (
            <button
              key={path}
              className={`td-topnav-link ${isActive(path) ? "td-topnav-link-active" : ""}`}
              onClick={() => handleNavClick(path)}
            >
              {label}
              {badge && <span className="td-topnav-badge">{badge}</span>}
            </button>
          ))}
        </nav>

        <div className="td-topnav-right">
          <button className="td-icon-btn" title="Rechercher">
            <Search size={18} />
          </button>

          <button className="td-icon-btn td-icon-btn-bell" title="Notifications">
            <Bell size={18} />
            <span className="td-bell-dot" />
          </button>

          <div className="td-profile-menu" ref={menuRef}>
            <button className="td-profile-trigger" onClick={() => setMenuOpen((o) => !o)}>
              <div className="td-topnav-avatar">
                {photo ? <img src={photo} alt={prenom} /> : <span>{initiales}</span>}
                <span className={`td-dispo-dot ${disponible ? "dispo-on" : "dispo-off"}`} />
              </div>
              <ChevronDown size={14} className={`td-chevron ${menuOpen ? "td-chevron-open" : ""}`} />
            </button>

            {menuOpen && (
              <div className="td-profile-dropdown">
                <div className="td-profile-dropdown-header">
                  <p className="td-profile-dropdown-name">{prenom} {nom}</p>
                  <p className="td-profile-dropdown-role">Talent</p>
                </div>

                <button
                  className="td-profile-dropdown-item"
                  onClick={() => { navigate("/talent/profil"); setMenuOpen(false); }}
                >
                  <User size={16} /> Mon profil
                </button>

                <div className="td-profile-dropdown-dispo">
                  <div className="td-dispo-label">
                    {disponible ? <Wifi size={14} /> : <WifiOff size={14} />}
                    <span>{disponible ? "Disponible" : "Indisponible"}</span>
                  </div>
                  <button
                    className={`td-dispo-toggle ${disponible ? "toggle-on" : "toggle-off"}`}
                    onClick={() => setDisponible(!disponible)}
                  >
                    <span className="td-dispo-thumb" />
                  </button>
                </div>

                <button className="td-profile-dropdown-item td-profile-dropdown-logout" onClick={logout}>
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            )}
          </div>

          <button className="td-mobile-menu-btn" onClick={() => setMobileNavOpen((o) => !o)}>
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Nav mobile déroulante */}
      {mobileNavOpen && (
        <nav className="td-mobile-nav">
          {NAV_ITEMS.map(({ path, label, icon: Icon, badge }) => (
            <button
              key={path}
              className={`td-mobile-nav-item ${isActive(path) ? "td-topnav-link-active" : ""}`}
              onClick={() => handleNavClick(path)}
            >
              <Icon size={17} />
              <span>{label}</span>
              {badge && <span className="td-topnav-badge">{badge}</span>}
            </button>
          ))}
          <button className="td-mobile-nav-item td-profile-dropdown-logout" onClick={logout}>
            <LogOut size={17} /> Déconnexion
          </button>
        </nav>
      )}

      {/* ── Contenu de la page active (rendu par React Router) ── */}
      <main className="td-main">
        <Outlet />
      </main>
    </div>
  );
}