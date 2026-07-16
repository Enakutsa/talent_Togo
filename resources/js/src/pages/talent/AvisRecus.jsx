import { useState, useEffect } from "react";
import { Star, User } from "lucide-react";
import { getAvisRecus } from "../../services/avis.service";
import TalentTopNav from "../../components/TalentTopNav";
import "../../assets/styles/TalentDashboard.css";
import "../../assets/styles/AvisRecus.css";

function Stars({ note, size = 14 }) {
  return (
    <span className="ar-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= note ? "ar-star-filled" : "ar-star-empty"}
        />
      ))}
    </span>
  );
}

export default function AvisRecus() {
  const [avis, setAvis] = useState(null);
  const [moyenne, setMoyenne] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    getAvisRecus()
      .then((res) => {
        setAvis(res.data || []);
        setMoyenne(res.moyenne || 0);
        setTotal(res.total || 0);
      })
      .catch(() => setError("Impossible de charger vos avis."));
  }, []);

  return (
    <div className="td-root">
      <TalentTopNav activeKey="avis" />

      <main className="td-main">
        <div className="td-page">
          <div className="td-page-header">
            <div>
              <h1 className="td-page-title">Avis reçus</h1>
              <p className="td-page-sub">Ce que vos clients disent de vous.</p>
            </div>
          </div>

          {error && <p className="profil-creer-error">{error}</p>}

          {avis === null ? (
            <p className="text-gray-500 text-sm">Chargement...</p>
          ) : (
            <>
              {total > 0 && (
                <div className="ar-summary">
                  <div className="ar-summary-note">{moyenne}</div>
                  <div>
                    <Stars note={Math.round(moyenne)} size={18} />
                    <p className="ar-summary-count">{total} avis</p>
                  </div>
                </div>
              )}

              {avis.length === 0 ? (
                <div className="ar-empty">
                  <Star size={32} />
                  <p className="ar-empty-title">Aucun avis pour le moment</p>
                  <p className="ar-empty-sub">Les avis de vos clients apparaîtront ici après leurs prestations.</p>
                </div>
              ) : (
                <div className="ar-list">
                  {avis.map((a) => (
                    <div key={a.id} className="ar-card">
                      <div className="ar-card-header">
                        <div className="ar-client-avatar">
                          <User size={16} />
                        </div>
                        <div className="ar-client-info">
                          <p className="ar-client-name">{a.client_nom}</p>
                          <p className="ar-date">
                            {new Date(a.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <Stars note={a.note} />
                      </div>
                      {a.commentaire && (
                        <p className="ar-comment">"{a.commentaire}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}