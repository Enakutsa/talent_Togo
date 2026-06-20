import { useState } from "react";
import { Search, MapPin, ChevronRight, Star, Users, Briefcase, Globe, BadgeCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/styles/Home.css";

// TODO: remplacer ces données statiques par un appel à l'API Laravel plus tard
// (ex: GET /api/talents?featured=1, GET /api/stats, GET /api/categories, GET /api/cities)
const CATEGORIES = [
  { id: "photographie", icon: "📷", label: "Photographie", count: 0 },
  { id: "graphisme", icon: "🎨", label: "Graphisme", count: 0 },
  { id: "couture", icon: "🧵", label: "Couture", count: 0 },
  { id: "musique", icon: "🎵", label: "Musique", count: 0 },
];

const STATS = { talents: 0, clients: 0, prestations: 0, cities: 0 };
const CITIES = ["Lomé", "Kara", "Sokodé", "Atakpamé"];
const TALENTS = []; // vide pour l'instant, en attendant l'API

export function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCity) params.set("city", selectedCity);
    navigate(`/talents?${params.toString()}`);
  };

  const featuredTalents = TALENTS.filter((t) => t.verified).slice(0, 3);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="badge">🇹🇬 La plateforme des talents togolais</div>

          <h1 className="hero-title">
            Découvrez et valorisez les <span className="highlight">talents locaux</span> du Togo
          </h1>

          <p className="hero-subtitle">
            Musiciens, photographes, couturiers, graphistes, artisans… Trouvez le talent parfait
            pour votre projet en quelques clics.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-field">
              <Search size={18} />
              <input
                type="text"
                placeholder="Quel talent recherchez-vous ?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="search-field city">
              <MapPin size={18} />
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                <option value="">Toutes les villes</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="search-button">
              Rechercher
            </button>
          </form>

          {/* Quick links */}
          <div className="quick-links">
            {["Photographe à Lomé", "Musicien mariage", "Graphiste logo", "Couture pagne"].map((q) => (
              <button
                key={q}
                className="quick-link"
                onClick={() => {
                  setSearchQuery(q);
                  navigate(`/talents?q=${encodeURIComponent(q)}`);
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stats-grid">
          {[
            { icon: Users, label: "Talents inscrits", value: STATS.talents.toLocaleString("fr-FR"), color: "var(--primary)" },
            { icon: Briefcase, label: "Clients actifs", value: STATS.clients.toLocaleString("fr-FR"), color: "var(--accent)" },
            { icon: Star, label: "Prestations réalisées", value: STATS.prestations.toLocaleString("fr-FR"), color: "#c0392b" },
            { icon: Globe, label: "Villes couvertes", value: STATS.cities.toString(), color: "#2980b9" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="stat-item">
              <div className="stat-icon" style={{ background: `${color}18` }}>
                <Icon size={22} style={{ color }} />
              </div>
              <span className="stat-value">{value}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2 className="section-title">Explorez par catégorie</h2>
              <p className="section-subtitle">Toutes les compétences créatives du Togo</p>
            </div>
            <Link to="/talents" className="section-link">
              Voir tout <ChevronRight size={16} />
            </Link>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} to={`/talents?category=${cat.id}`} className="category-card">
                <span className="category-icon">{cat.icon}</span>
                <span className="category-label">{cat.label}</span>
                <span className="category-count">{cat.count} talents</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured talents */}
      <section className="section section-secondary">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2 className="section-title">Talents en vedette</h2>
              <p className="section-subtitle">Les profils les mieux notés cette semaine</p>
            </div>
            <Link to="/talents" className="section-link">
              Voir tous les talents <ChevronRight size={16} />
            </Link>
          </div>

          {featuredTalents.length > 0 ? (
            <div className="talents-grid">
              {featuredTalents.map((talent) => (
                <Link key={talent.id} to={`/talents/${talent.id}`} className="talent-card">
                  <div className="talent-cover">
                    {talent.coverUrl && <img src={talent.coverUrl} alt={`Réalisation de ${talent.name}`} />}
                  </div>
                  <div className="talent-body">
                    <div className="talent-name-row">
                      <h3 className="talent-name">{talent.name}</h3>
                      {talent.verified && (
                        <BadgeCheck size={16} style={{ color: "var(--primary)" }} aria-label="Profil vérifié" />
                      )}
                    </div>
                    <p className="talent-category">{talent.category}</p>
                    <div className="talent-meta">
                      <div className="talent-location">
                        <MapPin size={14} />
                        <span>{talent.city}</span>
                      </div>
                      {talent.rating != null && (
                        <div className="talent-rating">
                          <Star size={14} fill="#d4841a" stroke="#d4841a" />
                          <span>{talent.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-state">Aucun talent à afficher pour le moment.</p>
          )}

          <div className="center-action">
            <Link to="/talents" className="btn-primary">
              Voir tous les talents <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header" style={{ justifyContent: "center", textAlign: "center", flexDirection: "column" }}>
            <h2 className="section-title">Comment ça marche ?</h2>
            <p className="section-subtitle">Simple, rapide et sécurisé</p>
          </div>

          <div className="steps-grid">
            {[
              {
                step: "01",
                title: "Recherchez un talent",
                desc: "Utilisez notre moteur de recherche pour trouver un talent par compétence, ville ou budget.",
                color: "var(--primary)",
              },
              {
                step: "02",
                title: "Consultez le portfolio",
                desc: "Parcourez les travaux réalisés, lisez les avis et comparez les profils.",
                color: "var(--accent)",
              },
              {
                step: "03",
                title: "Contactez directement",
                desc: "Envoyez une demande de prestation via notre messagerie intégrée sécurisée.",
                color: "#2980b9",
              },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="step-item">
                <div className="step-number" style={{ background: color }}>
                  {step}
                </div>
                <h3 className="step-title">{title}</h3>
                <p className="step-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-inner">
          <h2 className="cta-title">Vous êtes un talent ? Rejoignez-nous !</h2>
          <p className="cta-text">
            Créez votre profil professionnel gratuit, publiez votre portfolio et connectez-vous
            avec des milliers de clients potentiels au Togo et en Afrique.
          </p>
          <div className="cta-actions">
            <Link to="/inscription" className="btn-outline">
              Créer mon profil gratuitement
            </Link>
            <Link to="/talents" className="btn-accent">
              Découvrir les talents
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">T</div>
              <span className="footer-logo-text">TalentTogo</span>
            </div>
            <p className="footer-desc">La plateforme de référence pour les talents créatifs du Togo.</p>
          </div>
          {[
            { title: "Plateforme", links: ["Talents", "Catégories", "Comment ça marche", "Tarifs"] },
            { title: "Entreprise", links: ["À propos", "Blog", "Presse", "Carrières"] },
            { title: "Support", links: ["Centre d'aide", "Contact", "CGU", "Confidentialité"] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="footer-col-title">{title}</h4>
              <ul className="footer-links">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">© 2025 TalentTogo — Tous droits réservés. Fait avec ❤️ au Togo.</div>
      </footer>
    </div>
  );
}