import { useContext, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import {
  LayoutDashboard, Heart, MessageSquare, ClipboardList,
  LogOut, Menu, X, ChevronDown, Search, Settings, User, Home,
} from "lucide-react";

export const CLIENT_NAV_ITEMS = [
  { key: "accueil",   label: "Accueil",             icon: Home,            to: "/" },
  { key: "dashboard", label: "Tableau de bord",   icon: LayoutDashboard, to: "/client/dashboard" },
  { key: "favoris",   label: "Favoris",            icon: Heart,           to: "/client/favoris" },
  { key: "messages",  label: "Messages",            icon: MessageSquare,  badge: 0, to: "/client/messages" },
  { key: "demandes",  label: "Demandes envoyées",   icon: ClipboardList,  badge: 0, to: "/client/demandes" },
];

export default function ClientTopNav({ activeKey }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const prenom = user?.prenom || "Client";
  const nom = user?.nom || "";
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

  const handleNavClick = (to) => {
    navigate(to);
    setMobileNavOpen(false);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="cd-topnav">
        <div className="cd-topnav-left">
          <div className="cd-logo-icon"><span>T</span></div>
          <span className="cd-logo-text">Talent<span className="cd-logo-accent">Togo</span></span>
        </div>

        <nav className="cd-topnav-links">
          {CLIENT_NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`cd-topnav-link ${activeKey === item.key ? "cd-topnav-link-active" : ""}`}
              onClick={() => handleNavClick(item.to)}
            >
              {item.label}
              {!!item.badge && <span className="cd-topnav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="cd-topnav-right">
          <button className="cd-icon-btn" title="Rechercher" onClick={() => navigate("/recherche")}>
            <Search size={18} />
          </button>

          <NotificationBell accentColor="orange" />

          <div className="cd-profile-menu" ref={menuRef}>
            <button className="cd-profile-trigger" onClick={() => setMenuOpen((o) => !o)}>
              <div className="cd-topnav-avatar">
                {user?.photo ? (
                  <img src={user.photo} alt={prenom} className="cd-topnav-avatar-photo" />
                ) : (
                  <span>{initiales}</span>
                )}
              </div>
              <ChevronDown size={14} className={`cd-chevron ${menuOpen ? "cd-chevron-open" : ""}`} />
            </button>

            {menuOpen && (
              <div className="cd-profile-dropdown">
                <div className="cd-profile-dropdown-header">
                  <p className="cd-profile-dropdown-name">{prenom} {nom}</p>
                  <p className="cd-profile-dropdown-role">Client</p>
                </div>

                <button className="cd-profile-dropdown-item" onClick={() => navigate("/client/profil")}>
                  <User size={16} /> Mon profil
                </button>

                <button className="cd-profile-dropdown-item" onClick={() => navigate("/client/parametres")}>
                  <Settings size={16} /> Paramètres
                </button>

                <button className="cd-profile-dropdown-item cd-profile-dropdown-logout" onClick={logout}>
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            )}
          </div>

          <button className="cd-mobile-menu-btn" onClick={() => setMobileNavOpen((o) => !o)}>
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {mobileNavOpen && (
        <nav className="cd-mobile-nav">
          {CLIENT_NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`cd-mobile-nav-item ${activeKey === item.key ? "cd-topnav-link-active" : ""}`}
              onClick={() => handleNavClick(item.to)}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
              {!!item.badge && <span className="cd-topnav-badge">{item.badge}</span>}
            </button>
          ))}
          <button className="cd-mobile-nav-item cd-profile-dropdown-logout" onClick={logout}>
            <LogOut size={17} /> Déconnexion
          </button>
        </nav>
      )}
    </>
  );
}