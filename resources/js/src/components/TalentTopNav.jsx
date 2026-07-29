import { useContext, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getProfilTalent, updateProfilTalent } from "../services/profilTalent.service";
import NotificationBell from "./NotificationBell";
import logo from "../assets/logo.svg";
import {
  LayoutDashboard, User, MessageSquare, ClipboardList,
  Star, LogOut, Menu, X, ChevronDown,
  Wifi, WifiOff, Image as ImageIcon, Loader2,
} from "lucide-react";

// "to" = route réelle vers laquelle on navigue.
// Les sections qui n'ont pas encore leur propre page restent sur
// /talent/dashboard, avec activeKey transmis en state pour que
// TalentDashboard sache quel onglet ouvrir.
export const NAV_ITEMS = [
  { key: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, to: "/talent/dashboard" },
  { key: "demandes",  label: "Demandes",         icon: ClipboardList,  to: "/talent/demandes" },
  { key: "messages",  label: "Messages",          icon: MessageSquare, to: "/talent/messages" },  { key: "portfolio", label: "Portfolio",         icon: ImageIcon,     to: "/talent/portfolio" },
  { key: "avis",      label: "Avis",              icon: Star,          to: "/talent/avis" },

];

export default function TalentTopNav({ activeKey }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [disponible, setDisponible] = useState(true);
  const [dispoLoading, setDispoLoading] = useState(false);
  const menuRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const prenom = user?.prenom || "Talent";
  const nom = user?.nom || "";
  const photo = user?.profilTalent?.photo || null;
  const initiales = `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();

  useEffect(() => {
    getProfilTalent()
      .then((res) => setDisponible(!!res.data?.disponibilite))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ✅ Ouvre le menu au survol (hover), avec un petit délai à la sortie
  // pour éviter qu'il se ferme si la souris passe rapidement entre
  // l'avatar et le menu. Le clic reste actif en plus (utile sur mobile).
  const handleMenuMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMenuOpen(true);
  };

  const handleMenuMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleNavClick = (item) => {
    navigate(item.to, { state: { activeKey: item.key } });
    setMobileNavOpen(false);
    setMenuOpen(false);
  };

  const handleToggleDispo = () => {
    if (dispoLoading) return;

    const next = !disponible;
    setDisponible(next);
    setDispoLoading(true);

    const payload = new FormData();
    payload.append("disponibilite", next ? "1" : "0");

    updateProfilTalent(payload)
      .catch(() => setDisponible(!next))
      .finally(() => setDispoLoading(false));
  };

  return (
    <>
      <header className="td-topnav">
        <div className="td-topnav-left">
          <img src={logo} alt="TalentTogo" className="td-logo-icon-img" />
          <span className="td-logo-text">Talent<span className="td-logo-accent">Togo</span></span>
        </div>

        <nav className="td-topnav-links">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`td-topnav-link ${activeKey === item.key ? "td-topnav-link-active" : ""}`}
              onClick={() => handleNavClick(item)}
            >
              {item.label}
              {item.badge && <span className="td-topnav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="td-topnav-right">
          <NotificationBell accentColor="green" />

          <div
            className="td-profile-menu"
            ref={menuRef}
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
          >
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
                  onClick={() => handleNavClick({ to: "/talent/dashboard", key: "profil" })}
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
                    onClick={handleToggleDispo}
                    disabled={dispoLoading}
                  >
                    {dispoLoading ? (
                      <Loader2 size={12} className="td-dispo-spin" />
                    ) : (
                      <span className="td-dispo-thumb" />
                    )}
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

      {mobileNavOpen && (
        <nav className="td-mobile-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`td-mobile-nav-item ${activeKey === item.key ? "td-topnav-link-active" : ""}`}
              onClick={() => handleNavClick(item)}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
              {item.badge && <span className="td-topnav-badge">{item.badge}</span>}
            </button>
          ))}
          <button className="td-mobile-nav-item td-profile-dropdown-logout" onClick={logout}>
            <LogOut size={17} /> Déconnexion
          </button>
        </nav>
      )}
    </>
  );
}