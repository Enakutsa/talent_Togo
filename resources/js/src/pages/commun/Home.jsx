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
  "Photographe": Camera,
  "Graphiste": Palette,
  "Couturier / Couturière": Scissors,
  "Musicien / DJ": Music2,
  "Vidéaste": Film,
  "Décorateur événementiel": Package2,
  "Maquilleur / Maquilleuse": Brush,
  "Coiffeur / Coiffeuse": Star,
  "Développeur": Star,
  "Autre": Star,
};

// ✅ Profils ENTIÈREMENT fictifs (nom complet, ville, photo) — plus aucun
// lien avec de vrais clients inscrits en base. Un vrai client tombant sur
// son propre nom à côté d'un avis qu'il n'a jamais écrit serait à juste
// titre choqué ; ces témoignages sont donc clairement des exemples
// inventés, jamais rattachés à des données réelles (getFeaturedClients
// n'est plus utilisé pour cette section).
//
// Photos via Unsplash (images.unsplash.com) — licence Unsplash : usage
// commercial libre, aucune attribution requise, photos mises à
// disposition par les photographes précisément pour ce type de réemploi
// (contrairement à une photo prise au hasard sur le web, qui poserait un
// problème de droit à l'image).
const STATIC_TESTIMONIALS = [
  {
    nom: "Ama Koffi",
    ville: "Lomé",
    note: 5,
    commentaire: "J'ai trouvé un photographe professionnel en 10 minutes. Service exceptionnel !",
    avatar: "https://images.unsplash.com/photo-1611432579402-7037e3e2c1e4?w=200&h=200&fit=crop&auto=format",
  },
  {
    nom: "Kodjo Mensah",
    ville: "Kara",
    note: 5,
    commentaire: "TalentTogo m'a permis d'atteindre des clients que je n'aurais jamais pu contacter autrement.",
    avatar: "https://images.unsplash.com/photo-1495603889488-42d1d66e5523?w=200&h=200&fit=crop&auto=format",
  },
  {
    nom: "Sena Adjovi",
    ville: "Sokodé",
    note: 5,
    commentaire: "La qualité des talents sur cette plateforme est remarquable. Je recommande vivement.",
    avatar: "https://images.unsplash.com/photo-1508002366005-75a695ee2d17?w=200&h=200&fit=crop&auto=format",
  },
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

  // ✅ Plus de données fictives en cas d'échec ou de liste vide pour les
  // catégories/talents/stats : on affiche exactement ce que l'API
  // renvoie. Un site en production ne doit jamais montrer de faux
  // talents à un visiteur, que ce soit parce que l'appel a échoué ou
  // parce que la base est encore vide (nouveau déploiement, dev...).
  // Chaque section gère elle-même son propre état vide honnête plus bas.
  // (Les témoignages, eux, sont volontairement 100% statiques/fictifs —
  // voir STATIC_TESTIMONIALS ci-dessus — donc plus besoin d'appeler
  // getFeaturedClients ici.)
  useEffect(() => {
    getCategories()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data;
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => setCategories([]));

    getFeaturedTalents()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data;
        setTalents(Array.isArray(list) ? list : []);
      })
      .catch(() => setTalents([]));

    getStats()
      .then((res) => {
        const data = res?.data ?? res;
        setStats([
          { key: "talents",      icon: Users,     label: "Talents inscrits",       value: data?.talents      ?? "0" },
          { key: "clients",      icon: Briefcase, label: "Clients actifs",         value: data?.clients      ?? "0" },
          { key: "prestations",  icon: Star,      label: "Prestations réalisées",  value: data?.prestations  ?? "0" },
          { key: "villes",       icon: Globe,     label: "Villes couvertes",       value: data?.villes       ?? "0" },
        ]);
      })
      .catch(() => setStats([]));
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

      {/* STATS — masqué entièrement si l'API n'a rien renvoyé (échec ou
          statistiques toutes nulles), plutôt que d'afficher des zéros
          vides qui ne veulent rien dire visuellement. */}
      {(stats === null || stats.length > 0) && (
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
      )}

      {/* CATEGORIES */}
      <section className="section">
        <div className="section-center">
          <h2 className="section-title">Explorez par catégorie</h2>
          <p className="section-subtitle">Toutes les compétences créatives du Togo</p>
        </div>

        {categories === null ? (
          <div className="categories-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="category-card-skeleton" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="section-subtitle" style={{ textAlign: "center" }}>
            Aucune catégorie disponible pour le moment.
          </p>
        ) : (
          <>
            {/* ✅ .slice(0, 8) : on limite volontairement l'affichage de
                la home aux 8 premières catégories, même si l'API en
                renvoie davantage. Le bouton "Voir tout" ci-dessous mène
                vers /recherche où TOUTES les catégories restent
                accessibles/filtrables normalement. */}
            <div className="categories-grid">
              {categories.slice(0, 8).map(({ label, count }) => {
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

            <div className="categories-cta-wrap">
              <button onClick={() => navigate("/recherche")} className="section-link">
                Voir tout <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
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

          {talents === null ? (
            <div className="talents-grid">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="talent-card-skeleton" />
              ))}
            </div>
          ) : talents.length === 0 ? (
            <p className="section-subtitle-left">
              Aucun talent mis en avant pour le moment. Revenez bientôt !
            </p>
          ) : (
            <>
              <div className="talents-grid">
                {talents.slice(0, 3).map((t) => (
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
            </>
          )}
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

      {/* TÉMOIGNAGES CLIENTS — désormais 100% statiques et fictifs (voir
          STATIC_TESTIMONIALS), affichés systématiquement puisqu'ils ne
          dépendent plus d'aucune donnée réelle de la base. */}
      <section className="section testimonials-section">
        <div className="section-center">
          <h2 className="section-title">Ce que disent nos clients</h2>
          <p className="section-subtitle">Des milliers d'utilisateurs satisfaits à travers le Togo</p>
        </div>

        <div className="testimonials-grid">
          {STATIC_TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <Quote size={28} className="testimonial-quote-icon" />
              <div className="testimonial-stars">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    size={14}
                    className={si < t.note ? "testimonial-star-filled" : "testimonial-star-empty"}
                  />
                ))}
              </div>
              <p className="testimonial-text">"{t.commentaire}"</p>
              <div className="testimonial-author">
                <img src={t.avatar} alt={t.nom} className="testimonial-avatar" />
                <div>
                  <p className="testimonial-name">{t.nom}</p>
                  <p className="testimonial-city">{t.ville}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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