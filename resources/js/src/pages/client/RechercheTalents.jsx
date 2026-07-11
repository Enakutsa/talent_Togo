import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, SlidersHorizontal, X } from "lucide-react";
import { searchTalents, getCategories } from "../../services/talent.service";
import "../../assets/styles/Recherche.css";

const VILLES_TOGO = [
  "Lomé", "Aného", "Tsévié", "Vogan", "Tabligbo", "Notsé", "Kpalimé",
  "Atakpamé", "Amlamé", "Badou", "Sotouboua", "Sokodé", "Bassar",
  "Kara", "Niamtougou", "Kandé", "Mango", "Dapaong",
];

const SORT_OPTIONS = [
  { value: "recent", label: "Plus récents" },
  { value: "note", label: "Mieux notés" },
  { value: "prix_asc", label: "Prix croissant" },
  { value: "prix_desc", label: "Prix décroissant" },
];

function TalentCard({ talent }) {
  return (
    <Link to={`/talents/${talent.id}`} className="rc-card">
      <div className="rc-card-image-wrap">
        {talent.portfolio ? (
          <img src={talent.portfolio} alt={talent.nom} className="rc-card-image" />
        ) : (
          <div className="rc-card-image-placeholder" />
        )}
        {talent.disponible && <span className="rc-card-dispo-badge">Disponible</span>}
      </div>
      <div className="rc-card-body">
        <div className="rc-card-top">
          <p className="rc-card-nom">{talent.nom}</p>
          {talent.note > 0 && (
            <span className="rc-card-note">
              <Star size={13} className="rc-card-star" /> {talent.note}
              <span className="rc-card-avis-count">({talent.avis})</span>
            </span>
          )}
        </div>
        <p className="rc-card-categorie">{talent.categorie}</p>
        {talent.ville && (
          <p className="rc-card-ville"><MapPin size={12} /> {talent.ville}</p>
        )}
        <p className="rc-card-tarif">
          À partir de <strong>{talent.tarif ? talent.tarif.toLocaleString("fr-FR") : "—"} FCFA</strong>
        </p>
      </div>
    </Link>
  );
}

export default function RechercheTalents() {
  const [talents, setTalents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q: "",
    categorie_id: "",
    ville: "",
    budget_max: "",
    disponible: false,
    sort: "recent",
  });

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res?.data || []))
      .catch(() => setCategories([]));
  }, []);

  const fetchTalents = useCallback(() => {
    setLoading(true);
    setError("");

    const params = {};
    if (filters.q.trim()) params.q = filters.q.trim();
    if (filters.categorie_id) params.categorie_id = filters.categorie_id;
    if (filters.ville) params.ville = filters.ville;
    if (filters.budget_max) params.budget_max = filters.budget_max;
    if (filters.disponible) params.disponible = 1;
    params.sort = filters.sort;

    searchTalents(params)
      .then((res) => setTalents(res.data || []))
      .catch(() => setError("Impossible de charger les talents. Réessayez."))
      .finally(() => setLoading(false));
  }, [filters]);

  // Chargement initial + à chaque changement de filtre (debounce léger sur la recherche texte)
  useEffect(() => {
    const timeout = setTimeout(fetchTalents, filters.q ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [fetchTalents]);

  const resetFilters = () => {
    setFilters({ q: "", categorie_id: "", ville: "", budget_max: "", disponible: false, sort: "recent" });
  };

  const activeFilterCount = [
    filters.categorie_id, filters.ville, filters.budget_max, filters.disponible,
  ].filter(Boolean).length;

  return (
    <div className="rc-page">
      <div className="rc-header">
        <h1 className="rc-title">Trouver un talent</h1>
        <p className="rc-sub">Parcourez les profils validés et filtrez selon vos besoins.</p>

        <div className="rc-search-bar">
          <Search size={18} className="rc-search-icon" />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="rc-search-input"
          />
          <button
            type="button"
            className="rc-filter-toggle"
            onClick={() => setShowFilters((s) => !s)}
          >
            <SlidersHorizontal size={16} />
            Filtres {activeFilterCount > 0 && <span className="rc-filter-count">{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="rc-filters-panel">
          <div className="rc-filter-field">
            <label>Catégorie</label>
            <select
              value={filters.categorie_id}
              onChange={(e) => setFilters({ ...filters, categorie_id: e.target.value })}
            >
              <option value="">Toutes</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>

          <div className="rc-filter-field">
            <label>Ville</label>
            <select
              value={filters.ville}
              onChange={(e) => setFilters({ ...filters, ville: e.target.value })}
            >
              <option value="">Toutes</option>
              {VILLES_TOGO.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="rc-filter-field">
            <label>Budget max. (FCFA)</label>
            <input
              type="number"
              min="0"
              placeholder="Ex: 50000"
              value={filters.budget_max}
              onChange={(e) => setFilters({ ...filters, budget_max: e.target.value })}
            />
          </div>

          <div className="rc-filter-field">
            <label>Trier par</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <label className="rc-checkbox-field">
            <input
              type="checkbox"
              checked={filters.disponible}
              onChange={(e) => setFilters({ ...filters, disponible: e.target.checked })}
            />
            Disponibles uniquement
          </label>

          {activeFilterCount > 0 && (
            <button type="button" className="rc-reset-btn" onClick={resetFilters}>
              <X size={14} /> Réinitialiser
            </button>
          )}
        </div>
      )}

      <div className="rc-results">
        {loading ? (
          <p className="rc-status">Chargement...</p>
        ) : error ? (
          <p className="rc-status rc-status-error">{error}</p>
        ) : talents.length === 0 ? (
          <div className="rc-empty">
            <p className="rc-empty-title">Aucun talent trouvé pour ces critères</p>
            <p className="rc-empty-sub">Essayez d'élargir votre recherche.</p>
          </div>
        ) : (
          <>
            <p className="rc-results-count">{talents.length} talent{talents.length > 1 ? "s" : ""} trouvé{talents.length > 1 ? "s" : ""}</p>
            <div className="rc-grid">
              {talents.map((t) => (
                <TalentCard key={t.id} talent={t} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}