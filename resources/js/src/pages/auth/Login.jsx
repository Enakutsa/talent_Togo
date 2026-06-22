import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi, verifyLoginOtp, resendOtp } from "../../services/auth.service";
import { AuthContext } from "../../context/AuthContext";
import "../../assets/styles/Inscription.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [utilisateurId, setUtilisateurId] = useState(null);
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ ETAPE 1 : EMAIL
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginApi({ email });

      setUtilisateurId(data.utilisateur_id);
      setStep("otp");

    } catch (err) {
      setError("Email introuvable ou erreur.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ETAPE 2 : OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await verifyLoginOtp({
        utilisateur_id: utilisateurId,
        code,
      });

      login(data.data.utilisateur, data.data.token);
      localStorage.setItem("token", data.data.token);

      navigate("/dashboard");

    } catch (err) {
      setError("Code invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  // ✅ RESEND
  const handleResend = async () => {
    await resendOtp(utilisateurId);
    alert("Code renvoyé ✅");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* ETAPE EMAIL */}
        {step === "email" && (
          <>
            <h2>Connexion</h2>

            <form onSubmit={handleEmailSubmit}>

              <input
                type="email"
                placeholder="Entrer votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />

              <button className="btn-submit">
                {loading ? "Envoi..." : "Recevoir code"}
              </button>

            </form>
          </>
        )}

        {/* ETAPE OTP */}
        {step === "otp" && (
          <>
            <h2>Entrer le code OTP</h2>

            <form onSubmit={handleOtpSubmit}>

              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, ""))
                }
                className="input"
                placeholder="Code OTP"
              />

              <button className="btn-submit">
                {loading ? "Vérification..." : "Valider"}
              </button>

            </form>

            <button onClick={handleResend}>
              Renvoyer code
            </button>
          </>
        )}

        {error && <p className="form-error-banner">{error}</p>}

        <p>
          Pas de compte ? <Link to="/register">Inscription</Link>
        </p>

      </div>
    </div>
  );
}