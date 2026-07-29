import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Camera, ArrowRight, Mail, Phone, MapPin, Tag } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { getCategories } from "../../services/categorie.service";
import { updateProfilTalent } from "../../services/profilTalent.service.js";
import "../../assets/styles/ProfilCreer.css";

export default function ProfilCreer() {
  const navigate = useNavigate();
  const { user, refreshUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [categories, setCategories] = useState([]);

useEffect(() => {
  getCategories()
    .then((res) => setCategories(res?.data || []))
    .catch(() => setCategories([]));
}, []);

const nomCategorie =
  categories.find((c) => String(c.id) === String(user?.categorie_id))?.nom || "";

  const [form, setForm] = useState({
    biographie: "",
    tarif_min: "",
    tarif_max: "",
    disponibilite: true,
  });

  // Nettoyage de l'URL de prévisualisation photo
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

    if (!photoFile) {
      setError("Veuillez ajouter une photo de profil.");
      return;
    }

    setSaving(true);

    const payload = new FormData();
    payload.append("biographie", form.biographie);
    payload.append("tarif_min", form.tarif_min);
    payload.append("tarif_max", form.tarif_max);
    payload.append("disponibilite", form.disponibilite ? "1" : "0");
    payload.append("photo", photoFile);

    try {
      await updateProfilTalent(payload);

      // ✅ Rafraîchit AuthContext.user (donc user.profilTalent.photo et
      // user.profilTalent.estComplet) AVANT de naviguer vers le dashboard.
      // Sans ça, TalentTopNav affiche encore l'ancien état (pas de photo)
      // jusqu'à un rechargement manuel — même bug que ClientProfil.jsx et
      // TalentDashboard.jsx/ProfilSection, corrigé ici de la même façon.
      await refreshUser();

      navigate("/talent/dashboard");
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

  return (
    <div className="profil-creer-bg">
      <div className="profil-creer-wrap">

        {/* Logo */}
        <div className="profil-creer-logo-block">
          <Link to="/" className="profil-creer-logo-link">
            <div className="profil-creer-logo-icon"><span>T</span></div>
            <span className="profil-creer-logo-text">
              Talent<span className="profil-creer-logo-accent">Togo</span>
            </span>
          </Link>
          <p className="profil-creer-tagline">
            Bonjour {user?.prenom || ""} ! Complétez votre profil pour commencer à recevoir des demandes.
          </p>
        </div>

        <div className="profil-creer-card">
          <h1 className="profil-creer-title">Compléter mon profil</h1>
          <p className="profil-creer-subtitle">
            Les informations grisées ont été renseignées lors de votre inscription. Remplissez les champs restants.
          </p>

          {error && <p className="profil-creer-error">{error}</p>}

          <form onSubmit={handleSubmit} className="profil-creer-form">

            {/* ── Photo ── */}
            <div className="profil-creer-photo-row">
              <div className="profil-creer-photo-wrap">
                {photoPreview ? (
                  <img src={photoPreview} alt="Aperçu" className="profil-creer-photo" />
                ) : (
                  <div className="profil-creer-photo-placeholder"><User size={26} /></div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="profil-creer-photo-btn"
                >
                  <Camera size={13} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="profil-creer-photo-label">Photo de profil <span className="profil-creer-required">*</span></p>
                <p className="profil-creer-photo-hint">JPG ou PNG — 3 Mo max</p>
              </div>
            </div>

            {/* ── Infos de base grisées (lecture seule) ── */}
            <div className="profil-creer-section-title">Informations de compte</div>

            <div className="profil-creer-row">
              <div className="profil-creer-field">
                <label className="profil-creer-label profil-creer-label-disabled">Prénom</label>
                <div className="profil-creer-input-icon">
                  <User size={16} className="profil-creer-icon" />
                  <input
                    type="text"
                    className="profil-creer-input profil-creer-input-disabled"
                    value={user?.prenom || ""}
                    disabled
                  />
                </div>
              </div>
              <div className="profil-creer-field">
                <label className="profil-creer-label profil-creer-label-disabled">Nom</label>
                <div className="profil-creer-input-icon">
                  <User size={16} className="profil-creer-icon" />
                  <input
                    type="text"
                    className="profil-creer-input profil-creer-input-disabled"
                    value={user?.nom || ""}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="profil-creer-row">
              <div className="profil-creer-field">
                <label className="profil-creer-label profil-creer-label-disabled">Email</label>
                <div className="profil-creer-input-icon">
                  <Mail size={16} className="profil-creer-icon" />
                  <input
                    type="text"
                    className="profil-creer-input profil-creer-input-disabled"
                    value={user?.email || ""}
                    disabled
                  />
                </div>
              </div>
              <div className="profil-creer-field">
                <label className="profil-creer-label profil-creer-label-disabled">Téléphone</label>
                <div className="profil-creer-input-icon">
                  <Phone size={16} className="profil-creer-icon" />
                  <input
                    type="text"
                    className="profil-creer-input profil-creer-input-disabled"
                    value={user?.telephone || ""}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="profil-creer-row">
              <div className="profil-creer-field">
                <label className="profil-creer-label profil-creer-label-disabled">Catégorie</label>
                <div className="profil-creer-input-icon">
                  <Tag size={16} className="profil-creer-icon" />
                  <input
                         type="text"
                         className="profil-creer-input profil-creer-input-disabled"
                           value={nomCategorie}
                        disabled
                         />
                </div>
              </div>
              <div className="profil-creer-field">
                <label className="profil-creer-label profil-creer-label-disabled">Ville</label>
                <div className="profil-creer-input-icon">
                  <MapPin size={16} className="profil-creer-icon" />
                  <input
                    type="text"
                    className="profil-creer-input profil-creer-input-disabled"
                    value={user?.ville || ""}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* ── Infos à compléter ── */}
            <div className="profil-creer-section-title">Informations professionnelles</div>

            {/* Biographie */}
            <div className="profil-creer-field">
              <label className="profil-creer-label">
                Biographie <span className="profil-creer-required">*</span>
              </label>
              <textarea
                rows={4}
                maxLength={2000}
                className="profil-creer-input profil-creer-textarea"
                placeholder="Présentez votre activité, votre expérience, votre style de travail..."
                value={form.biographie}
                onChange={(e) => setForm({ ...form, biographie: e.target.value })}
                required
              />
            </div>

            {/* Tarifs */}
            <div className="profil-creer-row">
              <div className="profil-creer-field">
                <label className="profil-creer-label">Tarif minimum (FCFA)</label>
                <input
                  type="number"
                  min="0"
                  max="99999999"
                  className="profil-creer-input"
                  placeholder="Ex: 10 000"
                  value={form.tarif_min}
                  onChange={(e) => setForm({ ...form, tarif_min: e.target.value })}
                />
              </div>
              <div className="profil-creer-field">
                <label className="profil-creer-label">Tarif maximum (FCFA)</label>
                <input
                  type="number"
                  min="0"
                  max="99999999"
                  className="profil-creer-input"
                  placeholder="Ex: 100 000"
                  value={form.tarif_max}
                  onChange={(e) => setForm({ ...form, tarif_max: e.target.value })}
                />
              </div>
            </div>

            {/* Disponibilité */}
            <div className="profil-creer-field">
              <label className="profil-creer-label">Disponibilité</label>
              <div className="profil-creer-dispo-wrap">
                <button
                  type="button"
                  className={`profil-creer-dispo-btn ${form.disponibilite ? "active" : ""}`}
                  onClick={() => setForm({ ...form, disponibilite: true })}
                >
                  Disponible
                </button>
                <button
                  type="button"
                  className={`profil-creer-dispo-btn ${!form.disponibilite ? "active-off" : ""}`}
                  onClick={() => setForm({ ...form, disponibilite: false })}
                >
                  Indisponible
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary-profil-creer" disabled={saving}>
              {saving ? (
                <span className="profil-creer-spinner" />
              ) : (
                <>Terminer et accéder au tableau de bord <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}