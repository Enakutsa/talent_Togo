import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { login as loginApi, verifyLoginOtp, resendOtp } from "../../services/auth.service";
import { AuthContext } from "../../context/AuthContext";
import "../../assets/styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const [step, setStep] = useState("credentials"); // "credentials" | "otp"
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [errors, setErrors] = useState({});

  const [email, setEmail] = useState("");
  const [utilisateurId, setUtilisateurId] = useState(null);
  const [code, setCode] = useState("");

  // Décompte du blocage : on stocke le timestamp de fin de blocage, et un
  // "tick" qui avance chaque seconde recalcule le temps restant. Plus robuste
  // qu'un compteur décrémenté directement (évite les soucis de dépendances
  // d'effet et de fermetures obsolètes).
  const [blockDeadline, setBlockDeadline] = useState(null); // timestamp ms | null
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const blockedSeconds = blockDeadline
    ? Math.max(0, Math.ceil((blockDeadline - now) / 1000))
    : 0;

  // ✅ STEP EMAIL
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");
    setLoading(true);

    try {
      const data = await loginApi({ email });

      // ✅ IMPORTANT
      setUtilisateurId(data.utilisateur_id);
      setStep("otp");

    } catch (err) {
      console.log(err.response?.data);

      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else if (err.response?.status === 404) {
        setGeneralError("Aucun compte trouvé avec cet email.");
      } else if (err.response?.status === 403) {
        // ✅ Compte talent en attente de validation ou rejeté
        setGeneralError(
          err.response.data.message ||
            "Votre compte n'est pas encore activé."
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

    // ✅ sécurité
    if (!utilisateurId) {
      setGeneralError("Erreur utilisateur. Reconnectez-vous.");
      return;
    }

    if (code.length !== 6) {
      setGeneralError("Le code doit contenir 6 chiffres.");
      return;
    }

    if (blockedSeconds > 0) {
      return;
    }

    const codeEnvoye = code;
    setCode(""); // ✅ le code saisi disparaît dès qu'on clique, succès ou échec
    setLoading(true);

    try {
      const data = await verifyLoginOtp({
        utilisateur_id: utilisateurId,
        code: codeEnvoye,
      });

      console.log("RESPONSE OTP :", data);

      // ✅ CORRECTION PRINCIPALE
      login(data.data.utilisateur, data.data.token);

      // ✅ Redirection : priorité à la page que l'utilisateur visait avant
      // d'être redirigé vers /login (mémorisée par ProtectedRoute dans
      // location.state.from) — MAIS seulement si cette page correspond au
      // rôle de la personne qui vient de se connecter. Sinon (ex: un
      // client se connecte alors que "from" pointait vers une route
      // /talent/..., peu importe comment), on ignore "from" et on suit la
      // redirection normale calculée par le backend.
      const role = data.data.utilisateur?.role;
      const from = location.state?.from;

      const fromCorrespondAuRole =
        from &&
        (
          (from.startsWith("/talent") && role === "talent") ||
          (from.startsWith("/client") && role === "client") ||
          (from.startsWith("/admin") && role === "admin") ||
          (!from.startsWith("/talent") && !from.startsWith("/client") && !from.startsWith("/admin"))
        );

      const redirectForce =
        data.data.redirect === "talent/profil/creer" || data.data.redirect === "admin";

      if (fromCorrespondAuRole && !redirectForce) {
        navigate(from);
      } else {
        navigate("/" + data.data.redirect);
      }

    } catch (err) {
      console.log("ERREUR OTP :", err.response?.data);

      const status = err.response?.status;
      const retryAfter = err.response?.data?.retry_after;

      if (status === 429 && retryAfter) {
        // Déclenche le décompte "Réessayez dans Xs"
        setBlockedSeconds(retryAfter);
        setGeneralError("");
      } else if (status === 422) {
        setGeneralError(err.response.data.message || "Code invalide ou expiré.");
      } else if (status === 429) {
        setGeneralError("Trop de tentatives. Réessayez plus tard.");
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
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="• • • • • •"
                  disabled={blockedSeconds > 0}
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