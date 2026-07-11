import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { verifyLoginOtp, resendOtp } from "../../services/auth.service";
import { AuthContext } from "../../context/AuthContext";
import "../../assets/styles/Otp.css";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Décompte du blocage (en secondes) après 5 tentatives ratées
  const [blockedSeconds, setBlockedSeconds] = useState(0);
  const intervalRef = useRef(null);

  const utilisateur_id = localStorage.getItem("user_id");

  // Fait défiler le décompte toutes les secondes tant que blockedSeconds > 0
  useEffect(() => {
    if (blockedSeconds <= 0) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setBlockedSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setError("");
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [blockedSeconds > 0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    if (!code) {
      setError("Entre le code OTP");
      return;
    }

    if (blockedSeconds > 0) {
      return;
    }

    const codeEnvoye = code;
    setCode(""); // ✅ le code saisi disparaît dès qu'on clique, succès ou échec
    setError("");
    setLoading(true);

    try {
      const data = await verifyLoginOtp({
        utilisateur_id,
        code: codeEnvoye,
      });

      // Peuple immédiatement AuthContext (user + token), pas seulement localStorage
      login(data.data.utilisateur, data.data.token);

      // Redirection immédiate selon ce que renvoie le backend (talent/dashboard,
      // talent/profil/creer, admin, ou "/" par défaut) — pas de délai artificiel,
      // pour éviter toute course avec d'autres redirections (ex: RedirectIfTalent).
      const redirectPath = data.data.redirect
        ? `/${data.data.redirect}`
        : "/";

      navigate(redirectPath, { replace: true });

    } catch (err) {
      const status = err.response?.status;
      const retryAfter = err.response?.data?.retry_after;

      if (status === 429 && retryAfter) {
        // Déclenche le décompte "Réessayez dans Xs"
        setBlockedSeconds(retryAfter);
        setError(""); // le message vient du rendu du décompte, pas d'un texte figé
      } else {
        setError(err.response?.data?.message || "Code invalide ou expiré");
      }
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

        {blockedSeconds > 0 && (
          <p className="otp-error">
            Trop de tentatives. Réessayez dans {blockedSeconds}s.
          </p>
        )}
        {blockedSeconds === 0 && error && <p className="otp-error">{error}</p>}
        {success && <p className="otp-success">{success}</p>}

        <form onSubmit={handleSubmit} className="otp-form">

          <input
            type="text"
            maxLength={6}
            placeholder="Code OTP (6 chiffres)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="otp-input"
            disabled={blockedSeconds > 0}
          />

          <button className="otp-btn" disabled={loading || blockedSeconds > 0}>
            {loading
              ? "Vérification..."
              : blockedSeconds > 0
              ? `Réessayez dans ${blockedSeconds}s`
              : "Valider"}
          </button>

        </form>

        <button className="otp-resend" onClick={handleResend} disabled={blockedSeconds > 0}>
          {resending ? "Envoi..." : "Renvoyer le code"}
        </button>

      </div>
    </div>
  );
}