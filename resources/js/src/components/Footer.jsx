import { Link, useNavigate } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import "../assets/styles/Footer.css";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-top-bar" />
      <div className="footer-inner">
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              <div className="footer-brand-icon">
                <span>T</span>
              </div>
              <span className="footer-brand-text">
                Talent<span className="footer-brand-accent">Togo</span>
              </span>
            </div>
            <p className="footer-desc">
              La première plateforme de mise en relation entre talents créatifs locaux et clients au Togo.
            </p>
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="footer-col-title">Plateforme</h4>
            <ul className="footer-list">
              <li><Link to="/" className="footer-link">Accueil</Link></li>
              <li><Link to="/recherche" className="footer-link">Trouver un talent</Link></li>
              <li><Link to="/register" className="footer-link">Créer un profil</Link></li>
              <li><button onClick={() => navigate("/")} className="footer-link footer-link-btn">Comment ça marche</button></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="footer-col-title">Légal</h4>
            <ul className="footer-list">
              <li><Link to="/cgu" className="footer-link">Conditions d'utilisation</Link></li>
              <li><Link to="/confidentialite" className="footer-link">Politique de confidentialité</Link></li>
              <li><Link to="/mentions-legales" className="footer-link">Mentions légales</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-col-title">Contact</h4>
            <ul className="footer-list">
              <li className="footer-contact-item">
                <MapPin size={14} className="footer-contact-icon" />
                <span>Lomé, Togo</span>
              </li>
              <li className="footer-contact-item">
                <Mail size={14} className="footer-contact-icon" />
                <span>contact@talenttogo.tg</span>
              </li>
              <li className="footer-contact-item">
                <Phone size={14} className="footer-contact-icon" />
                <span>+228 96 45 87 23</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2026 TalentTogo — Tous droits réservés
          </p>
          <p className="footer-signature">
             ESGIS 2025–2026
          </p>
        </div>
      </div>
    </footer>
  );
}