import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import TalentCard from "../../components/talent/TalentCard";
import { getFeaturedTalents, getStats, getCategories, getReviews } from "../../services/talent.service";
import {
  Search, MapPin, Camera, Palette, Scissors, Music2, Film, Package2, Brush, Star,
  ArrowRight, Users, Briefcase, Globe, ChevronRight, Quote
} from "lucide-react";
import "../../assets/styles/Home.css";

const CITIES = ["Lomé", "Kara", "Sokodé", "Atakpamé", "Kpalimé", "Dapaong"];

const CATEGORY_ICONS = {
  Photographe: Camera,
  Graphiste: Palette,
  Couturier: Scissors,
  Musicien: Music2,
  Vidéaste: Film,
  Artisan: Package2,
  Maquilleur: Brush,
  Danseur: Star,
};

/* ===== Données de secours (tant que le backend /talents, /stats, /categories, /avis n'existe pas) ===== */
const FALLBACK_CATEGORIES = [
  { label: "Photographe", count: 48 },
  { label: "Graphiste", count: 32 },
  { label: "Couturier", count: 61 },
  { label: "Musicien", count: 27 },
  { label: "Vidéaste", count: 19 },
  { label: "Artisan", count: 54 },
  { label: "Maquilleur", count: 38 },
  { label: "Danseur", count: 15 },
];

