import { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  LayoutDashboard, User, MessageSquare, ClipboardList,
  Star, Bell, LogOut, Menu, X, Eye, TrendingUp, ChevronDown,
  ChevronRight, Wifi, WifiOff, Search, Image as ImageIcon, Camera,
  Mail, Phone, MapPin, Tag
} from "lucide-react";
import { getProfilTalent, updateProfilTalent } from "../../services/profilTalent.service";
import { getCategories } from "../../services/categorie.service";
import "../../assets/styles/TalentDashboard.css";
import "../../assets/styles/ProfilCreer.css";

const NAV_ITEMS = [
  { key: "dashboard",  label: "Tableau de bord", icon: LayoutDashboard },
  { key: "demandes",   label: "Demandes",         icon: ClipboardList, badge: 3 },
  { key: "messages",   label: "Messages",          icon: MessageSquare, badge: 5 },
  { key: "portfolio",  label: "Portfolio",         icon: ImageIcon },
  { key: "avis",       label: "Avis",              icon: Star },
  { key: "profil",     label: "Profil",            icon: User },
];

// ── Données factices (seront remplacées par l'API) ──────────────────────────
const STATS = [
  { label: "Vues du profil",  value: "128",  sub: "+12 cette semaine", icon: Eye,           color: "blue"   },
  { label: "Demandes reçues", value: "14",   sub: "3 en attente",      icon: ClipboardList, color: "orange" },
  { label: "Avis clients",    value: "4.8★", sub: "24 avis",           icon: Star,          color: "yellow" },
  { label: "Taux de réponse", value: "92%",  sub: "Excellent",         icon: TrendingUp,    color: "green"  },
];

const DEMANDES_RECENTES = [
  { id: 1, client: "Akosua M.",  service: "Séance photo mariage",    date: "Aujourd'hui", statut: "en_attente" },
  { id: 2, client: "Yao K.",     service: "Portrait professionnel",  date: "Hier",        statut: "acceptee"  },
  { id: 3, client: "Afi D.",     service: "Photos événement",        date: "Il y a 2j",   statut: "en_attente" },
];

const MESSAGES_RECENTS = [
  { id: 1, nom: "Akosua M.", message: "Bonjour, êtes-vous disponible le 15 juillet ?", heure: "10:24", non_lu: true  },
  { id: 2, nom: "Koffi A.",  message: "Merci pour votre réponse rapide !",              heure: "Hier",  non_lu: false },
  { id: 3, nom: "Esther L.", message: "Pouvez-vous m'envoyer vos tarifs ?",             heure: "Hier",  non_lu: true  },
];

