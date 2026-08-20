import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import TalentCard from "../../components/talent/TalentCard";
import { getFeaturedTalents, getStats, getCategories } from "../../services/talent.service";
import { AuthContext } from "../../context/AuthContext";
import {
  Search, ArrowRight, Users, Briefcase, Globe, ChevronRight, Quote, Sparkles,
  Compass, FileCheck2, MessageCircle, Star
} from "lucide-react";
import "../../assets/styles/Home.css";

// ✅ Une vraie photo pour CHAQUE catégorie (8/8), toutes en licence libre
// Unsplash (usage commercial gratuit). Objets/outils en gros plan pour
// les 4 nouvelles catégories (pas de visages) afin de rester cohérent
// avec le style déjà en place (Photographe, Graphiste...).
const CATEGORY_IMAGES = {
  "Photographe": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=900&fit=crop&auto=format",
  "Musicien / DJ": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=900&fit=crop&auto=format",
  "Couturier / Couturière": "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&h=900&fit=crop&auto=format",
  "Graphiste": "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=900&fit=crop&auto=format",
  "Coiffeur / Coiffeuse": "https://images.unsplash.com/photo-1596362601603-b74f6ef166e4?w=800&h=900&fit=crop&auto=format",
  "Décorateur événementiel": "https://images.unsplash.com/photo-1560128411-79892dd93bf8?w=800&h=900&fit=crop&auto=format",
  "Développeur": "https://images.unsplash.com/photo-1699885960867-56d5f5262d38?w=800&h=900&fit=crop&auto=format",
  "Autre": "https://images.unsplash.com/photo-1568205612837-017257d2310a?w=800&h=900&fit=crop&auto=format",
};

// Filet de sécurité si une catégorie sans photo dédiée apparaît un jour côté backend.
const DEFAULT_CATEGORY_IMAGE = CATEGORY_IMAGES["Autre"];

// ✅ Images de fond du hero — défilent en arrière-plan derrière le texte.
const HERO_BG_SLIDES = [
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1600&h=1000&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&h=1000&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1544441893-675973e31985?w=1600&h=1000&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1600&h=1000&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1635360381874-edd74cbd57f3?w=1600&h=1000&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&h=1000&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1600&h=1000&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&h=1000&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1600&h=1000&fit=crop&auto=format",
];

// ✅ Photo de la section CTA finale — créatif africain au travail
// (Amos Kamau, Unsplash, licence libre, usage commercial autorisé).
const CTA_BG_IMAGE =
  "https://images.unsplash.com/photo-1563132337-f159f484226c?w=900&h=1100&fit=crop&auto=format";

