import { Link } from "react-router-dom";
import "../assets/styles/Footer.css";

const footerColumns = [
  { title: "Plateforme", links: ["Talents", "Catégories", "Comment ça marche", "Tarifs"] },
  { title: "Entreprise", links: ["À propos", "Blog", "Presse", "Carrières"] },
  { title: "Support", links: ["Centre d'aide", "Contact", "CGU", "Confidentialité"] },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top-bar" />
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="footer-brand">
              <div className="footer-brand-icon">
                <span>T</span>
              </div>
              <span className="footer-brand-text">TalentTogo</span>
            </div>
            <p className="footer-desc">
              La plateforme de référence pour les talents créatifs du Togo.
            </p>
          </div>

          {footerColumns.map(({ title, links }) => (
            <div key={title}>
              <h4 className="footer-col-title">{title}</h4>
              <ul className="footer-list">
                {links.map((l) => (
                  <li key={l}>
                    <Link to="#" className="footer-link">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2025 TalentTogo — Tous droits réservés. Fait avec ❤️ au Togo.
          </p>
        </div>
      </div>
    </footer>
  );
}