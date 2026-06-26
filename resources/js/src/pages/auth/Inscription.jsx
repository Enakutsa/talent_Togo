import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Briefcase,
  Mail,
  Lock,
  ArrowRight,
  Check,
  MapPin,
  Tag,
  DollarSign,
  FileText,
  Phone,
  Eye,
  EyeOff,
  UploadCloud,
} from "lucide-react";
import api, { register } from "../../services/auth.service";
import "../../assets/styles/Inscription.css";

const VILLES = [
  "Lomé",
  "Kara",
  "Sokodé",
  "Kpalimé",
  "Atakpamé",
  "Dapaong",
  "Tsévié",
  "Autre",
];

export default function Inscription() {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const [categories, setCategories] = useState([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    mot_de_passe: "",
    mot_de_passe_confirmation: "",
    categorie_id: "",
    ville: "",
    telephone: "",
    tarif_min: "",
    tarif_max: "",
    biographie: "",
  });

  const [document, setDocument] = useState(null);
  const [photo, setPhoto] = useState(null);

  // Charge les vraies catégories depuis l'API au montage du composant
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        const list = res.data?.data;
        if (Array.isArray(list)) setCategories(list);
      })
      .catch(() => {
        // En cas d'échec, la liste reste vide ; le select affichera juste "Choisir..."
      });
  }, []);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleFileChange = (e) => {
    setDocument(e.target.files[0] || null);
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");

    if (!role) {
      setGeneralError("Veuillez choisir un profil : Talent ou Client.");
      return;
    }
    if (!agree) {
      setGeneralError("Veuillez accepter les conditions d'utilisation.");
      return;
    }
    if (!form.email.toLowerCase().endsWith("@gmail.com")) {
      setGeneralError("L'adresse e-mail doit être une adresse Gmail (@gmail.com).");
      return;
    }
    if (!/^[0-9]{8}$/.test(form.telephone)) {
      setGeneralError("Le numéro de téléphone doit contenir exactement 8 chiffres.");
      return;
    }
    if (role === "talent" && (!form.categorie_id || !form.ville)) {
      setGeneralError("Veuillez renseigner votre catégorie et votre ville.");
      return;
    }
    if (role === "talent" && !photo) {
      setGeneralError("Veuillez ajouter une photo de profil.");
      return;
    }

    setLoading(true);

    try {
      let payload;

      if (role === "talent") {
        payload = new FormData();
        payload.append("nom", form.nom);
        payload.append("prenom", form.prenom);
        payload.append("email", form.email);
        payload.append("mot_de_passe", form.mot_de_passe);
        payload.append(
          "mot_de_passe_confirmation",
          form.mot_de_passe_confirmation
        );
        payload.append("role", role);
        payload.append("categorie_id", form.categorie_id);
        payload.append("ville", form.ville);
        if (form.telephone) payload.append("telephone", form.telephone);
        if (form.tarif_min) payload.append("tarif_min", form.tarif_min);
        if (form.tarif_max) payload.append("tarif_max", form.tarif_max);
        if (form.biographie) payload.append("biographie", form.biographie);
        if (document) {
          payload.append("document_justificatif", document);
        }
        if (photo) {
          payload.append("photo", photo);
        }
      } else {
        payload = {
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          telephone: form.telephone,
          mot_de_passe: form.mot_de_passe,
          mot_de_passe_confirmation: form.mot_de_passe_confirmation,
          role,
        };
      }

      await register(payload);
      navigate("/login");
    } catch (err) {
      console.error("Erreur inscription:", err.response?.data || err.message);
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setGeneralError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-wrap">
        <div className="auth-logo-block">
          <Link to="/" className="auth-logo-link">
            <div className="auth-logo-icon">
              <span>T</span>
            </div>
            <span className="auth-logo-text">
              Talent<span className="auth-logo-accent">Togo</span>
            </span>
          </Link>
          <p className="auth-logo-tagline">
            Rejoignez la communauté des talents togolais
          </p>
        </div>

        <div className="auth-card-2">
          <h1 className="auth-card-title">Créer un compte</h1>
          <p className="auth-card-subtitle">
            Choisissez votre profil pour commencer.
          </p>

          {generalError && <p className="form-error-banner">{generalError}</p>}

          <div className="role-cards-grid">
            <div
              className={`role-card role-card-talent ${role === "talent" ? "selected" : ""}`}
              onClick={() => setRole("talent")}
            >
              <div className={`role-icon-wrap ${role === "talent" ? "role-icon-active-talent" : ""}`}>
                <Briefcase size={22} />
              </div>
              <h3 className="role-card-title">Je suis un Talent</h3>
              <p className="role-card-desc">Photographe, graphiste, couturier...</p>
              {role === "talent" && (
                <div className="role-check-badge role-check-talent">
                  <Check size={11} />
                </div>
              )}
            </div>

            <div
              className={`role-card role-card-client ${role === "client" ? "selected" : ""}`}
              onClick={() => setRole("client")}
            >
              <div className={`role-icon-wrap ${role === "client" ? "role-icon-active-client" : ""}`}>
                <User size={22} />
              </div>
              <h3 className="role-card-title">Je suis un Client</h3>
              <p className="role-card-desc">Je cherche un prestataire</p>
              {role === "client" && (
                <div className="role-check-badge role-check-client">
                  <Check size={11} />
                </div>
              )}
            </div>
          </div>

          {role === "talent" && (
            <div className="talent-info-banner">
              ℹ️ Votre compte sera examiné et validé par un administrateur dans un délai de 48h.
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-2">
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Prénom</label>
                <div className="input-with-icon">
                  <User className="input-icon" size={17} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Koffi"
                    value={form.prenom}
                    onChange={handleChange("prenom")}
                    required
                  />
                </div>
                {errors.prenom && <span className="field-error">{errors.prenom[0]}</span>}
              </div>

              <div className="form-field">
                <label className="form-label">Nom</label>
                <div className="input-with-icon">
                  <User className="input-icon" size={17} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Mensah"
                    value={form.nom}
                    onChange={handleChange("nom")}
                    required
                  />
                </div>
                {errors.nom && <span className="field-error">{errors.nom[0]}</span>}
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Adresse e-mail</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={17} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="koffi@gmail.com"
                  value={form.email}
                  onChange={handleChange("email")}
                  required
                />
              </div>
              {errors.email && <span className="field-error">{errors.email[0]}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Téléphone</label>
              <div className="input-with-icon">
                <Phone className="input-icon" size={17} />
                <input
                  type="tel"
                  className="input-field"
                  placeholder="Ex: 90000000"
                  maxLength={8}
                  value={form.telephone}
                  onChange={(e) =>
                    setForm({ ...form, telephone: e.target.value.replace(/\D/g, "").slice(0, 8) })
                  }
                  required
                />
              </div>
              {errors.telephone && (
                <span className="field-error">{errors.telephone[0]}</span>
              )}
            </div>

            <div className="form-field">
              <label className="form-label">Mot de passe</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="8 caractères minimum"
                  value={form.mot_de_passe}
                  onChange={handleChange("mot_de_passe")}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.mot_de_passe && <span className="field-error">{errors.mot_de_passe[0]}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Confirmer le mot de passe</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={17} />
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  className="input-field"
                  placeholder="Retapez votre mot de passe"
                  value={form.mot_de_passe_confirmation}
                  onChange={handleChange("mot_de_passe_confirmation")}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  tabIndex={-1}
                >
                  {showPasswordConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {role === "talent" && (
              <div className="talent-fields-block">
                <p className="talent-fields-title">Informations professionnelles</p>

                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Catégorie</label>
                    <div className="input-with-icon">
                      <Tag className="input-icon" size={17} />
                      <select
                        className="input-field select-field"
                        value={form.categorie_id}
                        onChange={handleChange("categorie_id")}
                        required
                      >
                        <option value="">Choisir...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.categorie_id && (
                      <span className="field-error">{errors.categorie_id[0]}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="form-label">Ville</label>
                    <div className="input-with-icon">
                      <MapPin className="input-icon" size={17} />
                      <select
                        className="input-field select-field"
                        value={form.ville}
                        onChange={handleChange("ville")}
                        required
                      >
                        <option value="">Choisir...</option>
                        {VILLES.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.ville && <span className="field-error">{errors.ville[0]}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Tarif min (FCFA)</label>
                    <div className="input-with-icon">
                      <DollarSign className="input-icon" size={17} />
                      <input
                        type="number"
                        min="0"
                        max="99999999"
                        className="input-field"
                        placeholder="Ex: 10000"
                        value={form.tarif_min}
                        onChange={handleChange("tarif_min")}
                      />
                    </div>
                    {errors.tarif_min && <span className="field-error">{errors.tarif_min[0]}</span>}
                  </div>

                  <div className="form-field">
                    <label className="form-label">Tarif max (FCFA)</label>
                    <div className="input-with-icon">
                      <DollarSign className="input-icon" size={17} />
                      <input
                        type="number"
                        min="0"
                        max="99999999"
                        className="input-field"
                        placeholder="Ex: 50000"
                        value={form.tarif_max}
                        onChange={handleChange("tarif_max")}
                      />
                    </div>
                    {errors.tarif_max && <span className="field-error">{errors.tarif_max[0]}</span>}
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Biographie / Présentation (optionnel)
                  </label>
                  <textarea
                    className="input-field textarea-field"
                    rows={4}
                    placeholder="Parlez de votre parcours, votre expérience, votre style de travail..."
                    value={form.biographie}
                    onChange={handleChange("biographie")}
                  />
                  {errors.biographie && (
                    <span className="field-error">{errors.biographie[0]}</span>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Pièce justificative / Portfolio (PDF, image — optionnel)
                  </label>
                  <label className="dropzone-wrap">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="file-input-hidden"
                    />
                    <UploadCloud className="dropzone-icon" size={28} />
                    <span className="dropzone-title">
                      {document ? document.name : "Cliquez pour uploader"}
                    </span>
                    <span className="dropzone-subtitle">
                      Registre de commerce (RCCM) ou CNI (JPG, PNG, PDF — max 5 MB)
                    </span>
                  </label>
                  {errors.document_justificatif && (
                    <span className="field-error">{errors.document_justificatif[0]}</span>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">Photo de profil</label>
                  <label className="dropzone-wrap">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handlePhotoChange}
                      className="file-input-hidden"
                    />
                    <UploadCloud className="dropzone-icon" size={28} />
                    <span className="dropzone-title">
                      {photo ? photo.name : "Cliquez pour uploader"}
                    </span>
                    <span className="dropzone-subtitle">
                      Photo de profil claire et récente (JPG, PNG — max 3 MB)
                    </span>
                  </label>
                  {errors.photo && <span className="field-error">{errors.photo[0]}</span>}
                </div>
              </div>
            )}

            <label className="auth-checkbox-row">
              <div
                className={`auth-checkbox ${agree ? "auth-checkbox-checked" : ""}`}
                onClick={() => setAgree(!agree)}
              >
                {agree && <Check size={12} />}
              </div>
              <span className="auth-checkbox-text">
                J&apos;accepte les{" "}
                <Link to="/cgu" className="auth-inline-link">
                  Conditions d&apos;utilisation
                </Link>{" "}
                et la{" "}
                <Link to="/confidentialite" className="auth-inline-link">
                  Politique de confidentialité
                </Link>
              </span>
            </label>

            <button type="submit" className="btn-primary-auth" disabled={loading || !role || !agree}>
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  Créer mon compte <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="auth-bottom-text">
            Déjà inscrit ?{" "}
            <Link to="/login" className="auth-inline-link-strong">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}