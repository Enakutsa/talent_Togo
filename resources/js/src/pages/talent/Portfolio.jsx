import { useState, useRef, useEffect } from "react";
import { Eye, Trash2, Image as ImageIcon } from "lucide-react";
import { getPortfolio, addPortfolioItem, deletePortfolioItem } from "../../services/portfolio.service";
import TalentTopNav from "../../components/TalentTopNav";
import "../../assets/styles/TalentDashboard.css";
import "../../assets/styles/ProfilCreer.css";
import "../../assets/styles/Portfolio.css";

export default function Portfolio() {
  const fileInputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadItems = () => {
    setLoading(true);
    getPortfolio()
      .then((res) => setItems(res.data || []))
      .catch(() => setError("Impossible de charger le portfolio."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("fichier", file);

    try {
      await addPortfolioItem(formData);
      loadItems();
    } catch (err) {
      if (err.response?.status === 422) {
        const firstError = Object.values(err.response.data.errors || {})[0]?.[0];
        setError(firstError || "Fichier invalide.");
      } else {
        setError("Une erreur est survenue lors de l'upload.");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette réalisation ?")) return;

    setDeletingId(id);
    try {
      await deletePortfolioItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setError("Impossible de supprimer cet élément.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="td-root">
      <TalentTopNav activeKey="portfolio" />

      <main className="td-main">
        {loading ? (
          <div className="td-page">
            <p className="text-gray-500 text-sm">Chargement...</p>
          </div>
        ) : (
          <div className="td-page">
            <div className="td-page-header td-portfolio-header">
              <div>
                <h1 className="td-page-title">Mon portfolio</h1>
                <p className="td-page-sub">
                  {items.length} réalisation{items.length > 1 ? "s" : ""} publiée{items.length > 1 ? "s" : ""}
                </p>
              </div>
              <button
                type="button"
                className="btn-primary-portfolio"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <span className="profil-creer-spinner" /> : <><ImageIcon size={16} /> Ajouter une réalisation</>}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,video/mp4,video/quicktime"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {error && <p className="profil-creer-error">{error}</p>}

            {items.length === 0 ? (
              <div className="td-portfolio-empty" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon size={32} />
                <p className="td-portfolio-empty-title">Aucune réalisation pour le moment</p>
                <p className="td-portfolio-empty-sub">Cliquez ici pour ajouter votre première photo ou vidéo</p>
              </div>
            ) : (
              <div className="td-portfolio-grid">
                {items.map((item) => (
                  <div key={item.id} className="td-portfolio-item">
                    {item.type === "video" ? (
                      <video src={item.media_url} className="td-portfolio-media" muted />
                    ) : (
                      <img src={item.media_url} alt={item.description || "Réalisation"} className="td-portfolio-media" />
                    )}

                    {item.description && (
                      <div className="td-portfolio-overlay">
                        <p className="td-portfolio-desc">{item.description}</p>
                      </div>
                    )}

                    <div className="td-portfolio-actions">
                      <button type="button" className="td-portfolio-action-btn" onClick={() => setPreview(item)} title="Aperçu">
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        className="td-portfolio-action-btn td-portfolio-action-delete"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {preview && (
        <div className="td-portfolio-modal" onClick={() => setPreview(null)}>
          <div className="td-portfolio-modal-content" onClick={(e) => e.stopPropagation()}>
            {preview.type === "video" ? (
              <video src={preview.media_url} controls autoPlay className="td-portfolio-modal-media" />
            ) : (
              <img src={preview.media_url} alt={preview.description || ""} className="td-portfolio-modal-media" />
            )}
            {preview.description && <p className="td-portfolio-modal-desc">{preview.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
}