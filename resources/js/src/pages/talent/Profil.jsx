import { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { User, Camera, Mail, Phone, MapPin, Tag } from "lucide-react";
import { getProfilTalent, updateProfilTalent } from "../../services/profilTalent.service";
import { getCategories } from "../../services/categorie.service";
import "../../assets/styles/ProfilCreer.css";

const VILLES_TOGO = [
  "Lomé", "Aného", "Tsévié", "Vogan", "Tabligbo", "Notsé", "Kpalimé",
  "Atakpamé", "Amlamé", "Badou", "Sotouboua", "Sokodé", "Bassar",
  "Kara", "Niamtougou", "Kandé", "Mango", "Dapaong",
];

export default function Profil() {
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
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
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
          prenom: p.prenom ?? "",
          nom: p.nom ?? "",
          email: p.email ?? "",
          telephone: p.telephone ?? "",
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
    payload.append("prenom", form.prenom);
    payload.append("nom", form.nom);
    payload.append("email", form.email);
    payload.append("telephone", form.telephone);
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

          <div className="profil-creer-section-title">Informations de compte</div>

          <div className="profil-creer-row">
            <div className="profil-creer-field">
              <label className="profil-creer-label">Prénom</label>
              <div className="profil-creer-input-icon">
                <User size={16} className="profil-creer-icon" />
                <input
                  type="text"
                  className={`profil-creer-input ${!isEditing ? "profil-creer-input-disabled" : ""}`}
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="profil-creer-field">
              <label className="profil-creer-label">Nom</label>
              <div className="profil-creer-input-icon">
                <User size={16} className="profil-creer-icon" />
                <input
                  type="text"
                  className={`profil-creer-input ${!isEditing ? "profil-creer-input-disabled" : ""}`}
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          <div className="profil-creer-row">
            <div className="profil-creer-field">
              <label className="profil-creer-label">Email</label>
              <div className="profil-creer-input-icon">
                <Mail size={16} className="profil-creer-icon" />
                <input
                  type="email"
                  className={`profil-creer-input ${!isEditing ? "profil-creer-input-disabled" : ""}`}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="profil-creer-field">
              <label className="profil-creer-label">Téléphone</label>
              <div className="profil-creer-input-icon">
                <Phone size={16} className="profil-creer-icon" />
                <input
                  type="text"
                  maxLength={8}
                  className={`profil-creer-input ${!isEditing ? "profil-creer-input-disabled" : ""}`}
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

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

          <div className="profil-creer-section-title">Informations professionnelles</div>

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