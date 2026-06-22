import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyLoginOtp, resendOtp } from "../../services/auth.service";
import "../../assets/styles/Otp.css";

export default function VerifyOtp() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const utilisateur_id = localStorage.getItem("user_id");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!code) {
      setError("Entre le code OTP");
      return;
    }

    setLoading(true);

    try {
      const data = await verifyLoginOtp({
        utilisateur_id,
        code,
      });

      localStorage.setItem("token", data.data.token);

      setSuccess("Connexion réussie ✅");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Code invalide ou expiré"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ renvoyer code
  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccess("");

    try {
      await resendOtp(utilisateur_id);
      setSuccess("Nouveau code envoyé ✅");
    } catch {
      setError("Erreur envoi OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">

        <h2 className="otp-title">Vérification OTP</h2>
        <p className="otp-subtitle">
          Entrez le code envoyé à votre email
        </p>

        {error && <p className="otp-error">{error}</p>}
        {success && <p className="otp-success">{success}</p>}

        <form onSubmit={handleSubmit} className="otp-form">

          <input
            type="text"
            maxLength={6}
            placeholder="Code OTP (6 chiffres)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="otp-input"
          />

          <button className="otp-btn" disabled={loading}>
            {loading ? "Vérification..." : "Valider"}
          </button>

        </form>

        <button className="otp-resend" onClick={handleResend}>
          {resending ? "Envoi..." : "Renvoyer le code"}
        </button>

      </div>
    </div>
  );
}