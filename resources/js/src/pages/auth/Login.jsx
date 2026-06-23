import { useState, useContext } from "react";
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
    setLoading(true);

    // ✅ sécurité
    if (!utilisateurId) {
      setGeneralError("Erreur utilisateur. Reconnectez-vous.");
      setLoading(false);
      return;
    }

    if (code.length !== 6) {
      setGeneralError("Le code doit contenir 6 chiffres.");
      setLoading(false);
      return;
    }

    try {
      const data = await verifyLoginOtp({
        utilisateur_id: utilisateurId,
        code,
      });

      console.log("RESPONSE OTP :", data);

      // ✅ CORRECTION PRINCIPALE
      login(data.data.utilisateur, data.data.token);

      // ✅ stock token
      localStorage.setItem("token", data.data.token);

      // ✅ redirection
      if (data.data.utilisateur.role === "talent") {
        navigate("/talent/dashboard");
      } else if (data.data.utilisateur.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.log("ERREUR OTP :", err.response?.data);

      if (err.response?.status === 422) {
        setGeneralError(err.response.data.message || "Code invalide ou expiré.");
      } else if (err.response?.status === 429) {
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

              {generalError && (
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
                />

                <button
                  className="btn-primary-login"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? <span className="login-spinner" /> : "Vérifier"}
                </button>

              </form>

              <p className="login-bottom-text">
                Vous n'avez rien reçu ?{" "}
                <button onClick={handleResend} className="login-link-button">
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