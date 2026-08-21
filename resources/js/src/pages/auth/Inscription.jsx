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
import { uploadDirectToCloudinary } from "../../services/cloudinaryDirect.service";
import "../../assets/styles/Inscription.css";

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

const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/;

const FIELD_ORDER = [
  "prenom",
  "nom",
  "email",
  "telephone",
  "mot_de_passe",
  "mot_de_passe_confirmation",
  "categorie_id",
  "ville",
  "document_justificatif",
];

function scrollToField(fieldName) {
  setTimeout(() => {
    const el = document.getElementById(`field-${fieldName}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (typeof el.focus === "function") {
        el.focus({ preventScroll: true });
      }
    }
  }, 50);
}

export default function Inscription() {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [plan, setPlan] = useState("gratuit");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(null);
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
  const [pwdTouched, setPwdTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const PHONE_REGEX = /^[972]\d{7}$/;
  const phoneIsValid = PHONE_REGEX.test(form.telephone);

  const pwd = form.mot_de_passe;
  const pwdChecks = {
    length: pwd.length === 8,
    letter: /[A-Za-z]/.test(pwd),
    digit: /\d/.test(pwd),
    special: /[^A-Za-z0-9\s]/.test(pwd),
  };
  const pwdIsValid = Object.values(pwdChecks).every(Boolean);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res?.data || []))
      .catch(() => setCategories([]));
  }, []);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleNameChange = (field) => (e) => {
    const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, "");
    setForm({ ...form, [field]: value });
  };

  const handlePasswordChange = (field) => (e) => {
    const value = e.target.value.slice(0, 8);
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
        e.target.value = "";
        setDocument(null);
        scrollToField("document_justificatif");
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
      setErrors({ prenom: ["Le prénom ne doit contenir que des lettres."] });
      scrollToField("prenom");
      return;
    }
    if (!form.nom.trim() || !NAME_REGEX.test(form.nom.trim())) {
      setErrors({ nom: ["Le nom ne doit contenir que des lettres."] });
      scrollToField("nom");
      return;
    }
    if (!form.email.toLowerCase().endsWith("@gmail.com")) {
      setErrors({ email: ["L'adresse e-mail doit être une adresse Gmail (@gmail.com)."] });
      scrollToField("email");
      return;
    }
    if (!phoneIsValid) {
      setPhoneTouched(true);
      scrollToField("telephone");
      return;
    }
    if (!pwdIsValid) {
      setPwdTouched(true);
      scrollToField("mot_de_passe");
      return;
    }
    if (form.mot_de_passe !== form.mot_de_passe_confirmation) {
      setErrors({ mot_de_passe_confirmation: ["Les mots de passe ne correspondent pas."] });
      scrollToField("mot_de_passe_confirmation");
      return;
    }
    if (role === "talent" && !document) {
      setErrors({ document_justificatif: ["Veuillez joindre un document justificatif."] });
      scrollToField("document_justificatif");
      return;
    }
    if (role === "talent" && !form.categorie_id) {
      setErrors({ categorie_id: ["Veuillez choisir votre catégorie de service."] });
      scrollToField("categorie_id");
      return;
    }
    if (role === "talent" && !form.ville.trim()) {
      setErrors({ ville: ["Veuillez indiquer votre ville."] });
      scrollToField("ville");
      return;
    }

    setLoading(true);

    try {
      let payload = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        telephone: form.telephone,
        mot_de_passe: form.mot_de_passe,
        mot_de_passe_confirmation: form.mot_de_passe_confirmation,
        role,
        ...(role === "talent" ? { plan } : {}),
      };

      if (role === "talent") {
        setLoadingStep("upload");
        let documentUpload;
        try {
          documentUpload = await uploadDirectToCloudinary(document);
        } catch (uploadErr) {
          setGeneralError("Échec de l'envoi du document justificatif. Réessayez.");
          setLoading(false);
          setLoadingStep(null);
          scrollToField("document_justificatif");
          return;
        }

        payload = {
          ...payload,
          document_justificatif_url: documentUpload.url,
          categorie_id: form.categorie_id,
          ville: form.ville,
        };
      }

      setLoadingStep("creation");
      const res = await register(payload);

      if (res?.data?.redirect === "profil") {
        navigate("/talent/profil/creer");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Erreur inscription:", err.response?.data || err.message);
      if (err.response?.status === 422) {
        const serverErrors = err.response.data.errors || {};
        setErrors(serverErrors);

        const firstErrorField = FIELD_ORDER.find((f) => serverErrors[f]);
        if (firstErrorField) {
          scrollToField(firstErrorField);
        }
      } else {
        setGeneralError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-wrap">
        <div className="auth-logo-block">
          <Link to="/" className="auth-logo-link">
            <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
              <circle cx="21" cy="21" r="19" fill="#fff7ed" stroke="#ea580c" strokeWidth="2"/>
              <text x="21" y="28" textAnchor="middle" fontSize="16" fontWeight="700" fill="#166534" fontFamily="Georgia, 'Fraunces', serif">TT</text>
            </svg>
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
              Votre compte sera examiné et validé par un administrateur dans un délai de 48h.
            </div>
          )}

          {role === "talent" && (
            <div className="plan-cards-grid">
              <div
                className={`plan-card ${plan === "gratuit" ? "selected" : ""}`}
                onClick={() => setPlan("gratuit")}
              >
                <div className="plan-card-header">
                  <h3 className="plan-card-title">1 mois gratuit</h3>
                  {plan === "gratuit" && (
                    <div className="role-check-badge role-check-talent">
                      <Check size={11} />
                    </div>
                  )}
                </div>
                <p className="plan-card-price">0 FCFA <span>/ 30 jours</span></p>
                <p className="plan-card-desc">
                  Essayez la plateforme gratuitement pendant 30 jours, sans engagement.
                </p>
              </div>

              <div
                className={`plan-card ${plan === "payant" ? "selected" : ""}`}
                onClick={() => setPlan("payant")}
              >
                <div className="plan-card-header">
                  <h3 className="plan-card-title">S'abonner maintenant</h3>
                  {plan === "payant" && (
                    <div className="role-check-badge role-check-talent">
                      <Check size={11} />
                    </div>
                  )}
                </div>
                <p className="plan-card-price">12 000 FCFA <span>/ an</span></p>
                <p className="plan-card-desc">
                  Activez votre visibilité immédiatement. Paiement demandé juste après l'inscription.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-2">

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Prénom</label>
                <div className="input-with-icon">
                  <User className="input-icon" size={17} />
                  <input
                    id="field-prenom"
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
                    id="field-nom"
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

            <div className="form-field">
              <label className="form-label">Adresse e-mail</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={17} />
                <input
                  id="field-email"
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
              <div
                className="input-with-icon"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Phone className="input-icon" size={17} />
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "5px 10px 5px 5px",
                    marginRight: "4px",
                    borderRight: "1px solid #e5e7eb",
                    whiteSpace: "nowrap",
                    color: "#374151",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src="https://flagcdn.com/w80/tg.png"
                      srcSet="https://flagcdn.com/w160/tg.png 2x"
                      alt="Togo"
                      style={{
                        width: "150%",
                        height: "150%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </span>
                  +228
                </span>
                <input
                  id="field-telephone"
                  type="tel"
                  className="input-field"
                  placeholder="90000000"
                  maxLength={8}
                  value={form.telephone}
                  onChange={(e) =>
                    setForm({ ...form, telephone: e.target.value.replace(/\D/g, "").slice(0, 8) })
                  }
                  onBlur={() => setPhoneTouched(true)}
                  required
                  style={{ paddingLeft: 0, letterSpacing: "4px", textAlign: "center" }}
                />
              </div>
              {errors.telephone && <span className="field-error">{errors.telephone[0]}</span>}
              {phoneTouched && form.telephone.length > 0 && !phoneIsValid && (
                <span className="field-error">
                  Numéro togolais invalide : il doit commencer par 9, 7 ou 2, suivi de 7 chiffres.
                </span>
              )}
            </div>

            <div className="form-field">
              <label className="form-label">Mot de passe</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={17} />
                <input
                  id="field-mot_de_passe"
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="Mot de passe"
                  maxLength={8}
                  value={form.mot_de_passe}
                  onChange={handlePasswordChange("mot_de_passe")}
                  onBlur={() => setPwdTouched(true)}
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
              {pwdTouched && pwd.length > 0 && !pwdIsValid && (
                <span className="field-error">
                  Le mot de passe doit contenir exactement 8 caractères, avec au moins une lettre, un chiffre et un caractère spécial.
                </span>
              )}
            </div>

            <div className="form-field">
              <label className="form-label">Confirmer le mot de passe</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={17} />
                <input
                  id="field-mot_de_passe_confirmation"
                  type={showPasswordConfirm ? "text" : "password"}
                  className="input-field"
                  placeholder="Retapez votre mot de passe"
                  maxLength={8}
                  value={form.mot_de_passe_confirmation}
                  onChange={handlePasswordChange("mot_de_passe_confirmation")}
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
              {errors.mot_de_passe_confirmation && (
                <span className="field-error">{errors.mot_de_passe_confirmation[0]}</span>
              )}
            </div>

            {role === "talent" && (
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Catégorie de service</label>
                  <div className="input-with-icon">
                    <Tag className="input-icon" size={17} />
                    <select
                      id="field-categorie_id"
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
                      id="field-ville"
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

            {role === "talent" && (
              <div className="form-field">
                <label className="form-label">Pièce justificative</label>
                <label id="field-document_justificatif" className="dropzone-wrap" tabIndex={-1}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="file-input-hidden"
                  />
                  <UploadCloud className="dropzone-icon" size={28} />
                  <span className="dropzone-title">
                    {document ? document.name : "Cliquez pour uploader"}
                  </span>
                  <span className="dropzone-subtitle">
                    RCCM, CNI ou carte professionnelle (PDF uniquement)
                  </span>
                </label>
                {errors.document_justificatif && (
                  <span className="field-error">{errors.document_justificatif[0]}</span>
                )}
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
                J'accepte les{" "}
                <a href="/cgu" target="_blank" rel="noopener noreferrer" className="auth-inline-link">
                  Conditions d'utilisation
                </a>{" "}
                et la{" "}
                <a href="/confidentialite" target="_blank" rel="noopener noreferrer" className="auth-inline-link">
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
                <>
                  <span className="auth-spinner" />
                  {loadingStep === "upload"
                    ? "Envoi du document en cours..."
                    : loadingStep === "creation"
                    ? "Création du compte..."
                    : "Veuillez patienter..."}
                </>
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