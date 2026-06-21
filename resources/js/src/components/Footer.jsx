import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import "../assets/styles/Home.css";

// Les icônes de marques (Facebook, Twitter, Instagram) ont été retirées
// de lucide-react v1+, on utilise donc de petits SVG inline à la place.
function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" {...props}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

export default function Footer() {
  const platformLinks = [
    { label: "Accueil", to: "/" },
    { label: "Trouver un talent", to: "/recherche" },
    { label: "Créer un profil", to: "/inscription" },
    { label: "Comment ça marche", to: "/" },
  ];

  const legalLinks = [
    { label: "Conditions d'utilisation", to: "/cgu" },
    { label: "Politique de confidentialité", to: "/confidentialite" },
    { label: "Mentions légales", to: "/cgu" },
  ];

  const socials = [InstagramIcon, TwitterIcon, FacebookIcon];

  return (
    <footer className="footer2">
      <div className="footer2-inner">
        <div className="footer2-grid">
          {/* Brand */}
          <div>
            <div className="footer2-brand">
              <div className="footer2-brand-icon">
                <span>T</span>
              </div>
              <span className="footer2-brand-text">
                Talent<span className="footer2-brand-accent">Togo</span>
              </span>
            </div>
            <p className="footer2-desc">
              La première plateforme de mise en relation entre talents créatifs locaux et clients
              au Togo.
            </p>
            <div className="footer2-socials">
              {socials.map((Icon, i) => (
                <a key={i} href="#" className="footer2-social-link" aria-label="Réseau social">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="footer2-col-title">Plateforme</h4>
            <ul className="footer2-list">
              {platformLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="footer2-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="footer2-col-title">Légal</h4>
            <ul className="footer2-list">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="footer2-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer2-col-title">Contact</h4>
            <ul className="footer2-list">
              <li className="footer2-contact-item">
                <MapPin size={14} className="footer2-contact-icon" />
                <span>Lomé, Togo</span>
              </li>
              <li className="footer2-contact-item">
                <Mail size={14} className="footer2-contact-icon" />
                <span>contact@talenttogo.tg</span>
              </li>
              <li className="footer2-contact-item">
                <Phone size={14} className="footer2-contact-icon" />
                <span>+228 90 00 00 00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer2-bottom">
          <p className="footer2-copyright">© 2026 TalentTogo — Tous droits réservés</p>
          <p className="footer2-credit">Fait avec ❤️ au Togo · ESGIS 2025–2026</p>
        </div>
      </div>
    </footer>
  );
}