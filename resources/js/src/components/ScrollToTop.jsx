import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ✅ À chaque changement de route :
 * - S'il y a une ancre dans l'URL (ex: /#comment-ca-marche), on scroll
 *   en douceur jusqu'à l'élément correspondant (avec un léger délai pour
 *   laisser la page se rendre avant de chercher l'élément).
 * - Sinon, on remonte instantanément en haut de la page — comportement
 *   attendu par défaut à chaque navigation entre les pages.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const timeout = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timeout);
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}