// ✅ Profils ENTIÈREMENT fictifs — voir justification dans les commits
// précédents. Photos Unsplash, licence libre.
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
  {
    icon: Compass,
    title: "Recherchez un talent",
    desc: "Utilisez notre moteur de recherche pour trouver un talent par compétence, ville ou budget.",
  },
  {
    icon: FileCheck2,
    title: "Consultez le portfolio",
    desc: "Parcourez les travaux réalisés, lisez les avis et comparez les profils.",
  },
  {
    icon: MessageCircle,
    title: "Contactez directement",
    desc: "Envoyez une demande de prestation via notre messagerie intégrée sécurisée.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);

  const [categories, setCategories] = useState(null);
  const [talents, setTalents] = useState(null);
  const [stats, setStats] = useState(null);

  const [currentSlide, setCurrentSlide] = useState(0);

  // ✅ FIX : dépendances vides -> un seul setInterval créé au montage
  // (avant : `[currentSlide]` recréait l'intervalle toutes les 5s).
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_BG_SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

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
        const arr = Array.isArray(list) ? list : [];
        // ✅ On affiche les 3 DERNIERS talents inscrits (pas les mieux
        // notés). On trie côté front par date de création si dispo,
        // sinon par id décroissant, pour garantir l'ordre même si
        // l'API renvoie autre chose.
        const sorted = [...arr].sort((a, b) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at) - new Date(a.created_at);
          }
          return (b.id ?? 0) - (a.id ?? 0);
        });
        setTalents(sorted.slice(0, 3));
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

  // ✅ FIX : réagit aussi si le hash change sans rechargement complet
  // (avant : seulement vérifié au montage, ignorait les clics internes).
  useEffect(() => {
    const scrollToHash = () => {
      if (window.location.hash === "#comment-ca-marche") {
        setTimeout(() => {
          document.getElementById("comment-ca-marche")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
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

  // ✅ Toutes les catégories (jusqu'à 8) passent maintenant en grandes
  // cartes photo, de MÊME taille — plus de distinction bento/compact.
  const categoryCards = categories ? categories.slice(0, 8) : [];

  return (
    <div className="home">
      {/* HERO — photo en fond, défilement auto, texte en clair sur voile
          sombre pour une lisibilité fiable peu importe l'image. */}
      <section className="hero-section hero-section-photo">
        <div className="hero-bg-slides">
          {HERO_BG_SLIDES.map((src, i) => (
            <div
              key={i}
              className={`hero-bg-slide ${i === currentSlide ? "hero-bg-slide-active" : ""}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
          <div className="hero-bg-overlay" />
        </div>

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

          {/* ✅ FIX : champ réellement saisissable (avant : readOnly sans
              onChange, donc `search` restait toujours vide). La saisie
              met à jour le state, le submit redirige avec le paramètre
              `q`. Un clic sans taper redirige directement vers /recherche. */}
          <form onSubmit={handleSearch} className="hero-search-bar">
            <div className="hero-search-field">
              <Search size={18} className="hero-search-icon" />
              <input
                type="text"
                placeholder="Rechercher un talent (photographe, DJ, couturier...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="hero-search-btn">
              Rechercher <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <div className="hero-bg-dots">
          {HERO_BG_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`hero-bg-dot ${i === currentSlide ? "hero-bg-dot-active" : ""}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Voir l'image ${i + 1}`}
              aria-current={i === currentSlide ? "true" : undefined}
            />
          ))}
        </div>
      </section>

      {/* STATS */}
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

      {/* CATEGORIES — 8 grandes cartes photo, toutes de même taille. */}
      <section className="section">
        <div className="section-center">
          <span className="section-eyebrow">Ce que vous cherchez</span>
          <h2 className="section-title">Explorez par catégorie</h2>
          <p className="section-subtitle">Toutes les compétences créatives du Togo</p>
        </div>

        {categories === null ? (
          <div className="categories-photo-grid">
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
            <div className="categories-photo-grid">
              {categoryCards.map(({ label, count }) => (
                <button
                  key={label}
                  onClick={() => navigate(`/recherche?categorie=${encodeURIComponent(label)}`)}
                  className="photo-category-card"
                  style={{ backgroundImage: `url(${CATEGORY_IMAGES[label] || DEFAULT_CATEGORY_IMAGE})` }}
                >
                  <div className="photo-category-overlay" />
                  <div className="photo-category-content">
                    <h3 className="photo-category-label">{label}</h3>
                    <p className="photo-category-count">{count} talents <ArrowRight size={14} /></p>
                  </div>
                </button>
              ))}
            </div>

            <div className="categories-cta-wrap">
              <button onClick={() => navigate("/recherche")} className="section-link">
                Voir toutes les catégories <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </section>

      {/* DERNIERS TALENTS INSCRITS */}
      <section className="featured-section">
        <div className="featured-inner">
          <div className="section-header-row">
            <div>
              <span className="section-eyebrow">Nouveaux talents</span>
              <h2 className="section-title-left">Derniers talents inscrits</h2>
              <p className="section-subtitle-left">Les 3 derniers profils à avoir rejoint TalentTogo</p>
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
                {talents.map((t) => (
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

      {/* HOW IT WORKS — layout asymétrique : photo à gauche, étapes
          numérotées avec ligne de connexion à droite. Photo Iwaria Inc.
          (collectif de photographes nigérians sur Unsplash), licence
          libre — cohérent avec l'identité africaine de la plateforme. */}
      <section id="comment-ca-marche" className="how-it-works-section">
        <div className="how-it-works-inner">
          <div className="how-it-works-visual">
            <img
              src="https://images.unsplash.com/photo-1655720357872-ce227e4164ba?w=900&h=1100&fit=crop&auto=format"
              alt="Client togolais parcourant des profils de talents sur TalentTogo"
              className="how-it-works-image"
              loading="lazy"
            />
          </div>

          <div className="how-it-works-content">
            <span className="section-eyebrow">Simple, rapide, sécurisé</span>
            <h2 className="section-title-left">Comment ça marche ?</h2>

            <div className="how-it-works-steps">
              {steps.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="how-it-works-step">
                  <div className="how-it-works-step-marker">
                    <Icon size={18} />
                    {i < steps.length - 1 && <span className="how-it-works-connector" />}
                  </div>
                  <div>
                    <h3 className="step-title">{title}</h3>
                    <p className="step-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES CLIENTS — 100% statiques et fictifs. */}
      <section className="section testimonials-section">
        <div className="section-center">
          <span className="section-eyebrow">Témoignages</span>
          <h2 className="section-title">Ce que disent nos clients</h2>
          <p className="section-subtitle">Des milliers d'utilisateurs satisfaits à travers le Togo</p>
        </div>

        <div className="testimonials-grid">
          {STATIC_TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <Quote size={20} className="testimonial-quote-icon" />
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
                <img src={t.avatar} alt={t.nom} className="testimonial-avatar" loading="lazy" />
                <div>
                  <p className="testimonial-name">{t.nom}</p>
                  <p className="testimonial-city">{t.ville}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL — même système que "Comment ça marche" (image encadrée
          + contenu côte à côte), mais inversé (image à droite) et sur un
          fond de marque plein plutôt qu'une photo en arrière-plan de toute
          la section — évite que le visage se retrouve derrière le texte. */}
      <section className="cta-split-section">
        <div className="cta-split-inner">
          <div className="cta-split-content">
            <div className="cta-v2-icon">
              <Sparkles size={22} />
            </div>
            <h2 className="cta-split-title">Vous êtes un talent ? Rejoignez-nous !</h2>
            <p className="cta-split-text">
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

          <div className="cta-split-visual">
            <img
              src={CTA_BG_IMAGE}
              alt="Entrepreneure togolaise, exemple de talent inscrit sur TalentTogo"
              className="cta-split-image"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}