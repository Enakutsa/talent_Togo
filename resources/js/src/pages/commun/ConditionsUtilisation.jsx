import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { FileText, ChevronRight } from "lucide-react";
import "../../assets/styles/ConditionsUtilisation.css";

const sections = [
  {
    title: "1. Acceptation des conditions",
    content: "En accédant à la plateforme TalentTogo et en utilisant nos services, vous acceptez d'être lié par les présentes Conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services. Ces conditions s'appliquent à tous les utilisateurs de la plateforme, qu'ils soient talents, clients ou simples visiteurs.",
  },
  {
    title: "2. Description du service",
    content: "TalentTogo est une plateforme web de mise en relation entre talents créatifs locaux (photographes, graphistes, couturiers, musiciens, vidéastes, artisans, maquilleurs, danseurs) et clients (particuliers, entreprises, organisateurs d'événements) au Togo. La plateforme permet la création de profils professionnels, la consultation de portfolios, l'envoi de demandes de prestation et l'évaluation des services.",
  },
  {
    title: "3. Inscription et comptes",
    content: "Pour accéder aux fonctionnalités complètes de TalentTogo, vous devez créer un compte en fournissant des informations exactes et complètes. Vous êtes responsable de la confidentialité de votre compte et de toutes les activités qui s'y déroulent. L'authentification se fait par code OTP envoyé par e-mail. Vous devez immédiatement nous notifier de toute utilisation non autorisée de votre compte.",
  },
  {
    title: "4. Obligations des talents",
    content: "Les talents s'engagent à : fournir des informations exactes sur leurs compétences et expériences ; uploader uniquement des réalisations dont ils sont les auteurs ; respecter les délais et engagements pris envers les clients ; maintenir leur profil à jour ; ne pas publier de contenus illégaux, offensants ou trompeurs. Tout profil soumis est soumis à la validation de l'administrateur avant publication.",
  },
  {
    title: "5. Obligations des clients",
    content: "Les clients s'engagent à : utiliser la plateforme de bonne foi ; ne pas contacter les talents en dehors de la plateforme pour contourner les mécanismes de mise en relation ; laisser des avis sincères et objectifs basés sur leur expérience réelle ; respecter les tarifs et conditions convenus avec les talents.",
  },
  {
    title: "6. Propriété intellectuelle",
    content: "Les contenus publiés sur TalentTogo (photos, vidéos, textes) restent la propriété de leurs auteurs. En publiant du contenu sur la plateforme, vous accordez à TalentTogo une licence non exclusive pour afficher ce contenu dans le cadre du service. Toute reproduction ou utilisation non autorisée des contenus de la plateforme est strictement interdite.",
  },
  {
    title: "7. Responsabilité",
    content: "TalentTogo agit en tant qu'intermédiaire et ne peut être tenu responsable des prestations réalisées entre talents et clients. La qualité et l'exécution des prestations relèvent de la responsabilité exclusive des parties concernées. TalentTogo s'engage à mettre en place les outils nécessaires pour faciliter la mise en relation et la résolution des litiges.",
  },
  {
    title: "8. Modifications",
    content: "TalentTogo se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront notifiés de tout changement important. La poursuite de l'utilisation de la plateforme après notification vaut acceptation des nouvelles conditions.",
  },
];

export default function ConditionsUtilisation() {
  const navigate = useNavigate();

  return (
    <div className="cgu-page">
      <Navbar />

      <div className="cgu-hero">
        <div className="cgu-hero-inner">
          <div className="cgu-breadcrumb">
            <button onClick={() => navigate("/")} className="cgu-breadcrumb-link">Accueil</button>
            <ChevronRight size={14} />
            <span className="cgu-breadcrumb-current">Conditions d'utilisation</span>
          </div>
          <div className="cgu-hero-title-row">
            <div className="cgu-hero-icon">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="cgu-hero-title">Conditions d'utilisation</h1>
              <p className="cgu-hero-date">Dernière mise à jour : Juillet 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cgu-body">
        <div className="cgu-notice">
          <p>
            <strong>Important :</strong> Veuillez lire attentivement ces conditions avant d'utiliser TalentTogo.
            En créant un compte, vous confirmez avoir lu et accepté l'intégralité des présentes conditions.
          </p>
        </div>

        <div className="cgu-sections">
          {sections.map((s) => (
            <div key={s.title} className="cgu-section-card">
              <h2 className="cgu-section-title">{s.title}</h2>
              <p className="cgu-section-content">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="cgu-footer-block">
          <p className="cgu-footer-text">
            Des questions sur nos conditions ? Contactez-nous à{" "}
            <a href="mailto:contact@talenttogo.tg" className="cgu-footer-link">
              enakutsakokouespoir@gmail.com
            </a>
          </p>
          <button onClick={() => navigate("/")} className="cgu-home-btn">
            Retour à l'accueil
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}