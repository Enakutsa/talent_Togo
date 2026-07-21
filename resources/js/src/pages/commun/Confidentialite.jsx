import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Shield, ChevronRight, Lock, Eye, Trash2, Bell } from "lucide-react";
import "../../assets/styles/Confidentialite.css";

const highlights = [
  { icon: Lock, title: "Données chiffrées", desc: "Toutes vos données sont chiffrées en transit et au repos." },
  { icon: Eye, title: "Transparence totale", desc: "Nous vous disons exactement quelles données nous collectons." },
  { icon: Trash2, title: "Droit à l'effacement", desc: "Supprimez votre compte et vos données à tout moment." },
  { icon: Bell, title: "Notifications maîtrisées", desc: "Gérez vos préférences de communication depuis votre profil." },
];

const sections = [
  {
    title: "1. Données collectées",
    content: "TalentTogo collecte les données suivantes : (a) Données d'identification : nom, prénom, adresse e-mail, téléphone fournis lors de l'inscription. (b) Données de profil : catégorie de service, ville, biographie, tarifs, disponibilité — pour les talents. (c) Données de portfolio : photos et vidéos uploadées par les talents. (d) Données de navigation : adresse IP, type de navigateur, pages visitées — à des fins statistiques anonymisées. (e) Données d'interaction : messages échangés, demandes de prestation, avis laissés.",
  },
  {
    title: "2. Utilisation des données",
    content: "Vos données sont utilisées pour : faire fonctionner la plateforme et ses fonctionnalités de mise en relation ; personnaliser votre expérience et améliorer nos services ; vous envoyer des notifications pertinentes liées à votre activité sur la plateforme ; assurer la sécurité et prévenir les fraudes ; respecter nos obligations légales. Nous n'utilisons pas vos données à des fins publicitaires commerciales sans votre consentement.",
  },
  {
    title: "3. Partage des données",
    content: "TalentTogo ne vend jamais vos données personnelles à des tiers. Vos données peuvent être partagées avec : d'autres utilisateurs de la plateforme dans le cadre normal de la mise en relation (profil public, portfolio) ; nos prestataires techniques qui nous aident à opérer la plateforme (hébergement, stockage de médias) ; les autorités compétentes si la loi l'exige.",
  },
  {
    title: "4. Conservation des données",
    content: "Vos données sont conservées pour la durée de votre inscription sur TalentTogo, augmentée d'une période raisonnable après la suppression de votre compte à des fins légales. Les fichiers multimédias (portfolio, photos) sont supprimés de nos serveurs dans les 30 jours suivant la suppression de votre compte.",
  },
  {
    title: "5. Vos droits",
    content: "Vous disposez des droits suivants : droit d'accès à vos données personnelles ; droit de rectification des données inexactes ; droit à l'effacement (droit à l'oubli) ; droit à la portabilité de vos données ; droit d'opposition au traitement de vos données. Pour exercer ces droits, contactez-nous à contact@talenttogo.tg.",
  },
  {
    title: "6. Cookies",
    content: "TalentTogo utilise des cookies strictement nécessaires au fonctionnement de la plateforme (authentification, préférences). Aucun cookie publicitaire ou de tracking tiers n'est utilisé sans votre consentement explicite. Vous pouvez gérer vos préférences via les paramètres de votre navigateur.",
  },
];

export default function PolitiqueConfidentialite() {
  const navigate = useNavigate();

  return (
    <div className="conf-page">
      <Navbar />

      <div className="conf-hero">
        <div className="conf-hero-inner">
          <div className="conf-breadcrumb">
            <button onClick={() => navigate("/")} className="conf-breadcrumb-link">Accueil</button>
            <ChevronRight size={14} />
            <span className="conf-breadcrumb-current">Politique de confidentialité</span>
          </div>
          <div className="conf-hero-title-row">
            <div className="conf-hero-icon">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="conf-hero-title">Politique de confidentialité</h1>
              <p className="conf-hero-date">Dernière mise à jour : Juillet 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="conf-body">
        <div className="conf-highlights">
          {highlights.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="conf-highlight-card">
              <div className="conf-highlight-icon">
                <Icon size={18} />
              </div>
              <h3 className="conf-highlight-title">{title}</h3>
              <p className="conf-highlight-desc">{desc}</p>
            </div>
          ))}
        </div>

        <div className="conf-sections">
          {sections.map((s) => (
            <div key={s.title} className="conf-section-card">
              <h2 className="conf-section-title">{s.title}</h2>
              <p className="conf-section-content">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="conf-footer-block">
          <p className="conf-footer-text">
            Questions relatives à vos données ?{" "}
            <a href="mailto:contact@talenttogo.tg" className="conf-footer-link">
              contact@talenttogo.tg
            </a>
          </p>
          <button onClick={() => navigate("/")} className="conf-home-btn">
            Retour à l'accueil
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}