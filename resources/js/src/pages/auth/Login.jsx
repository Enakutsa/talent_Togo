import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { login as loginApi, verifyLoginOtp, resendOtp } from "../../services/auth.service";
import { AuthContext } from "../../context/AuthContext";
import "../../assets/styles/Login.css";

const GOOGLE_AUTH_URL = "http://localhost:8000/auth/google/redirect";

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

  const [blockDeadline, setBlockDeadline] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // ✅ Affiche un message venant d'une redirection externe (ex: après un
  // échec ou blocage lors de la connexion Google) via ?message=... dans
  // l'URL, sans casser le flow OTP normal si le paramètre est absent.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const message = params.get("message");
    if (message) {
      setGeneralError(message);
    }
  }, [location.search]);

  // ✅ Retour de Google pour un email déjà lié à un compte classique (OTP) :
  // le backend a déjà généré et envoyé le code, on saute directement à
  // l'étape de saisie au lieu de faire retaper l'email à l'utilisateur.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const otpSent = params.get("otp_sent");
    const uid = params.get("utilisateur_id");

    if (otpSent === "1" && uid) {
      setUtilisateurId(uid);
      setStep("otp");
    }
  }, [location.search]);

  const blockedSeconds = blockDeadline
    ? Math.max(0, Math.ceil((blockDeadline - now) / 1000))
    : 0;

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
      console.log(err.response?.data);

      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else if (err.response?.status === 404) {
        setGeneralError("Aucun compte trouvé avec cet email.");
      } else if (err.response?.status === 403) {
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

    if (blockedSeconds > 0) {
      return;
    }

    const codeEnvoye = code;
    setCode("");
    setLoading(true);

    try {
      const data = await verifyLoginOtp({
        utilisateur_id: utilisateurId,
        code: codeEnvoye,
      });

      console.log("RESPONSE OTP :", data);

      login(data.data.utilisateur, data.data.token);

      // ✅ Redirection : priorité à la page que l'utilisateur visait avant
      // d'être redirigé vers /login (mémorisée par ProtectedRoute dans
      // location.state.from) — MAIS seulement si cette page correspond au
      // rôle de la personne qui vient de se connecter. Sinon (ex: un
      // client se connecte alors que "from" pointait vers une route
      // /talent/..., peu importe comment), on ignore "from" et on suit la
      // redirection normale calculée par le backend.
      //
      // ⚠️ On utilise des préfixes stricts avec "/" final ("/talent/",
      // "/client/") pour ne PAS confondre "/talents/5" (page publique de
      // détail d'un talent, accessible aux clients) avec "/talent/..."
      // (espace privé réservé au talent lui-même). Sans ce "/" final,
      // "/talents/5".startsWith("/talent") renvoyait true à tort, et un
      // client cliquant sur un profil talent sans être connecté se
      // retrouvait renvoyé vers l'accueil au lieu du profil visé.
      const role = data.data.utilisateur?.role;
      const from = location.state?.from;

      const isTalentSpace = from?.startsWith("/talent/");
      const isClientSpace = from?.startsWith("/client/");
      const isAdminSpace = from?.startsWith("/admin");

      const fromCorrespondAuRole =
        from &&
        (
          (isTalentSpace && role === "talent") ||
          (isClientSpace && role === "client") ||
          (isAdminSpace && role === "admin") ||
          (!isTalentSpace && !isClientSpace && !isAdminSpace)
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
        // ⚠️ Corrigé : setBlockedSeconds n'existait pas (le state réel est
        // blockDeadline/setBlockDeadline). L'appel plantait silencieusement
        // et le compte à rebours de blocage ne s'affichait jamais.
        setBlockDeadline(Date.now() + retryAfter * 1000);
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

  // ✅ Connexion Google — pas de rôle à préciser ici : contrairement à
  // l'inscription, on suppose que le compte existe déjà (ou sera créé côté
  // backend avec un rôle par défaut si absent). Redirige simplement vers
  // le endpoint Laravel qui lance le flow OAuth.
  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };

  return (
    <div className="login-bg">
      <div className="login-wrap">

        <div className="login-logo-block">
          <Link to="/" className="login-logo-link">
            <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
              <circle cx="21" cy="21" r="19" fill="#fff7ed" stroke="#ea580c" strokeWidth="2"/>
              <text x="21" y="28" textAnchor="middle" fontSize="16" fontWeight="700" fill="#166534" fontFamily="Georgia, 'Fraunces', serif">TT</text>
            </svg>
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

              <div className="login-divider">
                <span>ou</span>
              </div>

              <button
                type="button"
                className="btn-google-login"
                onClick={handleGoogleLogin}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.92c1.71-1.57 2.68-3.88 2.68-6.64z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.17l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.34C2.44 15.98 5.48 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.97 10.71a5.4 5.4 0 010-3.42V4.95H.96a9 9 0 000 8.1l3.01-2.34z"/>
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"/>
                </svg>
                Continuer avec Google
              </button>

              <p className="login-bottom-text">
                Pas encore de compte ?{" "}
                <Link to="/register">S'inscrire</Link>
              </p>
            </>
          ) : (

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