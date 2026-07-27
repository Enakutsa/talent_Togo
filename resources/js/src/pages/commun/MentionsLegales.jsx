import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Scale, ChevronRight } from "lucide-react";
import "../../assets/styles/MentionsLegales.css";

const sections = [
  {
    title: "1. Éditeur de la plateforme",
    content: "TalentTogo est une plateforme développée dans le cadre d'un projet académique, réalisé au sein de la Licence Professionnelle IRT (Application Development) de l'ESGIS Lomé, sous la supervision de Mme GBEDEVI Yvette, année académique 2025–2026.",
  },
  {
    title: "2. Contact",
    content: "Pour toute question relative à la plateforme, vous pouvez nous contacter à l'adresse contact@talenttogo.tg. Le siège du projet est basé à Lomé, Togo.",
  },
  {
    title: "3. Hébergement",
    content: "La plateforme TalentTogo est hébergée sur des infrastructures cloud tierces (hébergement web et base de données). Les informations détaillées relatives à l'hébergeur peuvent être communiquées sur demande auprès de l'équipe du projet.",
  },
  {
    title: "4. Propriété intellectuelle",
    content: "L'ensemble des éléments composant la plateforme TalentTogo — charte graphique, logo, textes, structure et code source — est protégé par le droit d'auteur. Toute reproduction, représentation ou exploitation, totale ou partielle, sans autorisation préalable est interdite. Les contenus publiés par les talents (photos de portfolio, biographies, réalisations) restent leur propriété exclusive.",
  },
  {
    title: "5. Responsabilité",
    content: "TalentTogo met tout en œuvre pour assurer l'exactitude des informations diffusées sur la plateforme, sans toutefois garantir l'absence totale d'erreurs ou d'omissions. La plateforme ne saurait être tenue responsable des dommages directs ou indirects résultant de l'accès ou de l'utilisation du site.",
  },
  {
    title: "6. Droit applicable",
    content: "Les présentes mentions légales sont soumises au droit togolais. Tout litige relatif à l'utilisation de la plateforme relève de la compétence des juridictions togolaises.",
  },
];

export default function MentionsLegales() {
  const navigate = useNavigate();

  return (
    <div className="ml-page">
      <Navbar />

      <div className="ml-hero">
        <div className="ml-hero-inner">
          <div className="ml-breadcrumb">
            <button onClick={() => navigate("/")} className="ml-breadcrumb-link">Accueil</button>
            <ChevronRight size={14} />
            <span className="ml-breadcrumb-current">Mentions légales</span>
          </div>
          <div className="ml-hero-title-row">
            <div className="ml-hero-icon">
              <Scale size={24} />
            </div>
            <div>
              <h1 className="ml-hero-title">Mentions légales</h1>
              <p className="ml-hero-date">Dernière mise à jour : Juillet 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="ml-body">
        <div className="ml-sections">
          {sections.map((s) => (
            <div key={s.title} className="ml-section-card">
              <h2 className="ml-section-title">{s.title}</h2>
              <p className="ml-section-content">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="ml-footer-block">
          <p className="ml-footer-text">
            Une question ? Contactez-nous à{" "}
            <a href="mailto:contact@talenttogo.tg" className="ml-footer-link">
              enakutsakokouespoir@gmail.com
            </a>
          </p>
          <button onClick={() => navigate("/")} className="ml-home-btn">
            Retour à l'accueil
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}