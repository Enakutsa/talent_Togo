import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getUser } from "../../services/auth.service";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const redirectPath = params.get('redirect');
    const error = params.get('error');

    if (error) {
      const messages = {
        email_exists_otp: 'Ce compte existe déjà. Connectez-vous par email/OTP.',
        google_failed: 'La connexion Google a échoué. Réessayez.',
        talent_pending: 'Votre compte est en attente de validation.',
        talent_rejected: 'Votre profil a été refusé.',
        talent_disabled: 'Votre compte a été désactivé.',
      };
      navigate(`/login?message=${encodeURIComponent(messages[error] || 'Erreur de connexion')}`);
      return;
    }

    if (token) {
      // ⚠️ sessionStorage, pas localStorage : c'est ce que AuthContext.logout()
      // nettoie déjà, donc c'est le stockage utilisé partout ailleurs dans l'app.
      sessionStorage.setItem('token', token);

      getUser()
        .then((utilisateur) => {
          login(utilisateur, token);
          navigate(`/${redirectPath}`);
        })
        .catch(() => {
          sessionStorage.removeItem('token');
          navigate('/login?message=Erreur de connexion. Réessayez.');
        });
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Connexion en cours...</p>
    </div>
  );
}