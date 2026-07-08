import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, FolderOpen, User, ListChecks, LogOut, Camera, Check, Save } from "lucide-react";
import { getProfilTalent, updateProfilTalent } from "../../services/profilTalent.service";
import { getCategories } from "../../services/categorie.service";
import "../../assets/styles/talent.css";

const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, to: "/talent/dashboard" },
  { label: "Mon portfolio", icon: FolderOpen, to: "/talent/portfolio" },
  { label: "Mon profil", icon: User, to: "/talent/profil" },
  { label: "Demandes reçues", icon: ListChecks, to: "/talent/demandes" },
];

// Même liste que le formulaire d'inscription et UtilisateurForm.php (Filament)
const VILLES_TOGO = [
  "Lomé", "Aného", "Tsévié", "Vogan", "Tabligbo", "Notsé", "Kpalimé",
  "Atakpamé", "Amlamé", "Badou", "Sotouboua", "Sokodé", "Bassar",
  "Kara", "Niamtougou", "Kandé", "Mango", "Dapaong",
];

export default function Profil() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  const [nomComplet, setNomComplet] = useState(""); // lecture seule
  const [photoUrl, setPhotoUrl] = useState(null); // photo actuelle (serveur)
  const [photoFile, setPhotoFile] = useState(null); // nouveau fichier choisi
  const [photoPreview, setPhotoPreview] = useState(null); // aperçu local

  const [form, setForm] = useState({
    categorie_id: "",
    ville: "",
    biographie: "",
    tarif_min: "",
    tarif_max: "",
    disponibilite: false,
  });

  // Charge le profil + les catégories au montage
  useEffect(() => {
    Promise.all([getProfilTalent(), getCategories()])
      .then(([profilRes, catRes]) => {
        const p = profilRes.data;
        setNomComplet(`${p.prenom ?? ""} ${p.nom ?? ""}`.trim());
        setPhotoUrl(p.photo);
        setForm({
          categorie_id: p.categorie_id ?? "",
          ville: p.ville ?? "",
          biographie: p.biographie ?? "",
          tarif_min: p.tarif_min ?? "",
          tarif_max: p.tarif_max ?? "",
          disponibilite: !!p.disponibilite,
        });
        setCategories(catRes.data || []);
      })
      .catch(() => setError("Impossible de charger le profil."))
      .finally(() => setLoading(false));
  }, []);

  // Libère l'URL locale de prévisualisation si le composant est démonté
  // ou si une nouvelle photo est choisie, pour éviter une fuite mémoire.
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);

    const payload = new FormData();
    payload.append("categorie_id", form.categorie_id);
    payload.append("ville", form.ville);
    payload.append("biographie", form.biographie);
    payload.append("tarif_min", form.tarif_min);
    payload.append("tarif_max", form.tarif_max);
    payload.append("disponibilite", form.disponibilite ? "1" : "0");
    if (photoFile) {
      payload.append("photo", photoFile);
    }

    try {
      const res = await updateProfilTalent(payload);

      setPhotoUrl(res.data.photo);
      setPhotoFile(null);
      setPhotoPreview(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);

      // Premier profil complété -> direction le tableau de bord
      if (res.data.estComplet) {
        setTimeout(() => navigate("/talent/dashboard"), 1200);
      }
    } catch (err) {
      if (err.response?.status === 422) {
        const firstError = Object.values(err.response.data.errors || {})[0]?.[0];
        setError(firstError || "Certains champs sont invalides.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Chargement du profil...</p>
      </div>
    );
  }

  const displayPhoto = photoPreview || photoUrl;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="dashboard-sidebar">
        <div className="p-6 pb-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
              <span className="text-violet-900 font-bold text-sm" style={{ fontFamily: "Sora, sans-serif" }}>T</span>
            </div>
            <span className="text-white font-bold" style={{ fontFamily: "Sora, sans-serif" }}>Talent<span className="text-amber-400">Togo</span></span>
          </Link>
        </div>
        <nav className="space-y-0.5">
          {navItems.map(({ label, icon: Icon, to }) => (
            <Link key={to} to={to} className={`sidebar-link w-full text-left ${to === "/talent/profil" ? "active" : ""}`}>
              <Icon size={18} />{label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4 pt-10">
          <button className="sidebar-link w-full text-left text-red-300"><LogOut size={18} /> Déconnexion</button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Sora, sans-serif" }}>Mon Profil</h1>
            <p className="text-gray-500 text-xs mt-0.5">Modifiez vos informations professionnelles</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-60 ${saved ? "bg-emerald-500 text-white" : "bg-gradient-to-r from-violet-600 to-purple-700 text-white"}`}
          >
            {saved ? <><Check size={16} /> Enregistré !</> : <><Save size={16} /> {saving ? "Enregistrement..." : "Enregistrer"}</>}
          </button>
        </div>

        <div className="p-8 max-w-3xl space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Avatar */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-5" style={{ fontFamily: "Sora, sans-serif" }}>Photo de profil</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {displayPhoto ? (
                  <img src={displayPhoto} alt={nomComplet} className="w-20 h-20 rounded-2xl object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <User size={28} />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shadow-md hover:bg-violet-700"
                >
                  <Camera size={14} className="text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm" style={{ fontFamily: "Sora, sans-serif" }}>Changer la photo</p>
                <p className="text-gray-500 text-xs mt-1">JPG ou PNG · 5 Mo max · Ratio 1:1 recommandé</p>
                <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs text-violet-600 font-medium hover:underline">
                  Parcourir les fichiers
                </button>
              </div>
            </div>
          </div>

          {/* Infos générales */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-5" style={{ fontFamily: "Sora, sans-serif" }}>Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-500"
                  value={nomComplet}
                  disabled
                  title="Modifiable depuis les paramètres du compte"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie de service</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-500 bg-gray-50 focus:bg-white appearance-none"
                  value={form.categorie_id}
                  onChange={(e) => setForm({ ...form, categorie_id: e.target.value })}
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-500 bg-gray-50 focus:bg-white appearance-none"
                  value={form.ville}
                  onChange={(e) => setForm({ ...form, ville: e.target.value })}
                >
                  <option value="">Sélectionnez une ville</option>
                  {VILLES_TOGO.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Biographie</label>
              <textarea
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-500 transition-colors bg-gray-50 focus:bg-white resize-none"
                value={form.biographie}
                onChange={(e) => setForm({ ...form, biographie: e.target.value })}
              />
              <p className="text-gray-400 text-xs mt-1 text-right">{form.biographie.length}/2000 caractères</p>
            </div>
          </div>

          {/* Tarifs */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-5" style={{ fontFamily: "Sora, sans-serif" }}>Tarifs (FCFA)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tarif minimum</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    className="w-full pl-4 pr-16 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-500 bg-gray-50 focus:bg-white"
                    value={form.tarif_min}
                    onChange={(e) => setForm({ ...form, tarif_min: e.target.value })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">FCFA</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tarif maximum</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    className="w-full pl-4 pr-16 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-500 bg-gray-50 focus:bg-white"
                    value={form.tarif_max}
                    onChange={(e) => setForm({ ...form, tarif_max: e.target.value })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Disponibilité */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "Sora, sans-serif" }}>Disponibilité</h2>
            <p className="text-gray-500 text-sm mb-4">
              Indiquez si vous acceptez actuellement de nouvelles demandes de prestation.
            </p>
            <button
              onClick={() => setForm({ ...form, disponibilite: !form.disponibilite })}
              className={`px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all ${
                form.disponibilite
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              {form.disponibilite ? "Disponible" : "Non disponible"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}