import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/src/index.jsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js/src',
        },
    },
    // ✅ Force Vite à écouter explicitement en IPv4 (127.0.0.1), et force
    // le script HMR injecté dans le HTML à pointer vers cette même
    // adresse. Sans ça, sous Windows, "localhost" peut se résoudre en
    // IPv6 ([::1]) côté navigateur alors que Vite écoute en IPv4 -> le
    // navigateur essaie de charger les assets sur une adresse où rien
    // n'écoute, connexion refusée, page blanche (React ne monte jamais).
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: {
            host: '127.0.0.1',
        },
    },
    build: {
        rollupOptions: {
            output: {
                // ── Sans ça, Rollup extrait automatiquement chaque
                // dépendance partagée entre plusieurs pages "lazy" (ex:
                // les icônes lucide-react) dans son propre petit fichier
                // séparé -> des dizaines de mini-requêtes HTTP au lieu
                // d'un chargement groupé. On force ici tout le code venant
                // de node_modules à rester dans UN SEUL fichier "vendor",
                // chargé une fois et mis en cache par le navigateur.
                // Les pages elles-mêmes restent bien splittées séparément
                // (le lazy loading par route continue de fonctionner).
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                },
            },
        },
    },
});