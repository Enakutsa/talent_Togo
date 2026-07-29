import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Briefcase,
  Mail,
  Lock,
  ArrowRight,
  Check,
  Phone,
  Eye,
  EyeOff,
  UploadCloud,
  Tag,
  MapPin,
} from "lucide-react";
import { register } from "../../services/auth.service";
import { getCategories } from "../../services/categorie.service";
import "../../assets/styles/Inscription.css";

// Principales villes du Togo, du Sud au Nord
const VILLES_TOGO = [
  "Lomé",
  "Aného",
  "Tsévié",
  "Vogan",
  "Tabligbo",
  "Notsé",
  "Kpalimé",
  "Atakpamé",
  "Amlamé",
  "Badou",
  "Sotouboua",
  "Sokodé",
  "Bassar",
  "Kara",
  "Niamtougou",
  "Kandé",
  "Mango",
  "Dapaong",
];

// Autorise lettres (avec accents), espaces, apostrophes et tirets
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/;

export default function Inscription() {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    mot_de_passe: "",
    mot_de_passe_confirmation: "",
    categorie_id: "",
    ville: "",
  });

  const [document, setDocument] = useState(null);

  // Charge les catégories une seule fois (utile seulement pour les talents,
  // mais on précharge dès l'arrivée sur la page pour éviter un délai
  // au moment où l'utilisateur choisit "Talent")
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res?.data || []))
      .catch(() => setCategories([]));
  }, []);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  // Handler dédié pour nom/prénom : filtre les caractères non-alphabétiques
  // au fur et à mesure de la saisie (empêche de taper des chiffres/symboles)
  const handleNameChange = (field) => (e) => {
    const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, "");
    setForm({ ...form, [field]: value });
  };

  const ALLOWED_DOC_EXTENSIONS = ["pdf"];

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;

    if (file) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!ALLOWED_DOC_EXTENSIONS.includes(ext)) {
        setGeneralError(
          "Le document justificatif doit être un fichier PDF (pas une photo ni un document Word)."
        );
        e.target.value = ""; // reset l'input file
        setDocument(null);
        return;
      }
    }

    setGeneralError("");
    setDocument(file);
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
    if (!form.prenom.trim() || !NAME_REGEX.test(form.prenom.trim())) {
      setGeneralError("Le prénom ne doit contenir que des lettres.");
      return;
    }
    if (!form.nom.trim() || !NAME_REGEX.test(form.nom.trim())) {
      setGeneralError("Le nom ne doit contenir que des lettres.");
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
    if (role === "talent" && !document) {
      setGeneralError("Veuillez joindre un document justificatif.");
      return;
    }
    if (role === "talent" && !form.categorie_id) {
      setGeneralError("Veuillez choisir votre catégorie de service.");
      return;
    }
    if (role === "talent" && !form.ville.trim()) {
      setGeneralError("Veuillez indiquer votre ville.");
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
        payload.append("telephone", form.telephone);
        payload.append("mot_de_passe", form.mot_de_passe);
        payload.append("mot_de_passe_confirmation", form.mot_de_passe_confirmation);
        payload.append("role", role);
        payload.append("document_justificatif", document);
        payload.append("categorie_id", form.categorie_id);
        payload.append("ville", form.ville);
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

      const res = await register(payload);

      // Redirection selon le rôle
      if (res?.data?.redirect === "profil") {
        // Talent → compléter le profil
        navigate("/talent/profil/creer");
      } else {
        // Client → page de connexion
        navigate("/login");
      }
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

          {/* Sélection du rôle */}
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

            {/* Prénom + Nom */}
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
                    onChange={handleNameChange("prenom")}
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
                    onChange={handleNameChange("nom")}
                    required
                  />
                </div>
                {errors.nom && <span className="field-error">{errors.nom[0]}</span>}
              </div>
            </div>

            {/* Email */}
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

            {/* Téléphone */}
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
              {errors.telephone && <span className="field-error">{errors.telephone[0]}</span>}
            </div>

            {/* Mot de passe */}
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

            {/* Confirmer mot de passe */}
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

            {/* Catégorie + Ville (Talent uniquement) */}
            {role === "talent" && (
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Catégorie de service</label>
                  <div className="input-with-icon">
                    <Tag className="input-icon" size={17} />
                    <select
                      className="input-field"
                      value={form.categorie_id}
                      onChange={handleChange("categorie_id")}
                      required
                    >
                      <option value="">Sélectionnez une catégorie</option>
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
                      className="input-field"
                      value={form.ville}
                      onChange={handleChange("ville")}
                      required
                    >
                      <option value="">Sélectionnez une ville</option>
                      {VILLES_TOGO.map((ville) => (
                        <option key={ville} value={ville}>
                          {ville}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.ville && <span className="field-error">{errors.ville[0]}</span>}
                </div>
              </div>
            )}

            {/* Document justificatif (Talent uniquement) */}
            {role === "talent" && (
              <div className="form-field">
                <label className="form-label">Pièce justificative</label>
                <label className="dropzone-wrap">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="file-input-hidden"
                  />
                  <UploadCloud className="dropzone-icon" size={28} />
                  <span className="dropzone-title">
                    {document ? document.name : "Cliquez pour uploader"}
                  </span>
                  <span className="dropzone-subtitle">
                    RCCM, CNI ou carte professionnelle (PDF, DOC, DOCX )
                  </span>
                </label>
                {errors.document_justificatif && (
                  <span className="field-error">{errors.document_justificatif[0]}</span>
                )}
              </div>
            )}

            {/* CGU */}
            <label className="auth-checkbox-row">
              <div
                className={`auth-checkbox ${agree ? "auth-checkbox-checked" : ""}`}
                onClick={() => setAgree(!agree)}
              >
                {agree && <Check size={12} />}
              </div>
              <span className="auth-checkbox-text">
                J&apos;accepte les{" "}
                <a
                  href="/cgu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="auth-inline-link"
                >
                  Conditions d&apos;utilisation
                </a>{" "}
                et la{" "}
                <a
                  href="/confidentialite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="auth-inline-link"
                >
                  Politique de confidentialité
                </a>
              </span>
            </label>

            <button
              type="submit"
              className="btn-primary-auth"
              disabled={loading || !role || !agree}
            >
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