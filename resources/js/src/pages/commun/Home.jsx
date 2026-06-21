import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TalentCard from "../../components/talent/TalentCard";
import {
  Search, Camera, Palette, Scissors, Music2, Film, Package2, Brush, Star,
  ArrowRight, Users, CheckCircle, TrendingUp, ChevronRight
} from "lucide-react";
import "../../assets/styles/Home.css";

const categories = [
  { icon: Camera, label: "Photographe", count: 48, grad: "grad-rose" },
  { icon: Palette, label: "Graphiste", count: 32, grad: "grad-blue" },
  { icon: Scissors, label: "Couturier", count: 61, grad: "grad-amber" },
  { icon: Music2, label: "Musicien", count: 27, grad: "grad-emerald" },
  { icon: Film, label: "Vidéaste", count: 19, grad: "grad-violet" },
  { icon: Package2, label: "Artisan", count: 54, grad: "grad-lime" },
  { icon: Brush, label: "Maquilleur", count: 38, grad: "grad-fuchsia" },
  { icon: Star, label: "Danseur", count: 15, grad: "grad-cyan" },
];

// TODO: remplacer par un appel API Laravel (GET /api/talents?featured=1)
const featuredTalents = [
  { id: 1, nom: "Koffi Mensah", categorie: "Photographe", ville: "Lomé", note: 4.9, avis: 124, tarif: 50000, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", portfolio: "https://images.unsplash.com/photo-1472148083604-64f1084980b9?w=400&h=300&fit=crop", disponible: true },
  { id: 2, nom: "Akosua Doe", categorie: "Graphiste", ville: "Lomé", note: 4.7, avis: 89, tarif: 30000, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", portfolio: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop", disponible: true },
  { id: 3, nom: "Yao Agbenyenu", categorie: "Couturier", ville: "Kara", note: 4.8, avis: 67, tarif: 45000, avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop", portfolio: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", disponible: false },
  { id: 4, nom: "Ama Tekpor", categorie: "Vidéaste", ville: "Lomé", note: 4.8, avis: 43, tarif: 80000, avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop", portfolio: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", disponible: true },
];

const steps = [
  { num: "01", title: "Recherchez", desc: "Filtrez par catégorie, ville, disponibilité et budget pour trouver le talent idéal.", icon: Search },
  { num: "02", title: "Consultez", desc: "Parcourez les portfolios, lisez les avis vérifiés et comparez les profils.", icon: Star },
  { num: "03", title: "Contactez", desc: "Envoyez une demande directement via la messagerie intégrée sécurisée.", icon: CheckCircle },
];

const testimonials = [
  { nom: "Kofi Asamoah", role: "Organisateur d'événements", text: "J'ai trouvé un photographe professionnel en 10 minutes. Service exceptionnel !", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop", note: 5 },
  { nom: "Abla Kumi", role: "Propriétaire de boutique", text: "TalentTogo m'a permis d'atteindre des clients que je n'aurais jamais pu contacter autrement.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop", note: 5 },
  { nom: "Mawuli Tetteh", role: "Chef d'entreprise", text: "La qualité des talents sur cette plateforme est remarquable. Je recommande vivement.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop", note: 5 },
];

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero-section hero-gradient hero-pattern">
        <div className="hero-inner">
          <div className="hero-badge">
            <TrendingUp size={13} color="#fcd34d" />
            <span className="hero-badge-text">+500 talents actifs au Togo</span>
          </div>

          <h1 className="hero-title">
            Connectez-vous aux
            <br />
            <span className="shimmer-text">meilleurs talents</span>
            <br />
            du Togo
          </h1>

          <p className="hero-subtitle">
            Photographes, graphistes, couturiers, musiciens — trouvez le prestataire créatif
            idéal pour votre projet en quelques clics.
          </p>

          <div className="hero-search-wrap">
            <div className="hero-search-bar">
              <div className="hero-search-field">
                <Search size={20} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Photographe, graphiste, couturier..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button onClick={() => navigate("/recherche")} className="hero-search-btn">
                Rechercher <ArrowRight size={16} />
              </button>
            </div>
            <p className="hero-suggestions">
              Suggestions : Photographe à Lomé · Graphiste · Couturier à Kara
            </p>
          </div>

          <div className="hero-stats">
            {[
              { val: "500+", label: "Talents actifs" },
              { val: "1 200+", label: "Clients satisfaits" },
              { val: "8+", label: "Catégories" },
            ].map((s) => (
              <div key={s.label}>
                <div className="hero-stat-value">{s.val}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" fill="none">
            <path d="M0 80L1440 80L1440 40C1200 80 800 0 600 20C400 40 200 80 0 40Z" fill="#F5F3FF" />
          </svg>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="section-center">
          <h2 className="section-title">Explorez par catégorie</h2>
          <p className="section-subtitle">
            Des centaines de talents togolais dans tous les domaines créatifs.
          </p>
        </div>

        <div className="categories-grid">
          {categories.map(({ icon: Icon, label, count, grad }) => (
            <button key={label} onClick={() => navigate("/recherche")} className="category-card">
              <div className={`category-icon-wrap ${grad}`}>
                <Icon size={22} color="#fff" />
              </div>
              <h3 className="category-label">{label}</h3>
              <p className="category-count">{count} talents</p>
            </button>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="steps-section">
        <div className="steps-inner">
          <div className="section-center">
            <h2 className="section-title">Comment ça marche ?</h2>
            <p className="section-subtitle">Trouvez le talent idéal en 3 étapes simples.</p>
          </div>

          <div className="steps-grid">
            {steps.map(({ num, title, desc, icon: Icon }) => (
              <div key={num} className="step-item">
                <div className="step-icon-wrap">
                  <Icon size={26} color="#f59e0b" />
                </div>
                <div className="step-num">{num}</div>
                <h3 className="step-title">{title}</h3>
                <p className="step-desc">{desc}</p>
              </div>
            ))}
          </div>

          <div className="steps-cta-wrap">
            <button onClick={() => navigate("/recherche")} className="btn-amber">
              Trouver un talent maintenant <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED TALENTS */}
      <section className="section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Talents en vedette</h2>
            <p className="section-subtitle" style={{ margin: 0, textAlign: "left" }}>
              Les mieux notés de la semaine
            </p>
          </div>
          <button onClick={() => navigate("/recherche")} className="section-link">
            Voir tous <ChevronRight size={16} />
          </button>
        </div>

        <div className="talents-grid">
          {featuredTalents.map((t) => (
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
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="testimonials-inner">
          <div className="section-center">
            <h2 className="section-title">Ce qu&apos;ils disent de nous</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.nom} className="testimonial-card">
                <div className="testimonial-stars">
                  {Array.from({ length: t.note }).map((_, i) => (
                    <Star key={i} size={14} color="#f59e0b" fill="#f59e0b" />
                  ))}
                </div>
                <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
                <div className="testimonial-author">
                  <img src={t.avatar} alt={t.nom} className="testimonial-avatar" />
                  <div>
                    <div className="testimonial-name">{t.nom}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section hero-gradient">
        <div className="cta-inner">
          <h2 className="cta-title">Vous êtes un talent togolais ?</h2>
          <p className="cta-text">
            Créez votre profil professionnel gratuitement et commencez à recevoir des demandes dès aujourd&apos;hui.
          </p>
          <div className="cta-actions">
            <button onClick={() => navigate("/inscription")} className="btn-amber-lg">
              <Users size={18} />
              Créer mon profil talent
            </button>
            <button onClick={() => navigate("/recherche")} className="btn-outline-white">
              Chercher un talent
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}