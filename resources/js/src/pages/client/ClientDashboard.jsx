import { useContext, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Heart, ClipboardList, Clock, CheckCircle, XCircle,
  ArrowRight, Search, MapPin, Star,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { getFavoris } from "../../services/favori.service";
import { getMesDemandes } from "../../services/demande.service";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import ClientTopNav from "../../components/ClientTopNav";
import "../../assets/styles/ClientDashboard.css";

const STATUT_CONFIG = {
  en_attente: { label: "En attente", cls: "cdh-badge-pending", icon: Clock },
  acceptee: { label: "Acceptée", cls: "cdh-badge-accepted", icon: CheckCircle },
  refusee: { label: "Refusée", cls: "cdh-badge-rejected", icon: XCircle },
  terminee: { label: "Terminée", cls: "cdh-badge-completed", icon: CheckCircle },
};

export default function ClientDashboard() {
  const { user } = useContext(AuthContext);

  const [favoris, setFavoris] = useState(null);
  const [demandes, setDemandes] = useState(null);
  const [counts, setCounts] = useState({ all: 0, en_attente: 0, acceptee: 0, refusee: 0 });

  // ✅ Fetches séparés (au lieu d'un seul bloc dans useEffect) pour pouvoir
  // les rebrancher individuellement sur l'auto-refresh, avec un filtre
  // différent chacun (pas de refetch des favoris quand une demande change,
  // et inversement).
  const fetchFavoris = useCallback(() => {
    getFavoris()
      .then((res) => setFavoris(res.data || []))
      .catch(() => setFavoris([]));
  }, []);

  const fetchDemandes = useCallback(() => {
    getMesDemandes(1)
      .then((res) => {
        setDemandes(res.data || []);
        if (res.counts) setCounts(res.counts);
      })
      .catch(() => setDemandes([]));
  }, []);

  useEffect(() => {
    fetchFavoris();
    fetchDemandes();

    // ✅ Rafraîchit périodiquement les demandes, car le changement de
    // statut peut venir d'un autre utilisateur (le talent) sur un autre
    // appareil — l'événement local "app:data-changed" ne peut pas le
    // détecter dans ce cas.
    const interval = setInterval(fetchDemandes, 15000);
    return () => clearInterval(interval);
  }, [fetchFavoris, fetchDemandes]);

  // ✅ Recharge automatiquement dès qu'une action liée aux favoris ou aux
  // demandes réussit ailleurs dans l'app (ex: le client ajoute un favori
  // depuis la page de recherche, ou envoie une nouvelle demande).
  useAutoRefresh(fetchFavoris, { match: "favoris" });
  useAutoRefresh(fetchDemandes, { match: "demandes" });

  const loading = favoris === null || demandes === null;

  return (
    <div className="cd-root">
      <ClientTopNav activeKey="dashboard" />

      <main className="cd-main">
        <div className="cd-page">
          <div className="cd-page-header">
            <div>
              <h1 className="cd-page-title">Bonjour, {user?.prenom || "Client"} 👋</h1>
              <p className="cd-page-sub">Retrouvez vos talents favoris et vos échanges ici.</p>
            </div>
            <Link to="/recherche" className="cdh-search-btn">
              <Search size={16} /> Trouver un talent
            </Link>
          </div>

          {/* ── Stats ── */}
          <div className="cdh-stats-grid">
            <div className="cdh-stat-card cdh-stat-violet">
              <div className="cdh-stat-icon"><Heart size={18} /></div>
              <div>
                <p className="cdh-stat-val">{loading ? "—" : favoris.length}</p>
                <p className="cdh-stat-label">Favoris</p>
              </div>
            </div>
            <div className="cdh-stat-card cdh-stat-blue">
              <div className="cdh-stat-icon"><ClipboardList size={18} /></div>
              <div>
                <p className="cdh-stat-val">{loading ? "—" : counts.all}</p>
                <p className="cdh-stat-label">Demandes envoyées</p>
              </div>
            </div>
            <div className="cdh-stat-card cdh-stat-amber">
              <div className="cdh-stat-icon"><Clock size={18} /></div>
              <div>
                <p className="cdh-stat-val">{loading ? "—" : counts.en_attente}</p>
                <p className="cdh-stat-label">En attente</p>
              </div>
            </div>
            <div className="cdh-stat-card cdh-stat-green">
              <div className="cdh-stat-icon"><CheckCircle size={18} /></div>
              <div>
                <p className="cdh-stat-val">{loading ? "—" : counts.acceptee}</p>
                <p className="cdh-stat-label">Acceptées</p>
              </div>
            </div>
          </div>

          <div className="cdh-two-cols">
            {/* ── Favoris récents ── */}
            <div className="cdh-card">
              <div className="cdh-card-header">
                <h2 className="cdh-card-title">Favoris récents</h2>
                <Link to="/client/favoris" className="cdh-card-link">
                  Voir tout <ArrowRight size={14} />
                </Link>
              </div>

              {favoris === null ? (
                <p className="cdh-status">Chargement...</p>
              ) : favoris.length === 0 ? (
                <div className="cdh-empty">
                  <Heart size={26} className="cdh-empty-icon" />
                  <p className="cdh-empty-text">Aucun favori pour le moment</p>
                  <Link to="/recherche" className="cdh-empty-link">Découvrir des talents</Link>
                </div>
              ) : (
                <div className="cdh-favoris-list">
                  {favoris.slice(0, 4).map((f) => (
                    <Link key={f.favori_id} to={`/talents/${f.talent_id}`} className="cdh-favori-row">
                      {f.avatar ? (
                        <img src={f.avatar} alt={f.nom} className="cdh-favori-avatar" />
                      ) : (
                        <div className="cdh-favori-avatar cdh-favori-avatar-placeholder" />
                      )}
                      <div className="cdh-favori-info">
                        <p className="cdh-favori-nom">{f.nom}</p>
                        <p className="cdh-favori-meta">
                          {f.categorie}
                          {f.ville && (
                            <>
                              {" · "}<MapPin size={10} style={{ display: "inline" }} /> {f.ville}
                            </>
                          )}
                        </p>
                      </div>
                      {f.note > 0 && (
                        <span className="cdh-favori-note">
                          <Star size={12} className="cdh-star" /> {f.note}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* ── Demandes récentes ── */}
            <div className="cdh-card">
              <div className="cdh-card-header">
                <h2 className="cdh-card-title">Demandes récentes</h2>
                <Link to="/client/demandes" className="cdh-card-link">
                  Voir tout <ArrowRight size={14} />
                </Link>
              </div>

              {demandes === null ? (
                <p className="cdh-status">Chargement...</p>
              ) : demandes.length === 0 ? (
                <div className="cdh-empty">
                  <ClipboardList size={26} className="cdh-empty-icon" />
                  <p className="cdh-empty-text">Aucune demande envoyée</p>
                  <Link to="/recherche" className="cdh-empty-link">Contacter un talent</Link>
                </div>
              ) : (
                <div className="cdh-demandes-list">
                  {demandes.slice(0, 4).map((d) => {
                    const config = STATUT_CONFIG[d.statut] || STATUT_CONFIG.en_attente;
                    const StatusIcon = config.icon;
                    return (
                      <Link key={d.id} to={`/talents/${d.talent_id}`} className="cdh-demande-row">
                        <div className="cdh-demande-info">
                          <p className="cdh-demande-nom">{d.talent_nom}</p>
                          <p className="cdh-demande-meta">{d.categorie}</p>
                        </div>
                        <span className={`cdh-badge ${config.cls}`}>
                          <StatusIcon size={11} /> {config.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}