import { useEffect, useRef } from "react";

/**
 * ✅ Hook générique : relance automatiquement une fonction de fetch quand
 * une action (POST/PUT/PATCH/DELETE) a réussi quelque part dans l'app
 * (voir services/api.js qui émet l'événement "app:data-changed").
 *
 * Usage simple (relance à CHAQUE action réussie, peu importe l'URL) :
 *
 *   useAutoRefresh(fetchDemandes);
 *
 * Usage filtré (ne relance que si l'URL de l'action contient "demandes",
 * utile pour éviter des refetch inutiles sur des pages avec beaucoup de
 * trafic, ex: ne pas recharger la liste de demandes juste parce qu'un
 * message a été envoyé ailleurs) :
 *
 *   useAutoRefresh(fetchDemandes, { match: "demandes" });
 *
 * @param {Function} fetchFn - fonction à rappeler (doit gérer elle-même
 *   son propre état de chargement / setState).
 * @param {Object} [options]
 * @param {string|RegExp} [options.match] - si fourni, ne déclenche le
 *   refetch que si l'URL de la requête correspond (includes() pour une
 *   string, test() pour une RegExp).
 */
export function useAutoRefresh(fetchFn, options = {}) {
  const { match } = options;

  // Toujours utiliser la dernière version de fetchFn sans re-attacher
  // l'event listener à chaque re-render du composant.
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  useEffect(() => {
    const handler = (event) => {
      const url = event?.detail?.url || "";

      if (match) {
        const matches =
          match instanceof RegExp ? match.test(url) : url.includes(match);

        if (!matches) return;
      }

      fetchFnRef.current?.();
    };

    window.addEventListener("app:data-changed", handler);
    return () => window.removeEventListener("app:data-changed", handler);
  }, [match]);
}