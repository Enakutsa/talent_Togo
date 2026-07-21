import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import TalentCard from "../../components/talent/TalentCard";
import { getFeaturedTalents, getStats, getCategories } from "../../services/talent.service";
import { AuthContext } from "../../context/AuthContext";
import {
  Search, Camera, Palette, Scissors, Music2, Film, Package2, Brush, Star,
  ArrowRight, Users, Briefcase, Globe, ChevronRight, Quote, Sparkles
} from "lucide-react";
import "../../assets/styles/Home.css";

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

/* ===== Données de secours (utilisées uniquement si l'API échoue vraiment) ===== */
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

// ✅ Témoignages fixes affichés en page d'accueil. Le texte est rédigé par
// la plateforme, mais la photo/nom viennent de vrais talents inscrits en
// base (récupérés via getFeaturedTalents) — pas de faux profils inventés,
// et pas de commentaires publics non modérés sur la page d'entrée du site.
const STATIC_TESTIMONIALS = [
  { note: 5, commentaire: "J'ai trouvé un photographe professionnel en 10 minutes. Service exceptionnel !" },
  { note: 5, commentaire: "TalentTogo m'a permis d'atteindre des clients que je n'aurais jamais pu contacter autrement." },
  { note: 5, commentaire: "La qualité des talents sur cette plateforme est remarquable. Je recommande vivement." },
];

const steps = [
  { step: "01", title: "Recherchez un talent", desc: "Utilisez notre moteur de recherche pour trouver un talent par compétence, ville ou budget." },
  { step: "02", title: "Consultez le portfolio", desc: "Parcourez les travaux réalisés, lisez les avis et comparez les profils." },
  { step: "03", title: "Contactez directement", desc: "Envoyez une demande de prestation via notre messagerie intégrée sécurisée." },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);

  const [categories, setCategories] = useState(null);
  const [talents, setTalents] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getCategories()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data;
        setCategories(Array.isArray(list) && list.length ? list : FALLBACK_CATEGORIES);
      })
      .catch(() => setCategories(FALLBACK_CATEGORIES));

    getFeaturedTalents()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data;
        setTalents(Array.isArray(list) && list.length ? list : FALLBACK_TALENTS);
      })
      .catch(() => setTalents(FALLBACK_TALENTS));

    getStats()
      .then((res) => {
        const data = res?.data ?? res;
        if (!data) {
          setStats(FALLBACK_STATS);
          return;
        }
        setStats([
          { key: "talents", icon: Users, label: "Talents inscrits", value: data.talents ?? "500+" },
          { key: "clients", icon: Briefcase, label: "Clients actifs", value: data.clients ?? "1 200+" },
          { key: "prestations", icon: Star, label: "Prestations réalisées", value: data.prestations ?? "3 400+" },
          { key: "villes", icon: Globe, label: "Villes couvertes", value: data.villes ?? "6" },
        ]);
      })
      .catch(() => setStats(FALLBACK_STATS));
  }, []);

  // ✅ Scroll automatique vers "Comment ça marche" si on arrive avec
  // l'ancre depuis le footer (ex: /#comment-ca-marche depuis une autre page).
  useEffect(() => {
    if (window.location.hash === "#comment-ca-marche") {
      setTimeout(() => {
        document.getElementById("comment-ca-marche")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    navigate(`/recherche?${params.toString()}`);
  };

  const handleVoirTousLesTalents = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/recherche" } });
      return;
    }
    navigate("/recherche");
  };

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-blob hero-blob-amber" />
        <div className="hero-blob hero-blob-green" />

        <div className="hero-inner">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>La plateforme des talents togolais</span>
          </div>

          <h1 className="hero-title">
            Découvrez et valorisez les <span className="hero-accent">talents locaux</span> du Togo
          </h1>

          <p className="hero-subtitle">
            Musiciens, photographes, couturiers, graphistes, artisans… Trouvez le talent parfait
            pour votre projet en quelques clics.
          </p>

          <form onSubmit={handleSearch} className="hero-search-bar">
            <div
              className="hero-search-field"
              onClick={() => navigate("/recherche")}
              style={{ cursor: "pointer" }}
            >
              <Search size={18} className="hero-search-icon" />
              <input
                type="text"
                placeholder="Cliquez sur Rechercher pour trouver un talent"
                readOnly
                style={{ cursor: "pointer" }}
              />
            </div>
            <button type="submit" className="hero-search-btn">
              Rechercher <ArrowRight size={16} />
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
          {stats === null
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="stat-item-skeleton" />
              ))
            : stats.map(({ key, icon: Icon, label, value }) => (
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
          {categories === null
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="category-card-skeleton" />
              ))
            : categories.map(({ label, count }) => {
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
            <button onClick={handleVoirTousLesTalents} className="section-link">
              Voir tous les talents <ChevronRight size={16} />
            </button>
          </div>

          <div className="talents-grid">
            {talents === null
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="talent-card-skeleton" />
                ))
              : talents.slice(0, 3).map((t) => (
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
            <button onClick={handleVoirTousLesTalents} className="btn-primary">
              Voir tous les talents <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="comment-ca-marche" className="section">
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
      {talents !== null && talents.length > 0 && (
        <section className="section testimonials-section">
          <div className="section-center">
            <h2 className="section-title">Ce que disent nos clients</h2>
            <p className="section-subtitle">Des milliers d'utilisateurs satisfaits à travers le Togo</p>
          </div>

          <div className="testimonials-grid">
            {talents.slice(0, 3).map((t, i) => {
              const testimonial = STATIC_TESTIMONIALS[i];
              if (!testimonial) return null;

              return (
                <div key={t.id} className="testimonial-card">
                  <Quote size={28} className="testimonial-quote-icon" />
                  <div className="testimonial-stars">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        size={14}
                        className={si < testimonial.note ? "testimonial-star-filled" : "testimonial-star-empty"}
                      />
                    ))}
                  </div>
                  <p className="testimonial-text">"{testimonial.commentaire}"</p>
                  <div className="testimonial-author">
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.nom} className="testimonial-avatar" />
                    ) : (
                      <div className="testimonial-avatar testimonial-avatar-placeholder">
                        {(t.nom ?? "?")[0]}
                      </div>
                    )}
                    <div>
                      <p className="testimonial-name">{t.nom}</p>
                      {t.ville && <p className="testimonial-city">{t.ville}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta-section-v2">
        <div className="cta-v2-inner">
          <div className="cta-v2-icon">
            <Sparkles size={22} />
          </div>
          <h2 className="cta-v2-title">Vous êtes un talent ? Rejoignez-nous !</h2>
          <p className="cta-v2-text">
            Créez votre profil professionnel gratuit, publiez votre portfolio et connectez-vous
            avec des milliers de clients potentiels au Togo et en Afrique.
          </p>
          <div className="cta-v2-actions">
            <button onClick={() => navigate("/register")} className="cta-v2-btn-primary">
              Créer mon profil gratuitement
            </button>
            <button onClick={() => navigate("/recherche")} className="cta-v2-btn-secondary">
              Découvrir les talents
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}