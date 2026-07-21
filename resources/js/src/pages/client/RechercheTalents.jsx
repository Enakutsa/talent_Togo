import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search, MapPin, Star, SlidersHorizontal,
  X, ChevronDown
} from "lucide-react";
import { searchTalents, getCategories } from "../../services/talent.service";
import "../../assets/styles/Recherche.css";

const VILLES_TOGO = [
  "Lomé", "Aného", "Tsévié", "Vogan", "Tabligbo", "Notsé", "Kpalimé",
  "Atakpamé", "Amlamé", "Badou", "Sotouboua", "Sokodé", "Bassar",
  "Kara", "Niamtougou", "Kandé", "Mango", "Dapaong",
];

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const SORT_OPTIONS = [
  { value: "recent",    label: "Plus récents"     },
  { value: "note",      label: "Mieux notés"      },
  { value: "prix_asc",  label: "Prix croissant"   },
  { value: "prix_desc", label: "Prix décroissant" },
];

// ── Carte talent ─────────────────────────────────────────────────────────────
function TalentCard({ talent }) {
  return (
    <Link to={`/talents/${talent.id}`} className="rc-card">
      <div className="rc-card-image-wrap">
        {talent.portfolio ? (
          <img src={talent.portfolio} alt={talent.nom} className="rc-card-image" />
        ) : (
          <div className="rc-card-image-placeholder" />
        )}
        <span className={`rc-card-dispo-badge ${talent.disponible ? "rc-dispo-on" : "rc-dispo-off"}`}>
          {talent.disponible ? "Disponible" : "Indisponible"}
        </span>
      </div>
      <div className="rc-card-body">
        <div className="rc-card-top">
          <p className="rc-card-nom">{talent.nom}</p>
          {talent.note > 0 && (
            <span className="rc-card-note">
              <Star size={13} className="rc-card-star" />
              {talent.note}
              <span className="rc-card-avis-count">({talent.avis})</span>
            </span>
          )}
        </div>
        <p className="rc-card-categorie">{talent.categorie}</p>
        {talent.ville && (
          <p className="rc-card-ville">
            <MapPin size={12} /> {talent.ville}
          </p>
        )}
        <p className="rc-card-tarif">
          À partir de{" "}
          <strong>
            {talent.tarif ? talent.tarif.toLocaleString("fr-FR") : "—"} FCFA
          </strong>
        </p>
      </div>
    </Link>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function RechercheTalents() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [talents,     setTalents]     = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [budget,      setBudget]      = useState(500000);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchWrapRef = useRef(null);

  const [filters, setFilters] = useState({
    q:            searchParams.get("q") || "",
    categorie_id: searchParams.get("categorie_id") || "",
    ville:        searchParams.get("ville") || "",
    disponible:   searchParams.get("disponible") === "1",
    sort:         searchParams.get("sort") || "recent",
  });

  const [pendingCategorieName] = useState(() => searchParams.get("categorie"));

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res?.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!pendingCategorieName || filters.categorie_id || categories.length === 0) return;

    const match = categories.find(
      (c) => c.nom === pendingCategorieName || c.label === pendingCategorieName
    );
    if (match) {
      setFilters((f) => ({ ...f, categorie_id: String(match.id) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const requestIdRef = useRef(0);

  const fetchTalents = useCallback(() => {
    const currentRequestId = ++requestIdRef.current;

    setLoading(true);
    setError("");

    const params = {};
    if (filters.q.trim())      params.q            = filters.q.trim();
    if (filters.categorie_id)  params.categorie_id = filters.categorie_id;
    if (filters.ville)         params.ville        = filters.ville;
    if (budget < 500000)       params.budget_max   = budget;
    if (filters.disponible)    params.disponible   = 1;
    params.sort = filters.sort;

    searchTalents(params)
      .then((res) => {
        if (currentRequestId !== requestIdRef.current) return;
        setTalents(res.data || []);
      })
      .catch(() => {
        if (currentRequestId !== requestIdRef.current) return;
        setError("Impossible de charger les talents. Réessayez.");
      })
      .finally(() => {
        if (currentRequestId !== requestIdRef.current) return;
        setLoading(false);
      });
  }, [filters, budget]);

  useEffect(() => {
    const timeout = setTimeout(fetchTalents, filters.q ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [fetchTalents]);

  useEffect(() => {
    const params = {};
    if (filters.q) params.q = filters.q;
    if (filters.categorie_id) params.categorie_id = filters.categorie_id;
    if (filters.ville) params.ville = filters.ville;
    if (filters.disponible) params.disponible = "1";
    if (filters.sort !== "recent") params.sort = filters.sort;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const resetFilters = () => {
    setFilters({ q: "", categorie_id: "", ville: "", disponible: false, sort: "recent" });
    setBudget(500000);
  };

  const activeFilterCount = [
    filters.categorie_id,
    filters.ville,
    filters.disponible,
    budget < 500000,
  ].filter(Boolean).length;

  const searchSuggestions = filters.q.trim().length > 0
    ? categories.filter((c) => normalize(c.nom).includes(normalize(filters.q.trim())))
    : [];

  const selectSuggestion = (categorie) => {
    setFilters({ ...filters, q: "", categorie_id: String(categorie.id) });
    setShowSuggestions(false);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="rc-page">

      {/* ── Hero ── */}
      <div className="rc-hero">
        <div className="rc-hero-inner">
          <h1 className="rc-hero-title">Trouver un talent</h1>
          <p className="rc-hero-sub">
            {talents.length > 0
              ? `${talents.length} talents créatifs disponibles au Togo`
              : "Parcourez les profils validés et filtrez selon vos besoins."}
          </p>

          <div className="rc-hero-search">
            <div className="rc-hero-search-field" ref={searchWrapRef}>
              <Search size={18} className="rc-search-icon-hero" />
              <input
                type="text"
                placeholder="Photographe, graphiste, musicien..."
                value={filters.q}
                onChange={(e) => {
                  setFilters({ ...filters, q: e.target.value });
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="rc-hero-search-input"
              />
              {filters.q && (
                <button
                  onClick={() => { setFilters({ ...filters, q: "" }); setShowSuggestions(false); }}
                  className="rc-clear-btn"
                >
                  <X size={16} />
                </button>
              )}

              {showSuggestions && searchSuggestions.length > 0 && (
                <ul className="rc-suggestions">
                  {searchSuggestions.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className="rc-suggestion-item"
                        onClick={() => selectSuggestion(c)}
                      >
                        <Search size={14} className="rc-suggestion-icon" />
                        <span>{c.nom}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              className="rc-hero-filter-btn"
              onClick={() => setShowFilters((s) => !s)}
            >
              <SlidersHorizontal size={16} />
              Filtres
              {activeFilterCount > 0 && (
                <span className="rc-filter-badge">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Corps ── */}
      <div className="rc-body">
        <div className="rc-layout">

          {/* ── Sidebar filtres ── */}
          <aside className={`rc-sidebar ${showFilters ? "rc-sidebar-open" : ""}`}>
            <h2 className="rc-sidebar-title">Filtres</h2>

            <div className="rc-filter-group">
              <p className="rc-filter-label">Catégorie</p>
              <div className="rc-cat-list">
                <button
                  className={`rc-cat-btn ${!filters.categorie_id ? "rc-cat-active" : ""}`}
                  onClick={() => setFilters({ ...filters, categorie_id: "" })}
                >
                  Toutes
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    className={`rc-cat-btn ${filters.categorie_id === String(c.id) ? "rc-cat-active" : ""}`}
                    onClick={() => setFilters({ ...filters, categorie_id: String(c.id) })}
                  >
                    {c.nom}
                  </button>
                ))}
              </div>
            </div>

            <div className="rc-filter-group">
              <p className="rc-filter-label">Ville</p>
              <div className="rc-select-wrap">
                <select
                  value={filters.ville}
                  onChange={(e) => setFilters({ ...filters, ville: e.target.value })}
                  className="rc-select"
                >
                  <option value="">Toutes les villes</option>
                  {VILLES_TOGO.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="rc-select-icon" />
              </div>
            </div>

            <div className="rc-filter-group">
              <p className="rc-filter-label">
                Budget max
                <span className="rc-budget-val">
                  {budget >= 500000 ? "Illimité" : budget.toLocaleString("fr-FR") + " FCFA"}
                </span>
              </p>
              <input
                type="range"
                min={10000}
                max={500000}
                step={5000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="rc-range"
              />
              <div className="rc-range-labels">
                <span>10 000</span><span>Illimité</span>
              </div>
            </div>

            <div className="rc-filter-group">
              <p className="rc-filter-label">Trier par</p>
              <div className="rc-select-wrap">
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                  className="rc-select"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="rc-select-icon" />
              </div>
            </div>

            <div className="rc-filter-group">
              <label className="rc-checkbox-row">
                <div
                  className={`rc-checkbox ${filters.disponible ? "rc-checkbox-on" : ""}`}
                  onClick={() => setFilters({ ...filters, disponible: !filters.disponible })}
                >
                  {filters.disponible && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span className="rc-checkbox-label">Disponibles uniquement</span>
              </label>
            </div>

            {activeFilterCount > 0 && (
              <button className="rc-reset-btn" onClick={resetFilters}>
                <X size={14} /> Réinitialiser
              </button>
            )}
          </aside>

          {/* ── Résultats ── */}
          <div className="rc-results">

            <div className="rc-results-bar">
              <p className="rc-results-count">
                {loading ? "Chargement..." : (
                  <>
                    <span className="rc-results-num">{talents.length}</span>{" "}
                    talent{talents.length !== 1 ? "s" : ""} trouvé{talents.length !== 1 ? "s" : ""}
                  </>
                )}
              </p>
              <div className="rc-chips">
                {filters.categorie_id && categories.find(c => String(c.id) === filters.categorie_id) && (
                  <span className="rc-chip">
                    {categories.find(c => String(c.id) === filters.categorie_id)?.nom}
                    <button onClick={() => setFilters({ ...filters, categorie_id: "" })}><X size={11} /></button>
                  </span>
                )}
                {filters.ville && (
                  <span className="rc-chip">
                    {filters.ville}
                    <button onClick={() => setFilters({ ...filters, ville: "" })}><X size={11} /></button>
                  </span>
                )}
                {filters.disponible && (
                  <span className="rc-chip">
                    Disponibles
                    <button onClick={() => setFilters({ ...filters, disponible: false })}><X size={11} /></button>
                  </span>
                )}
              </div>
            </div>

            {error ? (
              <p className="rc-status-error">{error}</p>
            ) : loading ? (
              <div className="rc-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rc-skeleton" />
                ))}
              </div>
            ) : talents.length === 0 ? (
              <div className="rc-empty">
                <div className="rc-empty-icon">
                  <Search size={28} />
                </div>
                <h3 className="rc-empty-title">Aucun talent trouvé</h3>
                <p className="rc-empty-sub">Modifiez vos filtres pour voir plus de résultats.</p>
                <button className="rc-empty-reset" onClick={resetFilters}>
                  Tout afficher
                </button>
              </div>
            ) : (
              <div className="rc-grid">
                {talents.map((t) => (
                  <TalentCard key={t.id} talent={t} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}