const FALLBACK_TALENTS = [
  { id: 1, nom: "Koffi Mensah", categorie: "Photographe", ville: "Lomé", note: 4.9, avis: 124, tarif: 50000, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", portfolio: "https://images.unsplash.com/photo-1472148083604-64f1084980b9?w=400&h=300&fit=crop", disponible: true, competences: ["Portrait", "Mariage", "Mode"] },
  { id: 2, nom: "Akosua Doe", categorie: "Graphiste", ville: "Lomé", note: 4.7, avis: 89, tarif: 30000, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", portfolio: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop", disponible: true, competences: ["Logo", "Identité visuelle", "Print"] },
  { id: 3, nom: "Yao Agbenyenu", categorie: "Couturier", ville: "Kara", note: 4.8, avis: 67, tarif: 45000, avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop", portfolio: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", disponible: false, competences: ["Pagne", "Sur mesure", "Broderie"] },
];

const FALLBACK_STATS = [
  { key: "talents", icon: Users, label: "Talents inscrits", value: "500+" },
  { key: "clients", icon: Briefcase, label: "Clients actifs", value: "1 200+" },
  { key: "prestations", icon: Star, label: "Prestations réalisées", value: "3 400+" },
  { key: "villes", icon: Globe, label: "Villes couvertes", value: "6" },
];

const FALLBACK_REVIEWS = [
  { id: 1, nom: "Esther Kpadenou", ville: "Lomé", note: 5, commentaire: "J'ai trouvé un photographe en moins de 10 minutes pour mon mariage. Service impeccable et très professionnel !", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop" },
  { id: 2, nom: "Mawuli Adjété", ville: "Kara", note: 5, commentaire: "TalentTogo m'a permis de trouver une couturière de qualité près de chez moi. Je recommande vivement !", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" },
  { id: 3, nom: "Akossiwa Lawson", ville: "Lomé", note: 4, commentaire: "Plateforme simple et rapide pour contacter directement les talents. La messagerie intégrée est top.", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop" },
];

const steps = [
  { step: "01", title: "Recherchez un talent", desc: "Utilisez notre moteur de recherche pour trouver un talent par compétence, ville ou budget." },
  { step: "02", title: "Consultez le portfolio", desc: "Parcourez les travaux réalisés, lisez les avis et comparez les profils." },
  { step: "03", title: "Contactez directement", desc: "Envoyez une demande de prestation via notre messagerie intégrée sécurisée." },
];

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [favorites, setFavorites] = useState([]);

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [talents, setTalents] = useState(FALLBACK_TALENTS);
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);

  // Chargement temps réel depuis l'API. Si une route n'existe pas encore
  // côté backend, on garde silencieusement les données de secours.
  useEffect(() => {
    getCategories()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data;
        if (Array.isArray(list) && list.length) setCategories(list);
      })
      .catch(() => {});

    getFeaturedTalents()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data;
        if (Array.isArray(list) && list.length) setTalents(list);
      })
      .catch(() => {});

    getStats()
      .then((data) => {
        if (!data) return;
        setStats([
          { key: "talents", icon: Users, label: "Talents inscrits", value: data.talents ?? "500+" },
          { key: "clients", icon: Briefcase, label: "Clients actifs", value: data.clients ?? "1 200+" },
          { key: "prestations", icon: Star, label: "Prestations réalisées", value: data.prestations ?? "3 400+" },
          { key: "villes", icon: Globe, label: "Villes couvertes", value: data.villes ?? "6" },
        ]);
      })
      .catch(() => {});

    getReviews()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data;
        if (Array.isArray(list) && list.length) setReviews(list);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (city) params.set("ville", city);
    navigate(`/recherche?${params.toString()}`);
  };

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-blob hero-blob-amber" />
        <div className="hero-blob hero-blob-green" />

        <div className="hero-inner">
          <div className="hero-badge">
            <span>🇹🇬 La plateforme des talents togolais</span>
          </div>

          <h1 className="hero-title">
            Découvrez et valorisez les <span className="hero-accent">talents locaux</span> du Togo
          </h1>

          <p className="hero-subtitle">
            Musiciens, photographes, couturiers, graphistes, artisans… Trouvez le talent parfait
            pour votre projet en quelques clics.
          </p>

          <form onSubmit={handleSearch} className="hero-search-bar">
            <div className="hero-search-field">
              <Search size={18} className="hero-search-icon" />
              <input
                type="text"
                placeholder="Quel talent recherchez-vous ?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="hero-search-field hero-search-field-city">
              <MapPin size={18} className="hero-search-icon" />
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Toutes les villes</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="hero-search-btn">
              Rechercher
            </button>
          </form>

          <div className="hero-quicklinks">
            {["Photographe à Lomé", "Musicien mariage", "Graphiste logo", "Couture pagne"].map((q) => (
              <button
                key={q}
                type="button"
                className="hero-quicklink"
                onClick={() => navigate(`/recherche?q=${encodeURIComponent(q)}`)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map(({ key, icon: Icon, label, value }) => (
            <div key={key} className="stat-item">
              <div className="stat-icon-wrap">
                <Icon size={22} />
              </div>
              <span className="stat-value">{value}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title-left">Explorez par catégorie</h2>
            <p className="section-subtitle-left">Toutes les compétences créatives du Togo</p>
          </div>
          <button onClick={() => navigate("/recherche")} className="section-link">
            Voir tout <ChevronRight size={16} />
          </button>
        </div>

        <div className="categories-grid">
          {(Array.isArray(categories) ? categories : []).map(({ label, count }) => {
            const Icon = CATEGORY_ICONS[label] || Star;
            return (
              <button
                key={label}
                onClick={() => navigate(`/recherche?categorie=${encodeURIComponent(label)}`)}
                className="category-card"
              >
                <div className="category-icon-wrap">
                  <Icon size={22} />
                </div>
                <h3 className="category-label">{label}</h3>
                <p className="category-count">{count} talents</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* FEATURED TALENTS */}
      <section className="featured-section">
        <div className="featured-inner">
          <div className="section-header-row">
            <div>
              <h2 className="section-title-left">Talents en vedette</h2>
              <p className="section-subtitle-left">Les profils les mieux notés cette semaine</p>
            </div>
            <button onClick={() => navigate("/recherche")} className="section-link">
              Voir tous les talents <ChevronRight size={16} />
            </button>
          </div>

          <div className="talents-grid">
            {(Array.isArray(talents) ? talents : []).map((t) => (
              <TalentCard
                key={t.id}
                {...t}
                isFavorite={favorites.includes(t.id)}
                onToggleFavorite={(id) =>
                  setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
                }
              />
            ))}
          </div>

          <div className="featured-cta-wrap">
            <button onClick={() => navigate("/recherche")} className="btn-primary">
              Voir tous les talents <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="section-center">
          <h2 className="section-title">Comment ça marche ?</h2>
          <p className="section-subtitle">Simple, rapide et sécurisé</p>
        </div>

        <div className="steps-grid">
          {steps.map(({ step, title, desc }, i) => (
            <div key={step} className={`step-item step-color-${i}`}>
              <div className="step-num-badge">{step}</div>
              <h3 className="step-title">{title}</h3>
              <p className="step-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TÉMOIGNAGES CLIENTS */}
      <section className="section testimonials-section">
        <div className="section-center">
          <h2 className="section-title">Ce que disent nos clients</h2>
          <p className="section-subtitle">Des milliers d'utilisateurs satisfaits à travers le Togo</p>
        </div>

        <div className="testimonials-grid">
          {(Array.isArray(reviews) ? reviews : []).map((r) => (
            <div key={r.id} className="testimonial-card">
              <Quote size={28} className="testimonial-quote-icon" />
              <div className="testimonial-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < r.note ? "testimonial-star-filled" : "testimonial-star-empty"}
                  />
                ))}
              </div>
              <p className="testimonial-text">"{r.commentaire}"</p>
              <div className="testimonial-author">
                <img src={r.avatar} alt={r.nom} className="testimonial-avatar" />
                <div>
                  <p className="testimonial-name">{r.nom}</p>
                  <p className="testimonial-city">{r.ville}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-pattern" />
        <div className="cta-inner">
          <h2 className="cta-title">Vous êtes un talent ? Rejoignez-nous !</h2>
          <p className="cta-text">
            Créez votre profil professionnel gratuit, publiez votre portfolio et connectez-vous
            avec des milliers de clients potentiels au Togo et en Afrique.
          </p>
          <div className="cta-actions">
            <button onClick={() => navigate("/register")} className="btn-outline-white">
              Créer mon profil gratuitement
            </button>
            <button onClick={() => navigate("/recherche")} className="btn-amber-cta">
              Découvrir les talents
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}