import { useState, useContext, useRef, useEffect } from "react";
import { User, Mail, Phone, Lock, Camera } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { updateUser } from "../../services/auth.service";
import ClientTopNav from "../../components/ClientTopNav";
import "../../assets/styles/ClientDashboard.css";
import "../../assets/styles/ClientProfil.css";

export default function ClientProfil() {
  const { user, login, token } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    prenom: user?.prenom || "",
    nom: user?.nom || "",
    telephone: user?.telephone || "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [changePassword, setChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    mot_de_passe_actuel: "",
    nouveau_mot_de_passe: "",
    nouveau_mot_de_passe_confirmation: "",
  });

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    if (changePassword && (!passwordForm.mot_de_passe_actuel || !passwordForm.nouveau_mot_de_passe)) {
      setError("Remplissez tous les champs de mot de passe.");
      setSaving(false);
      return;
    }

    const payload = new FormData();
    payload.append("_method", "PUT"); // simule PUT via POST, requis pour l'upload de fichier avec Laravel
    payload.append("nom", form.nom);
    payload.append("prenom", form.prenom);
    payload.append("telephone", form.telephone);

    if (photoFile) {
      payload.append("photo", photoFile);
    }

    if (changePassword) {
      payload.append("mot_de_passe_actuel", passwordForm.mot_de_passe_actuel);
      payload.append("nouveau_mot_de_passe", passwordForm.nouveau_mot_de_passe);
      payload.append("nouveau_mot_de_passe_confirmation", passwordForm.nouveau_mot_de_passe_confirmation);
    }

    try {
      const res = await updateUser(payload);
      // ✅ updateUser() (dans auth.service.js) fait `return res.data;` sur
      // la réponse axios -> elle renvoie donc déjà {success, data} tel quel
      // (le JSON du backend), pas encore "dépaqueté". Donc ici res =
      // {success, data}, et l'utilisateur se trouve dans res.data.
      login(res.data, token);
      setSuccess("Profil mis à jour avec succès.");
      setIsEditing(false);
      setChangePassword(false);
      setPhotoFile(null);
      setPasswordForm({ mot_de_passe_actuel: "", nouveau_mot_de_passe: "", nouveau_mot_de_passe_confirmation: "" });
    } catch (err) {
      if (err.response?.status === 422) {
        const firstError = Object.values(err.response.data.errors || {})[0]?.[0];
        setError(firstError || "Certains champs sont invalides.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      prenom: user?.prenom || "",
      nom: user?.nom || "",
      telephone: user?.telephone || "",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setChangePassword(false);
    setPasswordForm({ mot_de_passe_actuel: "", nouveau_mot_de_passe: "", nouveau_mot_de_passe_confirmation: "" });
    setIsEditing(false);
    setError("");
  };

  const initiales = `${(user?.prenom || "")[0] ?? ""}${(user?.nom || "")[0] ?? ""}`.toUpperCase();
  const displayPhoto = photoPreview || user?.photo;

  return (
    <div className="cd-root">
      <ClientTopNav activeKey="" />

      <main className="cd-main">
        <div className="cd-page cd-page-narrow">

          <div className="cd-page-header">
            <div>
              <h1 className="cd-page-title">Mon profil</h1>
              <p className="cd-page-sub">Gérez vos informations personnelles.</p>
            </div>
          </div>

          <div className="cp-card">
            <div className="cp-card-top">
              <div className="cp-avatar-wrap">
                {displayPhoto ? (
                  <img src={displayPhoto} alt={user?.prenom} className="cp-avatar-photo" />
                ) : (
                  <div className="cp-avatar"><span>{initiales}</span></div>
                )}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cp-avatar-edit-btn"
                  >
                    <Camera size={12} />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handlePhotoChange}
                  className="cp-file-input-hidden"
                />
              </div>
              <div>
                <p className="cp-name">{user?.prenom} {user?.nom}</p>
                <p className="cp-role">Client</p>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cp-photo-label-btn"
                  >
                    <Camera size={13} /> Choisir une photo de profil
                  </button>
                )}
              </div>

              {!isEditing ? (
                <button type="button" className="cp-edit-btn" onClick={() => setIsEditing(true)}>
                  Modifier
                </button>
              ) : (
                <button type="button" className="cp-edit-btn" onClick={handleCancel}>
                  Annuler
                </button>
              )}
            </div>

            {error && <p className="cd-error">{error}</p>}
            {success && <p className="cp-success">{success}</p>}

            <form onSubmit={handleSubmit} className="cp-form">

              <div className="cp-row">
                <div className="cp-field">
                  <label className="cp-label">Prénom</label>
                  <div className="cp-input-icon">
                    <User size={16} className="cp-icon" />
                    <input
                      type="text"
                      className={`cp-input ${!isEditing ? "cp-input-disabled" : ""}`}
                      value={form.prenom}
                      onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="cp-field">
                  <label className="cp-label">Nom</label>
                  <div className="cp-input-icon">
                    <User size={16} className="cp-icon" />
                    <input
                      type="text"
                      className={`cp-input ${!isEditing ? "cp-input-disabled" : ""}`}
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="cp-field">
                <label className="cp-label">Email</label>
                <div className="cp-input-icon">
                  <Mail size={16} className="cp-icon" />
                  <input
                    type="text"
                    className="cp-input cp-input-disabled"
                    value={user?.email || ""}
                    disabled
                  />
                </div>
                <p className="cp-hint">L'adresse email ne peut pas être modifiée.</p>
              </div>

              <div className="cp-field">
                <label className="cp-label">Téléphone</label>
                <div className="cp-input-icon">
                  <Phone size={16} className="cp-icon" />
                  <input
                    type="text"
                    maxLength={8}
                    className={`cp-input ${!isEditing ? "cp-input-disabled" : ""}`}
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <>
                  <div className="cp-section-title">Sécurité</div>

                  {!changePassword ? (
                    <button
                      type="button"
                      className="cp-password-toggle"
                      onClick={() => setChangePassword(true)}
                    >
                      <Lock size={14} /> Changer mon mot de passe
                    </button>
                  ) : (
                    <div className="cp-password-block">
                      <div className="cp-field">
                        <label className="cp-label">Mot de passe actuel</label>
                        <input
                          type="password"
                          className="cp-input"
                          value={passwordForm.mot_de_passe_actuel}
                          onChange={(e) => setPasswordForm({ ...passwordForm, mot_de_passe_actuel: e.target.value })}
                        />
                      </div>
                      <div className="cp-row">
                        <div className="cp-field">
                          <label className="cp-label">Nouveau mot de passe</label>
                          <input
                            type="password"
                            className="cp-input"
                            value={passwordForm.nouveau_mot_de_passe}
                            onChange={(e) => setPasswordForm({ ...passwordForm, nouveau_mot_de_passe: e.target.value })}
                          />
                        </div>
                        <div className="cp-field">
                          <label className="cp-label">Confirmer</label>
                          <input
                            type="password"
                            className="cp-input"
                            value={passwordForm.nouveau_mot_de_passe_confirmation}
                            onChange={(e) => setPasswordForm({ ...passwordForm, nouveau_mot_de_passe_confirmation: e.target.value })}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="cp-password-cancel"
                        onClick={() => {
                          setChangePassword(false);
                          setPasswordForm({ mot_de_passe_actuel: "", nouveau_mot_de_passe: "", nouveau_mot_de_passe_confirmation: "" });
                        }}
                      >
                        Annuler le changement de mot de passe
                      </button>
                    </div>
                  )}
                </>
              )}

              {isEditing && (
                <button type="submit" className="cp-submit-btn" disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              )}
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}