export default function TalentDashboard() {
  const { user, logout } = useContext(AuthContext);

  const [activeKey, setActiveKey]         = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [disponible, setDisponible]       = useState(true);

  const menuRef = useRef(null);

  const prenom = user?.prenom || "Talent";
  const nom    = user?.nom    || "";
  const photo  = user?.profilTalent?.photo || null;
  const initiales = `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();

  const statutColor = { en_attente: "orange", acceptee: "green", refusee: "red" };
  const statutLabel = { en_attente: "En attente", acceptee: "Acceptée", refusee: "Refusée" };

  // Ferme le menu profil si on clique en dehors
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleNavClick = (key) => {
    setActiveKey(key);
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
          {NAV_ITEMS.map(({ key, label, badge }) => (
            <button
              key={key}
              className={`td-topnav-link ${activeKey === key ? "td-topnav-link-active" : ""}`}
              onClick={() => handleNavClick(key)}
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
                  onClick={() => { setActiveKey("profil"); setMenuOpen(false); }}
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
          {NAV_ITEMS.map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              className={`td-mobile-nav-item ${activeKey === key ? "td-topnav-link-active" : ""}`}
              onClick={() => handleNavClick(key)}
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

      {/* ── Contenu principal ── */}
      <main className="td-main">

        {/* ── PAGE : Dashboard ── */}
        {activeKey === "dashboard" && (
          <div className="td-page">
            <div className="td-page-header">
              <div>
                <h1 className="td-page-title">Bonjour, {prenom} 👋</h1>
                <p className="td-page-sub">Voici un résumé de votre activité aujourd'hui.</p>
              </div>
            </div>

            <div className="td-stats-grid">
              {STATS.map(({ label, value, sub, icon: Icon, color }) => (
                <div key={label} className={`td-stat-card td-stat-${color}`}>
                  <div className={`td-stat-icon-wrap td-stat-icon-${color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="td-stat-value">{value}</p>
                    <p className="td-stat-label">{label}</p>
                    <p className="td-stat-sub">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="td-two-cols">
              <div className="td-card">
                <div className="td-card-header">
                  <h2 className="td-card-title">Demandes récentes</h2>
                  <button className="td-card-link" onClick={() => setActiveKey("demandes")}>
                    Voir tout <ChevronRight size={14} />
                  </button>
                </div>
                <div className="td-card-body">
                  {DEMANDES_RECENTES.map((d) => (
                    <div key={d.id} className="td-demande-row">
                      <div className="td-demande-avatar">{d.client[0]}</div>
                      <div className="td-demande-info">
                        <p className="td-demande-client">{d.client}</p>
                        <p className="td-demande-service">{d.service}</p>
                      </div>
                      <div className="td-demande-right">
                        <span className={`td-statut td-statut-${statutColor[d.statut]}`}>
                          {statutLabel[d.statut]}
                        </span>
                        <p className="td-demande-date">{d.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="td-card">
                <div className="td-card-header">
                  <h2 className="td-card-title">Messages récents</h2>
                  <button className="td-card-link" onClick={() => setActiveKey("messages")}>
                    Voir tout <ChevronRight size={14} />
                  </button>
                </div>
                <div className="td-card-body">
                  {MESSAGES_RECENTS.map((m) => (
                    <div key={m.id} className={`td-msg-row ${m.non_lu ? "td-msg-unread" : ""}`}>
                      <div className="td-demande-avatar">{m.nom[0]}</div>
                      <div className="td-demande-info">
                        <p className="td-demande-client">{m.nom} {m.non_lu && <span className="td-unread-dot" />}</p>
                        <p className="td-demande-service td-msg-preview">{m.message}</p>
                      </div>
                      <p className="td-demande-date">{m.heure}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PAGE : Profil ── */}
        {activeKey === "profil" && <ProfilSection />}

        {/* ── Autres pages (placeholders) ── */}
        {activeKey !== "dashboard" && activeKey !== "profil" && (
          <div className="td-page td-placeholder">
            <div className="td-placeholder-inner">
              {(() => { const Item = NAV_ITEMS.find(n => n.key === activeKey); return Item ? <Item.icon size={40} /> : null; })()}
              <h2>{NAV_ITEMS.find(n => n.key === activeKey)?.label}</h2>
              <p>Cette section est en cours de développement.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ============================================
// Section Profil — affichée dans l'onglet "Profil" du dashboard.
// Réutilise la même logique que ProfilCreer.jsx (édition), mais sans
// le logo/tagline d'inscription : ici on est déjà dans le dashboard.
// ============================================
function ProfilSection() {
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    biographie: "",
    tarif_min: "",
    tarif_max: "",
    disponibilite: true,
  });

  // Charge les vraies données enregistrées (pas seulement AuthContext)
  useEffect(() => {
    getProfilTalent()
      .then((res) => {
        const p = res.data;
        setPhotoUrl(p.photo);
        setForm({
          biographie: p.biographie ?? "",
          tarif_min: p.tarif_min ?? "",
          tarif_max: p.tarif_max ?? "",
          disponibilite: p.disponibilite ?? true,
        });
      })
      .catch(() => setError("Impossible de charger le profil."))
      .finally(() => setLoading(false));
  }, []);

  // Charge la liste des catégories pour convertir categorie_id -> nom
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res?.data || []))
      .catch(() => setCategories([]));
  }, []);

  const nomCategorie =
    categories.find((c) => String(c.id) === String(user?.categorie_id))?.nom || "";

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const payload = new FormData();
    payload.append("biographie", form.biographie);
    payload.append("tarif_min", form.tarif_min);
    payload.append("tarif_max", form.tarif_max);
    payload.append("disponibilite", form.disponibilite ? "1" : "0");
    if (photoFile) {
      payload.append("photo", photoFile);
    }

    try {
      await updateProfilTalent(payload);
      setSuccess("Profil mis à jour avec succès.");
      setIsEditing(false);
    } catch (err) {
      if (err.response?.status === 422) {
        const firstError = Object.values(err.response.data.errors || {})[0]?.[0];
        setError(firstError || "Certains champs sont invalides.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setSaving(false);
    }
  };

  const displayPhoto = photoPreview || photoUrl;

  if (loading) {
    return (
      <div className="td-page">
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="td-page td-page-centered">
      <div className="td-page-header">
        <div>
          <h1 className="td-page-title">Mon profil</h1>
          <p className="td-page-sub">Gérez vos informations professionnelles.</p>
        </div>
      </div>

      <div className="profil-creer-card profil-creer-card-embedded">
        <div className="profil-creer-card-top">
          <p className="profil-creer-subtitle">
            Les informations d'inscription ne sont pas modifiables ici.
          </p>
          {!isEditing ? (
            <button
              type="button"
              className="btn-secondary-profil-creer"
              onClick={() => setIsEditing(true)}
            >
              Modifier
            </button>
          ) : (
            <button
              type="button"
              className="btn-secondary-profil-creer"
              onClick={() => setIsEditing(false)}
            >
              Annuler
            </button>
          )}
        </div>

        {error && <p className="profil-creer-error">{error}</p>}
        {success && <p className="profil-creer-success">{success}</p>}

        <form onSubmit={handleSubmit} className="profil-creer-form">

          {/* ── Photo ── */}
          <div className="profil-creer-photo-row">
            <div className="profil-creer-photo-wrap">
              {displayPhoto ? (
                <img src={displayPhoto} alt="Aperçu" className="profil-creer-photo" />
              ) : (
                <div className="profil-creer-photo-placeholder"><User size={26} /></div>
              )}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="profil-creer-photo-btn"
                >
                  <Camera size={13} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="profil-creer-photo-label">Photo de profil</p>
              <p className="profil-creer-photo-hint">JPG ou PNG — 3 Mo max</p>
            </div>
          </div>

          {/* ── Infos de compte (toujours grisées) ── */}
          <div className="profil-creer-section-title">Informations de compte</div>

          <div className="profil-creer-row">
            <div className="profil-creer-field">
              <label className="profil-creer-label profil-creer-label-disabled">Prénom</label>
              <div className="profil-creer-input-icon">
                <User size={16} className="profil-creer-icon" />
                <input type="text" className="profil-creer-input profil-creer-input-disabled" value={user?.prenom || ""} disabled />
              </div>
            </div>
            <div className="profil-creer-field">
              <label className="profil-creer-label profil-creer-label-disabled">Nom</label>
              <div className="profil-creer-input-icon">
                <User size={16} className="profil-creer-icon" />
                <input type="text" className="profil-creer-input profil-creer-input-disabled" value={user?.nom || ""} disabled />
              </div>
            </div>
          </div>

          <div className="profil-creer-row">
            <div className="profil-creer-field">
              <label className="profil-creer-label profil-creer-label-disabled">Email</label>
              <div className="profil-creer-input-icon">
                <Mail size={16} className="profil-creer-icon" />
                <input type="text" className="profil-creer-input profil-creer-input-disabled" value={user?.email || ""} disabled />
              </div>
            </div>
            <div className="profil-creer-field">
              <label className="profil-creer-label profil-creer-label-disabled">Téléphone</label>
              <div className="profil-creer-input-icon">
                <Phone size={16} className="profil-creer-icon" />
                <input type="text" className="profil-creer-input profil-creer-input-disabled" value={user?.telephone || ""} disabled />
              </div>
            </div>
          </div>

          <div className="profil-creer-row">
            <div className="profil-creer-field">
              <label className="profil-creer-label profil-creer-label-disabled">Catégorie</label>
              <div className="profil-creer-input-icon">
                <Tag size={16} className="profil-creer-icon" />
                <input type="text" className="profil-creer-input profil-creer-input-disabled" value={nomCategorie} disabled />
              </div>
            </div>
            <div className="profil-creer-field">
              <label className="profil-creer-label profil-creer-label-disabled">Ville</label>
              <div className="profil-creer-input-icon">
                <MapPin size={16} className="profil-creer-icon" />
                <input type="text" className="profil-creer-input profil-creer-input-disabled" value={user?.ville || ""} disabled />
              </div>
            </div>
          </div>

          {/* ── Infos pro (modifiables si isEditing) ── */}
          <div className="profil-creer-section-title">Informations professionnelles</div>

          <div className="profil-creer-field">
            <label className={`profil-creer-label ${!isEditing ? "profil-creer-label-disabled" : ""}`}>Biographie</label>
            <textarea
              rows={4}
              maxLength={2000}
              className={`profil-creer-input profil-creer-textarea ${!isEditing ? "profil-creer-input-disabled" : ""}`}
              placeholder="Présentez votre activité, votre expérience, votre style de travail..."
              value={form.biographie}
              onChange={(e) => setForm({ ...form, biographie: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="profil-creer-row">
            <div className="profil-creer-field">
              <label className={`profil-creer-label ${!isEditing ? "profil-creer-label-disabled" : ""}`}>Tarif minimum (FCFA)</label>
              <input
                type="number"
                min="0"
                max="99999999"
                className={`profil-creer-input ${!isEditing ? "profil-creer-input-disabled" : ""}`}
                placeholder="Ex: 10 000"
                value={form.tarif_min}
                onChange={(e) => setForm({ ...form, tarif_min: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="profil-creer-field">
              <label className={`profil-creer-label ${!isEditing ? "profil-creer-label-disabled" : ""}`}>Tarif maximum (FCFA)</label>
              <input
                type="number"
                min="0"
                max="99999999"
                className={`profil-creer-input ${!isEditing ? "profil-creer-input-disabled" : ""}`}
                placeholder="Ex: 100 000"
                value={form.tarif_max}
                onChange={(e) => setForm({ ...form, tarif_max: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="profil-creer-field">
            <label className={`profil-creer-label ${!isEditing ? "profil-creer-label-disabled" : ""}`}>Disponibilité</label>
            <div className="profil-creer-dispo-wrap">
              <button
                type="button"
                className={`profil-creer-dispo-btn ${form.disponibilite ? "active" : ""}`}
                onClick={() => isEditing && setForm({ ...form, disponibilite: true })}
                disabled={!isEditing}
              >
                Disponible
              </button>
              <button
                type="button"
                className={`profil-creer-dispo-btn ${!form.disponibilite ? "active-off" : ""}`}
                onClick={() => isEditing && setForm({ ...form, disponibilite: false })}
                disabled={!isEditing}
              >
                Indisponible
              </button>
            </div>
          </div>

          {isEditing && (
            <button type="submit" className="btn-primary-profil-creer" disabled={saving}>
              {saving ? <span className="profil-creer-spinner" /> : "Enregistrer les modifications"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}