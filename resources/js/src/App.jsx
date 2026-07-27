import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import RedirectIfTalent from "./components/RedirectIfTalent";
import ScrollToTop from "./components/ScrollToTop";

// ── Pages chargées en lazy loading : chaque page n'est téléchargée
// que lorsque l'utilisateur navigue réellement vers elle, au lieu
// d'être toutes incluses dans le bundle initial. Ça réduit fortement
// le poids du premier chargement (ex: un visiteur sur /login ne
// télécharge plus le code du dashboard, de la messagerie, etc.) ──
const Home = lazy(() => import("./pages/commun/Home"));
const Inscription = lazy(() => import("./pages/auth/Inscription"));
const NotFound = lazy(() => import("./pages/commun/NotFound"));
const Login = lazy(() => import("./pages/auth/Login"));
const VerifyOtp = lazy(() => import("./pages/auth/VerifyOtp"));
const ProfilCreer = lazy(() => import("./pages/talent/ProfilCreer"));
const TalentDashboard = lazy(() => import("./pages/talent/TalentDashboard"));
const DemandesRecues = lazy(() => import("./pages/talent/DemandesRecues"));
const AvisRecus = lazy(() => import("./pages/talent/AvisRecus"));
const Portfolio = lazy(() => import("./pages/talent/Portfolio"));
const RechercheTalents = lazy(() => import("./pages/client/RechercheTalents"));
const DetailTalent = lazy(() => import("./pages/client/DetailTalent"));
const ClientDashboard = lazy(() => import("./pages/client/ClientDashboard"));
const Favoris = lazy(() => import("./pages/client/Favoris"));
const Messages = lazy(() => import("./pages/client/Messages"));
const DemandesEnvoyees = lazy(() => import("./pages/client/DemandesEnvoyees"));
const ClientProfil = lazy(() => import("./pages/client/ClientProfil"));
const Parametres = lazy(() => import("./pages/client/Parametres"));
const MessagesTalent = lazy(() => import("./pages/talent/MessagesTalent"));
const ConditionsUtilisation = lazy(() => import("./pages/commun/ConditionsUtilisation"));
const Confidentialite = lazy(() => import("./pages/commun/Confidentialite"));
const MentionsLegales = lazy(() => import("./pages/commun/MentionsLegales"));

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

// Petit loader affiché pendant le téléchargement d'une page.
// Volontairement minimaliste (pas de dépendance CSS externe).
function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <div className="auth-spinner" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Pages publiques : inaccessibles à un talent déjà connecté ── */}
          <Route path="/" element={<RedirectIfTalent><PublicLayout><Home /></PublicLayout></RedirectIfTalent>} />
          <Route path="/register" element={<RedirectIfTalent><PublicLayout><Inscription /></PublicLayout></RedirectIfTalent>} />

          {/* ── /login : PAS de RedirectIfTalent ici. ⚠️ Login.jsx gère
               LES DEUX étapes (email + OTP) sur cette même route. Dès que
               l'OTP est validé, login() met à jour AuthContext.user AVANT
               que notre navigate("/" + redirect) ne s'exécute -> ça
               re-render RedirectIfTalent, qui redirige alors TOUJOURS vers
               talent/dashboard (il ne connaît pas estComplet), écrasant la
               bonne redirection vers talent/profil/creer. Même raison que
               pour /verify-otp ci-dessous. ── */}
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />

          {/* ── Page transitoire : PAS de RedirectIfTalent ici non plus,
               pour la même raison. ── */}
          <Route path="/verify-otp" element={<PublicLayout><VerifyOtp /></PublicLayout>} />

          {/* ── Recherche/listing des talents : page publique (pas besoin
               d'être connecté pour parcourir ; contacter/favoriser restent
               gérés à l'intérieur des composants concernés). ── */}
          <Route path="/recherche" element={<PublicLayout><RechercheTalents /></PublicLayout>} />

          <Route
            path="/talents/:id"
            element={
              <ProtectedRoute>
                <PublicLayout><DetailTalent /></PublicLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Pages légales : Navbar/Footer déjà inclus dans chaque
               composant, donc pas de PublicLayout ici (éviterait un
               doublon). Accessibles sans connexion. ── */}
          <Route path="/cgu" element={<ConditionsUtilisation />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />

          {/* ── Espace talent ── */}
          <Route path="/talent/profil/creer" element={<ProtectedRoute><ProfilCreer /></ProtectedRoute>} />
          <Route path="/talent/dashboard" element={<ProtectedRoute><TalentDashboard /></ProtectedRoute>} />
          <Route path="/talent/demandes" element={<ProtectedRoute><DemandesRecues /></ProtectedRoute>} />
          <Route path="/talent/messages" element={<ProtectedRoute><MessagesTalent /></ProtectedRoute>} />
          <Route path="/talent/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          <Route path="/talent/avis" element={<ProtectedRoute><AvisRecus /></ProtectedRoute>} />

          {/* ── Espace client ── */}
          <Route path="/client/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
          <Route path="/client/favoris" element={<ProtectedRoute><Favoris /></ProtectedRoute>} />
          <Route path="/client/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/client/demandes" element={<ProtectedRoute><DemandesEnvoyees /></ProtectedRoute>} />
          <Route path="/client/profil" element={<ProtectedRoute><ClientProfil /></ProtectedRoute>} />
          <Route path="/client/parametres" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}