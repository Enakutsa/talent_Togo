import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { login as loginApi, verifyLoginOtp, resendOtp } from "../../services/auth.service";
import { AuthContext } from "../../context/AuthContext";
import "../../assets/styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [step, setStep] = useState("credentials"); // "credentials" | "otp"
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [errors, setErrors] = useState({});

  const [email, setEmail] = useState("");
  const [utilisateurId, setUtilisateurId] = useState(null);
  const [code, setCode] = useState("");

  // Décompte du blocage (en secondes) après 5 tentatives ratées
  const [blockedSeconds, setBlockedSeconds] = useState(0);
  const intervalRef = useRef(null);

  // ✅ Correction bug : dépendance sur la valeur, pas sur une expression booléenne
  useEffect(() => {
    if (blockedSeconds <= 0) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setBlockedSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setGeneralError("");
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [blockedSeconds]); // ✅ corrigé

  // ✅ STEP EMAIL
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");
    setLoading(true);

    try {
      const data = await loginApi({ email });
      setUtilisateurId(data.utilisateur_id);
      setStep("otp");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else if (err.response?.status === 404) {
        setGeneralError("Aucun compte trouvé avec cet email.");
      } else if (err.response?.status === 403) {
        setGeneralError(
          err.response.data.message || "Votre compte n'est pas encore activé."
        );
      } else {
        setGeneralError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ STEP OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!utilisateurId) {
      setGeneralError("Erreur utilisateur. Reconnectez-vous.");
      return;
    }

    if (code.length !== 6) {
      setGeneralError("Le code doit contenir 6 chiffres.");
      return;
    }

    if (blockedSeconds > 0) return;

    const codeEnvoye = code;
    setCode("");
    setLoading(true);

    try {
      const data = await verifyLoginOtp({
        utilisateur_id: utilisateurId,
        code: codeEnvoye,
      });

      // Sauvegarde du token et de l'utilisateur dans le contexte
      login(data.data.utilisateur, data.data.token);
      localStorage.setItem("token", data.data.token);

      // ✅ Redirection basée sur ce que le backend décide
      const redirect = data.data.redirect;

      if (redirect === "admin") {
        navigate("/admin");
      } else if (redirect === "talent/profil/creer") {
        navigate("/talent/profil/creer");
      } else if (redirect === "talent/dashboard") {
        navigate("/talent/dashboard");
      } else {
        // Client ou fallback
        navigate("/");
      }

    } catch (err) {
      const status = err.response?.status;
      const retryAfter = err.response?.data?.retry_after;

      if (status === 429 && retryAfter) {
        setBlockedSeconds(retryAfter);
        setGeneralError("");
      } else if (status === 429) {
        setGeneralError("Trop de tentatives. Réessayez plus tard.");
      } else if (status === 422) {
        setGeneralError(err.response.data.message || "Code invalide ou expiré.");
      } else {
        setGeneralError("Erreur serveur. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ RESEND
  const handleResend = async () => {
    if (blockedSeconds > 0) return;
    setGeneralError("");

    try {
      await resendOtp(utilisateurId);
      setGeneralError("✅ Nouveau code envoyé !");
    } catch (err) {
      setGeneralError("Impossible de renvoyer le code.");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-wrap">

        {/* LOGO */}
        <div className="login-logo-block">
          <Link to="/" className="login-logo-link">
            <div className="login-logo-icon">
              <span>T</span>
            </div>
            <span className="login-logo-text">
              Talent<span className="login-logo-accent">Togo</span>
            </span>
          </Link>

          <p className="login-logo-tagline">
            {step === "credentials"
              ? "Content de vous revoir !"
              : "Vérification de sécurité"}
          </p>
        </div>

        <div className="login-card">

          {/* EMAIL */}
          {step === "credentials" ? (
            <>
              <h1 className="login-card-title">Connexion</h1>

              {generalError && (
                <p className="form-error-banner-login">{generalError}</p>
              )}

              <form onSubmit={handleCredentialsSubmit} className="login-form">
                <div className="login-field">
                  <label className="login-label">Adresse e-mail</label>
                  <div className="login-input-wrap">
                    <Mail size={17} />
                    <input
                      type="email"
                      className="login-input"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  {errors.email && (
                    <span className="login-field-error">{errors.email[0]}</span>
                  )}
                </div>

                <button className="btn-primary-login" disabled={loading}>
                  {loading ? (
                    <span className="login-spinner" />
                  ) : (
                    <>
                      Recevoir le code <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="login-bottom-text">
                Pas encore de compte ?{" "}
                <Link to="/register">S'inscrire</Link>
              </p>
            </>
          ) : (

            /* OTP */
            <>
              <div className="login-otp-icon-wrap">
                <ShieldCheck size={28} />
              </div>

              <h1 className="login-card-title">Vérification</h1>
              <p className="login-card-subtitle">
                Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
              </p>

              {blockedSeconds > 0 && (
                <p className="form-error-banner-login">
                  Trop de tentatives. Réessayez dans {blockedSeconds}s.
                </p>
              )}
              {blockedSeconds === 0 && generalError && (
                <p className="form-error-banner-login">{generalError}</p>
              )}

              <form onSubmit={handleOtpSubmit} className="login-form">
                <input
                  type="text"
                  className="login-input login-otp-input"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • • • •"
                  disabled={blockedSeconds > 0}
                  autoFocus
                />

                <button
                  className="btn-primary-login"
                  disabled={loading || code.length !== 6 || blockedSeconds > 0}
                >
                  {loading
                    ? <span className="login-spinner" />
                    : blockedSeconds > 0
                    ? `Réessayez dans ${blockedSeconds}s`
                    : "Vérifier"}
                </button>
              </form>

              <p className="login-bottom-text">
                Vous n'avez rien reçu ?{" "}
                <button
                  onClick={handleResend}
                  className="login-link-button"
                  disabled={blockedSeconds > 0}
                >
                  Renvoyer le code
                </button>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}