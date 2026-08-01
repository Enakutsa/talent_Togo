import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, Lock, Trash2, ShieldAlert, LogOut,
  Loader2, Check, AlertTriangle, X,
} from "lucide-react";
import ClientTopNav from "../../components/ClientTopNav";
import Footer from "../../components/Footer";
import {
  getNotificationPrefs, updateNotificationPrefs,
  changePassword, logoutAllDevices, deleteAccount,
} from "../../services/parametres.service";
import "../../assets/styles/ClientDashboard.css";
import "../../assets/styles/Parametres.css";

// ── Toggle réutilisable ────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      className={`pr-toggle ${checked ? "pr-toggle-on" : ""}`}
      onClick={() => !disabled && onChange(!checked)}
      aria-pressed={checked}
      disabled={disabled}
    >
      <span className="pr-toggle-dot" />
    </button>
  );
}

export default function Parametres() {
  const navigate = useNavigate();

  // ── Notifications ──
  // ⚠️ Les clés email_demandes/email_messages viennent du backend
  // (AuthController::getNotificationPrefs) mais elles contrôlent en réalité
  // les notifications DANS LA CLOCHE (in-app), pas des emails — d'où les
  // libellés ci-dessous qui ne mentionnent plus "email".
  const [prefs, setPrefs] = useState({
    email_demandes: true,
    email_messages: true,
    notifications_in_app: true,
  });
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  useEffect(() => {
    getNotificationPrefs()
      .then((res) => res?.data && setPrefs(res.data))
      .catch(() => {}) // garde les valeurs par défaut si l'appel échoue
      .finally(() => setPrefsLoading(false));
  }, []);

  const handleTogglePref = (key, value) => {
    const previous = prefs;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setPrefsSaving(true);
    setPrefsSaved(false);
    updateNotificationPrefs(next)
      .then(() => {
        setPrefsSaved(true);
        setTimeout(() => setPrefsSaved(false), 2000);
      })
      .catch(() => {
        setPrefs(previous); // rollback si l'enregistrement échoue
      })
      .finally(() => setPrefsSaving(false));
  };

  // ── Mot de passe ──
  // Noms de champs alignés sur AuthController::update (PUT /user)
  const [pwd, setPwd] = useState({
    mot_de_passe_actuel: "",
    nouveau_mot_de_passe: "",
    nouveau_mot_de_passe_confirmation: "",
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess(false);

    if (pwd.nouveau_mot_de_passe !== pwd.nouveau_mot_de_passe_confirmation) {
      setPwdError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (pwd.nouveau_mot_de_passe.length < 8) {
      setPwdError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setPwdLoading(true);
    changePassword({
      motDePasseActuel: pwd.mot_de_passe_actuel,
      nouveauMotDePasse: pwd.nouveau_mot_de_passe,
      nouveauMotDePasseConfirmation: pwd.nouveau_mot_de_passe_confirmation,
    })
      .then(() => {
        setPwdSuccess(true);
        setPwd({ mot_de_passe_actuel: "", nouveau_mot_de_passe: "", nouveau_mot_de_passe_confirmation: "" });
        setTimeout(() => setPwdSuccess(false), 3000);
      })
      .catch((err) => {
        const errors = err?.response?.data?.errors;
        const message = errors
          ? Object.values(errors)[0]?.[0]
          : err?.response?.data?.message;
        setPwdError(message || "Impossible de changer le mot de passe.");
      })
      .finally(() => setPwdLoading(false));
  };

  // ── Déconnexion de tous les appareils ──
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [logoutAllDone, setLogoutAllDone] = useState(false);

  const handleLogoutAll = () => {
    setLogoutAllLoading(true);
    logoutAllDevices()
      .then(() => {
        setLogoutAllDone(true);
        setTimeout(() => setLogoutAllDone(false), 3000);
      })
      .catch(() => {})
      .finally(() => setLogoutAllLoading(false));
  };

  // ── Suppression de compte ──
  // Le backend (AuthController::destroy) exige le mot de passe pour confirmer.
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteAccount = () => {
    if (!deletePassword) return;
    setDeleteLoading(true);
    setDeleteError("");
    deleteAccount(deletePassword)
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        const errors = err?.response?.data?.errors;
        const message = errors
          ? Object.values(errors)[0]?.[0]
          : "Impossible de supprimer le compte. Réessayez plus tard.";
        setDeleteError(message);
      })
      .finally(() => setDeleteLoading(false));
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword("");
    setDeleteError("");
  };

  // Toggle maître : si désactivé, les sous-catégories n'ont plus d'effet
  // (aucune notification n'apparaît dans la cloche, quoi qu'il arrive) —
  // donc on les grise pour éviter toute confusion sur ce qui est actif.
  const notificationsDesactivees = !prefs.notifications_in_app;

  return (
    <div className="pr-page">
      <ClientTopNav activeKey="parametres" />

      <div className="pr-body">
        <h1 className="pr-title">Paramètres</h1>
        <p className="pr-sub">Gérez vos notifications, votre sécurité et votre compte.</p>

        {/* ── Notifications ── */}
        <section className="pr-card">
          <div className="pr-card-header">
            <Bell size={18} className="pr-card-icon" />
            <h2 className="pr-card-title">Notifications</h2>
          </div>

          {prefsLoading ? (
            <p className="pr-loading">Chargement...</p>
          ) : (
            <div className="pr-rows">
              {/* Toggle maître */}
              <div className="pr-row">
                <div>
                  <p className="pr-row-label">Notifications</p>
                  <p className="pr-row-desc">
                    Activer les notifications dans la cloche 🔔 en haut de page.
                  </p>
                </div>
                <Toggle
                  checked={prefs.notifications_in_app}
                  onChange={(v) => handleTogglePref("notifications_in_app", v)}
                />
              </div>

              <div className="pr-divider" />

              <div className="pr-row">
                <div>
                  <p className="pr-row-label">Réponses à mes demandes</p>
                  <p className="pr-row-desc">
                    Être notifié quand un talent accepte, refuse ou termine une de vos demandes.
                  </p>
                </div>
                <Toggle
                  checked={prefs.email_demandes}
                  onChange={(v) => handleTogglePref("email_demandes", v)}
                  disabled={notificationsDesactivees}
                />
              </div>

              <div className="pr-row">
                <div>
                  <p className="pr-row-label">Nouveaux messages</p>
                  <p className="pr-row-desc">
                    Être notifié à chaque nouveau message reçu.
                  </p>
                </div>
                <Toggle
                  checked={prefs.email_messages}
                  onChange={(v) => handleTogglePref("email_messages", v)}
                  disabled={notificationsDesactivees}
                />
              </div>
            </div>
          )}

          {prefsSaving && <p className="pr-status">Enregistrement...</p>}
          {prefsSaved && <p className="pr-status pr-status-ok"><Check size={14} /> Enregistré</p>}
        </section>

        {/* ── Sécurité ── */}
        <section className="pr-card">
          <div className="pr-card-header">
            <Lock size={18} className="pr-card-icon" />
            <h2 className="pr-card-title">Sécurité</h2>
          </div>

          <form className="pr-form" onSubmit={handleChangePassword}>
            <div className="pr-field">
              <label className="pr-label">Mot de passe actuel</label>
              <input
                type="password"
                className="pr-input"
                value={pwd.mot_de_passe_actuel}
                onChange={(e) => setPwd({ ...pwd, mot_de_passe_actuel: e.target.value })}
                required
              />
            </div>
            <div className="pr-field-row">
              <div className="pr-field">
                <label className="pr-label">Nouveau mot de passe</label>
                <input
                  type="password"
                  className="pr-input"
                  value={pwd.nouveau_mot_de_passe}
                  onChange={(e) => setPwd({ ...pwd, nouveau_mot_de_passe: e.target.value })}
                  minLength={8}
                  required
                />
              </div>
              <div className="pr-field">
                <label className="pr-label">Confirmer le mot de passe</label>
                <input
                  type="password"
                  className="pr-input"
                  value={pwd.nouveau_mot_de_passe_confirmation}
                  onChange={(e) => setPwd({ ...pwd, nouveau_mot_de_passe_confirmation: e.target.value })}
                  minLength={8}
                  required
                />
              </div>
            </div>

            {pwdError && <p className="pr-error">{pwdError}</p>}
            {pwdSuccess && <p className="pr-status pr-status-ok"><Check size={14} /> Mot de passe mis à jour</p>}

            <button type="submit" className="pr-btn-primary" disabled={pwdLoading}>
              {pwdLoading ? <Loader2 size={15} className="pr-spin" /> : "Changer le mot de passe"}
            </button>
          </form>

          <div className="pr-divider" />

          <div className="pr-row">
            <div>
              <p className="pr-row-label">Déconnecter tous les appareils</p>
              <p className="pr-row-desc">Ferme toutes vos sessions actives, sauf celle-ci.</p>
            </div>
            <button className="pr-btn-secondary" onClick={handleLogoutAll} disabled={logoutAllLoading}>
              {logoutAllLoading ? (
                <Loader2 size={14} className="pr-spin" />
              ) : logoutAllDone ? (
                <><Check size={14} /> Fait</>
              ) : (
                <><LogOut size={14} /> Déconnecter</>
              )}
            </button>
          </div>
        </section>

        {/* ── Zone de danger ── */}
        <section className="pr-card pr-card-danger">
          <div className="pr-card-header">
            <ShieldAlert size={18} className="pr-card-icon-danger" />
            <h2 className="pr-card-title">Zone de danger</h2>
          </div>

          <div className="pr-row">
            <div>
              <p className="pr-row-label">Supprimer mon compte</p>
              <p className="pr-row-desc">
                Cette action est irréversible. Toutes vos données seront définitivement supprimées.
              </p>
            </div>
            <button className="pr-btn-danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        </section>
      </div>

      <Footer />

      {/* ── Modale de confirmation ── */}
      {showDeleteModal && (
        <div className="pr-modal-overlay" onClick={closeDeleteModal}>
          <div className="pr-modal" onClick={(e) => e.stopPropagation()}>
            <button className="pr-modal-close" onClick={closeDeleteModal}>
              <X size={18} />
            </button>

            <div className="pr-modal-icon">
              <AlertTriangle size={22} />
            </div>

            <h3 className="pr-modal-title">Supprimer définitivement le compte ?</h3>
            <p className="pr-modal-text">
              Cette action est irréversible. Entre ton mot de passe pour confirmer.
            </p>

            <input
              type="password"
              className="pr-input"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Mot de passe"
              autoFocus
            />

            {deleteError && <p className="pr-error">{deleteError}</p>}

            <div className="pr-modal-actions">
              <button className="pr-btn-secondary" onClick={closeDeleteModal}>
                Annuler
              </button>
              <button
                className="pr-btn-danger"
                disabled={!deletePassword || deleteLoading}
                onClick={handleDeleteAccount}
              >
                {deleteLoading ? <Loader2 size={15} className="pr-spin" /> : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}