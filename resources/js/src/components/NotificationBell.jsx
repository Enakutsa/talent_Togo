import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { getNotifications, marquerLue, toutMarquerLu } from "../services/notification.service";
import "../assets/styles/NotificationBell.css";

const REDIRECTIONS = {
  nouvelle_demande: (data, role) => role === "talent" ? "/talent/demandes" : "/client/demandes",
  demande_acceptee: () => "/client/demandes",
  demande_refusee: () => "/client/demandes",
  nouvel_avis: () => "/talent/avis",
  nouveau_message: (data, role) => role === "talent" ? "/talent/messages" : "/client/messages",
};

export default function NotificationBell({ accentColor = "orange" }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const ref = useRef(null);
  const closeTimeoutRef = useRef(null);

  const load = () => {
    getNotifications()
      .then((res) => {
        setNotifications(res.data || []);
        setNonLues(res.non_lues || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // rafraîchit toutes les 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ✅ Ouvre le menu de notifications au survol (hover), avec un petit
  // délai à la sortie pour éviter qu'il se ferme si la souris passe
  // rapidement entre la cloche et le menu. Le clic reste actif en plus
  // (utile sur mobile/tactile).
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleNotifClick = async (n) => {
    if (!n.lu) {
      await marquerLue(n.id).catch(() => {});
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, lu: true } : x)));
      setNonLues((prev) => Math.max(0, prev - 1));
    }

    const redirectFn = REDIRECTIONS[n.type];
    if (redirectFn) {
      navigate(redirectFn(n.data, user?.role));
    }
    setOpen(false);
  };

  const handleToutLire = async () => {
    await toutMarquerLu().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    setNonLues(0);
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    return `${Math.floor(diff / 86400)} j`;
  };

  return (
    <div
      className={`nb-wrap nb-accent-${accentColor}`}
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="nb-icon-btn" onClick={() => setOpen((o) => !o)} title="Notifications">
        <Bell size={18} />
        {nonLues > 0 && (
          <span className="nb-badge">{nonLues > 9 ? "9+" : nonLues}</span>
        )}
      </button>

      {open && (
        <div className="nb-dropdown">
          <div className="nb-dropdown-header">
            <p className="nb-dropdown-title">Notifications</p>
            {nonLues > 0 && (
              <button className="nb-mark-all" onClick={handleToutLire}>
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="nb-list">
            {notifications.length === 0 ? (
              <p className="nb-empty">Aucune notification.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  className={`nb-item ${!n.lu ? "nb-item-unread" : ""}`}
                  onClick={() => handleNotifClick(n)}
                >
                  {!n.lu && <span className="nb-item-dot" />}
                  <div className="nb-item-content">
                    <p className="nb-item-text">{n.contenu}</p>
                    <p className="nb-item-time">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}