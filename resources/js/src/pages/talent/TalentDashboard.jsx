import { useState, useContext, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  ClipboardList, TrendingUp, ChevronRight, Eye, Star, Search,
  User, Camera, Mail, Phone, MapPin, Tag,
} from "lucide-react";
import { getProfilTalent, updateProfilTalent } from "../../services/profilTalent.service";
import { getCategories } from "../../services/categorie.service";
import { getDemandesRecues } from "../../services/demande.service";
import TalentTopNav, { NAV_ITEMS } from "../../components/TalentTopNav";
import "../../assets/styles/TalentDashboard.css";
import "../../assets/styles/ProfilCreer.css";

export default function TalentDashboard() {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [activeKey, setActiveKey] = useState("dashboard");

  useEffect(() => {
    if (location.state?.activeKey) {
      setActiveKey(location.state.activeKey);
    }
  }, [location.state]);

  return (
    <div className="td-root">
      <TalentTopNav activeKey={activeKey} />

      <main className="td-main">
        {activeKey === "dashboard" && <DashboardSection user={user} />}

        {activeKey === "profil" && <ProfilSection />}

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

const statutColor = { en_attente: "orange", acceptee: "green", refusee: "red", terminee: "blue" };
const statutLabel = { en_attente: "En attente", acceptee: "Acceptée", refusee: "Refusée", terminee: "Terminée" };

function DashboardSection({ user }) {
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profil, setProfil] = useState(null);
  const [profilLoading, setProfilLoading] = useState(true);

  useEffect(() => {
    getProfilTalent()
      .then((res) => setProfil(res.data))
      .catch(() => setProfil(null))
      .finally(() => setProfilLoading(false));
  }, []);

  useEffect(() => {
    getDemandesRecues()
      .then((res) => setDemandes(res.data || []))
      .catch(() => setDemandes([]))
      .finally(() => setLoading(false));
  }, []);

  const total = demandes.length;
  const enAttente = demandes.filter((d) => d.statut === "en_attente").length;
  const demandesRecentes = demandes.slice(0, 5);

  // ✅ Revenus estimés : renvoyés par ProfilTalentController::show
  // (somme des budgets des demandes terminées, voir backend).
  const revenusEstimes = profil?.revenus_estimes ?? 0;

  return (
    <div className="td-page">
      <div className="td-page-header">
        <div>
          <h1 className="td-page-title">Bonjour, {user?.prenom || "Talent"} 👋</h1>
          <p className="td-page-sub">Voici un résumé de votre activité aujourd'hui.</p>
        </div>
      </div>

      <div className="td-stats-grid-4">
        <div className="td-stat-card-v2">
          <div className="td-stat-icon-v2 td-stat-icon-blue">
            <Eye size={18} />
          </div>
          <p className="td-stat-value-v2">{profilLoading ? "…" : (profil?.vues ?? 0)}</p>
          <p className="td-stat-label-v2">Vues du profil</p>
          <p className="td-stat-sub-v2 td-stat-sub-muted">Depuis la création du profil</p>
        </div>

        <div className="td-stat-card-v2">
          <div className="td-stat-icon-v2 td-stat-icon-purple">
            <ClipboardList size={18} />
          </div>
          <p className="td-stat-value-v2">{loading ? "…" : total}</p>
          <p className="td-stat-label-v2">Demandes reçues</p>
          <p className="td-stat-sub-v2 td-stat-sub-ok">{loading ? "" : `${enAttente} en attente`}</p>
        </div>

        <div className="td-stat-card-v2">
          <div className="td-stat-icon-v2 td-stat-icon-yellow">
            <Star size={18} />
          </div>
          <p className="td-stat-value-v2">{profilLoading ? "…" : (profil?.note ?? 0)}</p>
          <p className="td-stat-label-v2">Note moyenne</p>
          <p className="td-stat-sub-v2 td-stat-sub-muted">
            {profilLoading ? "" : profil?.nb_avis > 0 ? `${profil.nb_avis} avis` : "Aucun avis"}
          </p>
        </div>

        <div className="td-stat-card-v2">
          <div className="td-stat-icon-v2 td-stat-icon-green">
            <TrendingUp size={18} />
          </div>
          <p className="td-stat-value-v2">
            {profilLoading ? "…" : `${revenusEstimes.toLocaleString("fr-FR")} FCFA`}
          </p>
          <p className="td-stat-label-v2">Revenus estimés</p>
          <p className="td-stat-sub-v2 td-stat-sub-muted">Demandes terminées</p>
        </div>
      </div>

      <button className="td-explore-banner" onClick={() => navigate("/recherche")}>
        <div className="td-explore-banner-icon">
          <Search size={20} />
        </div>
        <div className="td-explore-banner-text">
          <p className="td-explore-banner-title">Découvrez les autres talents de la plateforme</p>
          <p className="td-explore-banner-sub">Explorez les profils, inspirez-vous et suivez la concurrence.</p>
        </div>
        <ChevronRight size={18} className="td-explore-banner-arrow" />
      </button>

      <div className="td-card">
        <div className="td-card-header">
          <h2 className="td-card-title">Demandes récentes</h2>
          <button className="td-card-link" onClick={() => navigate("/talent/demandes")}>
            Voir tout <ChevronRight size={14} />
          </button>
        </div>
        <div className="td-card-body">
          {loading ? (
            <p className="td-empty-text">Chargement...</p>
          ) : demandesRecentes.length === 0 ? (
            <p className="td-empty-text">Aucune demande pour le moment.</p>
          ) : (
            demandesRecentes.map((d) => (
              <div key={d.id} className="td-demande-row">
                <div className="td-demande-avatar">{d.client_nom?.[0] ?? "?"}</div>
                <div className="td-demande-info">
                  <p className="td-demande-client">{d.client_nom}</p>
                  <p className="td-demande-service">{d.message_initial}</p>
                </div>
                <div className="td-demande-right">
                  <span className={`td-statut td-statut-${statutColor[d.statut] || "orange"}`}>
                    {statutLabel[d.statut] || d.statut}
                  </span>
                  <p className="td-demande-date">
                    {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const VILLES_TOGO = [
  "Lomé", "Aného", "Tsévié", "Vogan", "Tabligbo", "Notsé", "Kpalimé",
  "Atakpamé", "Amlamé", "Badou", "Sotouboua", "Sokodé", "Bassar",
  "Kara", "Niamtougou", "Kandé", "Mango", "Dapaong",
];

function ProfilSection() {
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
    categorie_id: "",
    ville: "",
    biographie: "",
    tarif_min: "",
    tarif_max: "",
    disponibilite: true,
  });

  useEffect(() => {
    getProfilTalent()
      .then((res) => {
        const p = res.data;
        setPhotoUrl(p.photo);
        setForm({
          categorie_id: p.categorie_id ?? "",
          ville: p.ville ?? "",
          biographie: p.biographie ?? "",
          tarif_min: p.tarif_min ?? "",
          tarif_max: p.tarif_max ?? "",
          disponibilite: p.disponibilite ?? true,
        });
      })
      .catch(() => setError("Impossible de charger le profil."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res?.data || []))
      .catch(() => setCategories([]));
  }, []);

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
    payload.append("categorie_id", form.categorie_id);
    payload.append("ville", form.ville);
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
            Cliquez sur "Modifier" pour mettre à jour vos informations.
          </p>
          {!isEditing ? (
            <button type="button" className="btn-secondary-profil-creer" onClick={() => setIsEditing(true)}>
              Modifier
            </button>
          ) : (
            <button type="button" className="btn-secondary-profil-creer" onClick={() => setIsEditing(false)}>
              Annuler
            </button>
          )}
        </div>

        {error && <p className="profil-creer-error">{error}</p>}
        {success && <p className="profil-creer-success">{success}</p>}

        <form onSubmit={handleSubmit} className="profil-creer-form">

          <div className="profil-creer-photo-row">
            <div className="profil-creer-photo-wrap">
              {displayPhoto ? (
                <img src={displayPhoto} alt="Aperçu" className="profil-creer-photo" />
              ) : (
                <div className="profil-creer-photo-placeholder"><User size={26} /></div>
              )}
              {isEditing && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="profil-creer-photo-btn">
                  <Camera size={13} />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handlePhotoChange} className="hidden" />
            </div>
            <div>
              <p className="profil-creer-photo-label">Photo de profil</p>
              <p className="profil-creer-photo-hint">JPG ou PNG — 3 Mo max</p>
            </div>
          </div>

          <div className="profil-creer-section-title">Informations professionnelles</div>

          <div className="profil-creer-row">
            <div className="profil-creer-field">
              <label className="profil-creer-label">Catégorie</label>
              <div className="profil-creer-input-icon">
                <Tag size={16} className="profil-creer-icon" />
                <select
                  className={`profil-creer-input ${!isEditing ? "profil-creer-input-disabled" : ""}`}
                  value={form.categorie_id}
                  onChange={(e) => setForm({ ...form, categorie_id: e.target.value })}
                  disabled={!isEditing}
                >
                  <option value="">Sélectionnez</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="profil-creer-field">
              <label className="profil-creer-label">Ville</label>
              <div className="profil-creer-input-icon">
                <MapPin size={16} className="profil-creer-icon" />
                <select
                  className={`profil-creer-input ${!isEditing ? "profil-creer-input-disabled" : ""}`}
                  value={form.ville}
                  onChange={(e) => setForm({ ...form, ville: e.target.value })}
                  disabled={!isEditing}
                >
                  <option value="">Sélectionnez</option>
                  {VILLES_TOGO.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="profil-creer-field">
            <label className="profil-creer-label">Biographie</label>
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
              <label className="profil-creer-label">Tarif minimum (FCFA)</label>
              <input
                type="number"
                min="0"
                max="99999999"
                className={`profil-creer-input ${!isEditing ? "profil-creer-input-disabled" : ""}`}
                value={form.tarif_min}
                onChange={(e) => setForm({ ...form, tarif_min: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="profil-creer-field">
              <label className="profil-creer-label">Tarif maximum (FCFA)</label>
              <input
                type="number"
                min="0"
                max="99999999"
                className={`profil-creer-input ${!isEditing ? "profil-creer-input-disabled" : ""}`}
                value={form.tarif_max}
                onChange={(e) => setForm({ ...form, tarif_max: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="profil-creer-field">
            <label className="profil-creer-label">Disponibilité</label>
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