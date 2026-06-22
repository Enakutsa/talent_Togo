import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/auth.service";
import { AuthContext } from "../../context/AuthContext";
import "../../assets/styles/Inscription.css";

export default function Inscription() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    mot_de_passe: "",
    mot_de_passe_confirmation: "",
    profession: "",
    ville: "",
    entreprise: "",
  });

  // ✅ CORRIGÉ
  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");

    if (!role) {
      setGeneralError("Veuillez choisir un profil : Talent ou Client.");
      return;
    }

    setLoading(true);

    try {
      const data = await register({
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        mot_de_passe: form.mot_de_passe,
        mot_de_passe_confirmation: form.mot_de_passe_confirmation,
        role,
      });

      // ✅ CORRECTION ICI
      login(data.data.utilisateur, data.data.token);

      localStorage.setItem("token", data.data.token);

      // ✅ REDIRECTION PROPRE
      navigate("/login");

    } catch (err) {
      console.log(err.response?.data);

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
    <div className="auth-container">
      <div className="auth-card">

        <h2 className="auth-title">Inscription</h2>
        <p className="auth-subtitle">Créez votre compte TalentTogo</p>

        {/* Choix rôle */}
        <div className="role-switch">
          <button
            type="button"
            className={`role-btn ${role === "talent" ? "active-talent" : ""}`}
            onClick={() => setRole("talent")}
          >
            Je suis un Talent
          </button>

          <button
            type="button"
            className={`role-btn ${role === "client" ? "active-client" : ""}`}
            onClick={() => setRole("client")}
          >
            Je suis un Client
          </button>
        </div>

        {generalError && (
          <p className="form-error-banner">{generalError}</p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="input-row">
            <div className="input-group">
              <input
                type="text"
                placeholder="Prénom"
                className="input"
                value={form.prenom}
                onChange={handleChange("prenom")}
              />
              {errors.prenom && (
                <span className="field-error">{errors.prenom[0]}</span>
              )}
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder="Nom"
                className="input"
                value={form.nom}
                onChange={handleChange("nom")}
              />
              {errors.nom && (
                <span className="field-error">{errors.nom[0]}</span>
              )}
            </div>
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              className="input"
              value={form.email}
              onChange={handleChange("email")}
            />
            {errors.email && (
              <span className="field-error">{errors.email[0]}</span>
            )}
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Mot de passe (8 caractères min.)"
              className="input"
              value={form.mot_de_passe}
              onChange={handleChange("mot_de_passe")}
            />
            {errors.mot_de_passe && (
              <span className="field-error">
                {errors.mot_de_passe[0]}
              </span>
            )}
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              className="input"
              value={form.mot_de_passe_confirmation}
              onChange={handleChange("mot_de_passe_confirmation")}
            />
          </div>

          {/* Talent */}
          {role === "talent" && (
            <>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Profession (graphiste, photographe...)"
                  className="input"
                  value={form.profession}
                  onChange={handleChange("profession")}
                />
              </div>

              <div className="input-group">
                <input
                  type="text"
                  placeholder="Ville"
                  className="input"
                  value={form.ville}
                  onChange={handleChange("ville")}
                />
              </div>

              <p className="field-hint">
                Vous pourrez compléter votre portfolio après l'inscription.
              </p>
            </>
          )}

          {/* Client */}
          {role === "client" && (
            <div className="input-group">
              <input
                type="text"
                placeholder="Entreprise (optionnel)"
                className="input"
                value={form.entreprise}
                onChange={handleChange("entreprise")}
              />
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Création du compte..." : "S'inscrire"}
          </button>

        </form>

        <p className="auth-footer-text">
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>

      </div>
    </div>
  );
}